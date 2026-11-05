import { z } from 'zod'

/**
 * Public repository activity from GitHub and GitLab, used by the streamed "recent work" section.
 *
 * Third-party APIs are slow and rate limited, so every request has a timeout, responses are
 * validated (external data is untrusted), results are cached in memory, and a failing source
 * degrades to an empty list instead of failing the page.
 */

export type ActivitySource = 'github' | 'gitlab'

export interface ActivityRepo {
  source: ActivitySource
  name: string
  url: string
  description: string | undefined
  language: string | undefined
  stars: number
  updatedAt: string
}

export interface ActivityFeed {
  repos: ActivityRepo[]
  sources: Record<ActivitySource, 'ok' | 'error'>
  fetchedAt: string
}

const githubRepoSchema = z.object({
  name: z.string(),
  html_url: z.url(),
  description: z.string().nullable(),
  language: z.string().nullable(),
  stargazers_count: z.number(),
  pushed_at: z.iso.datetime({ offset: true }),
  fork: z.boolean(),
  archived: z.boolean().default(false),
})

const gitlabProjectSchema = z.object({
  name: z.string(),
  web_url: z.url(),
  description: z.string().nullable(),
  star_count: z.number(),
  last_activity_at: z.iso.datetime({ offset: true }),
  archived: z.boolean().default(false),
  forked_from_project: z.unknown().optional(),
})

export interface FetchOptions {
  username: string
  token?: string
  timeoutMs?: number
  fetch?: typeof fetch
}

const blank = (value: string | null) => value?.trim() || undefined

async function getJson(url: string, init: RequestInit, options: FetchOptions): Promise<unknown> {
  const doFetch = options.fetch ?? fetch
  const response = await doFetch(url, {
    ...init,
    signal: AbortSignal.timeout(options.timeoutMs ?? 3000),
  })
  if (!response.ok) throw new Error(`${url} responded ${response.status}`)
  return response.json()
}

export async function fetchGithubRepos(options: FetchOptions): Promise<ActivityRepo[]> {
  const url = `https://api.github.com/users/${encodeURIComponent(options.username)}/repos?type=owner&sort=pushed&per_page=20`
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'kgroat-portfolio',
    'X-GitHub-Api-Version': '2022-11-28',
  }
  if (options.token) headers.Authorization = `Bearer ${options.token}`

  const repos = z.array(githubRepoSchema).parse(await getJson(url, { headers }, options))
  return repos
    .filter((repo) => !repo.fork && !repo.archived)
    .map((repo) => ({
      source: 'github',
      name: repo.name,
      url: repo.html_url,
      description: blank(repo.description),
      language: repo.language ?? undefined,
      stars: repo.stargazers_count,
      updatedAt: new Date(repo.pushed_at).toISOString(),
    }))
}

export async function fetchGitlabProjects(options: FetchOptions): Promise<ActivityRepo[]> {
  const url = `https://gitlab.com/api/v4/users/${encodeURIComponent(options.username)}/projects?order_by=last_activity_at&sort=desc&per_page=20&visibility=public`
  const headers: Record<string, string> = {}
  if (options.token) headers['PRIVATE-TOKEN'] = options.token

  const projects = z.array(gitlabProjectSchema).parse(await getJson(url, { headers }, options))
  return projects
    .filter((project) => !project.forked_from_project && !project.archived)
    .map((project) => ({
      source: 'gitlab',
      name: project.name,
      url: project.web_url,
      description: blank(project.description),
      language: undefined,
      stars: project.star_count,
      updatedAt: new Date(project.last_activity_at).toISOString(),
    }))
}

const repoKey = (name: string) => name.toLowerCase().replaceAll(/[^a-z0-9]/g, '')

/**
 * Merges repos from every source, newest first. Profile-README repos (named after the user) are
 * dropped, and a project mirrored on both hosts is only shown once (its most recent copy).
 */
export function mergeActivity(
  lists: ReadonlyArray<readonly ActivityRepo[]>,
  options: { limit: number; exclude?: readonly string[] },
): ActivityRepo[] {
  const excluded = new Set((options.exclude ?? []).map(repoKey))
  const newest = new Map<string, ActivityRepo>()
  for (const repo of lists.flat()) {
    const key = repoKey(repo.name)
    if (excluded.has(key)) continue
    const existing = newest.get(key)
    if (!existing || existing.updatedAt < repo.updatedAt) newest.set(key, repo)
  }
  return [...newest.values()]
    .toSorted((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, options.limit)
}

export interface ActivityLoaderOptions {
  fetchers: Record<ActivitySource, () => Promise<ActivityRepo[]>>
  exclude?: readonly string[]
  ttlMs?: number
  now?: () => number
}

/**
 * Creates a cached loader. Concurrent callers share one in-flight request, and a fresh result is
 * reused for `ttlMs`. Errors aren't cached for long, so a flaky API recovers quickly.
 */
export function createActivityLoader(options: ActivityLoaderOptions) {
  const ttl = options.ttlMs ?? 10 * 60_000
  const now = options.now ?? Date.now
  let cache: { feed: ActivityFeed; expiresAt: number } | undefined
  let inflight: Promise<ActivityFeed> | undefined

  async function load(): Promise<ActivityFeed> {
    const sources = Object.keys(options.fetchers) as ActivitySource[]
    const settled = await Promise.allSettled(sources.map((source) => options.fetchers[source]()))
    const status = {} as ActivityFeed['sources']
    const lists: ActivityRepo[][] = []
    for (const [index, result] of settled.entries()) {
      const source = sources[index] as ActivitySource
      status[source] = result.status === 'fulfilled' ? 'ok' : 'error'
      if (result.status === 'fulfilled') lists.push(result.value)
      else console.warn(`[activity] ${source} failed:`, result.reason)
    }
    return {
      repos: mergeActivity(lists, { limit: 12, exclude: options.exclude }),
      sources: status,
      fetchedAt: new Date(now()).toISOString(),
    }
  }

  return async function getFeed(limit: number): Promise<ActivityFeed> {
    if (!cache || cache.expiresAt <= now()) {
      inflight ??= load()
        .then((feed) => {
          const failed = Object.values(feed.sources).includes('error')
          cache = { feed, expiresAt: now() + (failed ? 60_000 : ttl) }
          return feed
        })
        .finally(() => {
          inflight = undefined
        })
      await inflight
    }
    const feed = cache?.feed
    if (!feed) throw new Error('Activity feed unavailable')
    return { ...feed, repos: feed.repos.slice(0, limit) }
  }
}

const USERNAME = 'kgroat'
let defaultLoader: ReturnType<typeof createActivityLoader> | undefined

/** The app's activity feed: both hosts, cached per server instance, tokens read per request. */
export function loadActivityFeed(
  limit: number,
  env: { GITHUB_TOKEN?: string; GITLAB_TOKEN?: string },
): Promise<ActivityFeed> {
  defaultLoader ??= createActivityLoader({
    exclude: [USERNAME],
    fetchers: {
      github: () => fetchGithubRepos({ username: USERNAME, token: env.GITHUB_TOKEN }),
      gitlab: () => fetchGitlabProjects({ username: USERNAME, token: env.GITLAB_TOKEN }),
    },
  })
  return defaultLoader(limit)
}
