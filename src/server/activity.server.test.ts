import { describe, expect, it, vi } from 'vitest'
import { ZodError } from 'zod'

import {
  type ActivityRepo,
  createActivityLoader,
  fetchGithubRepos,
  fetchGitlabProjects,
  mergeActivity,
} from './activity.server'

type Fetcher = () => Promise<ActivityRepo[]>

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })

const githubRepo = (overrides: Record<string, unknown> = {}) => ({
  name: 'ruths-cats',
  html_url: 'https://github.com/kgroat/ruths-cats',
  description: 'Cats!',
  language: 'TypeScript',
  stargazers_count: 2,
  pushed_at: '2026-10-22T03:26:50Z',
  fork: false,
  archived: false,
  ...overrides,
})

const gitlabProject = (overrides: Record<string, unknown> = {}) => ({
  name: 'Cypress iframe',
  web_url: 'https://gitlab.com/kgroat/cypress-iframe',
  description: '  ',
  star_count: 13,
  last_activity_at: '2025-07-26T18:32:47.098Z',
  archived: false,
  ...overrides,
})

const repo = (
  name: string,
  updatedAt: string,
  source: ActivityRepo['source'] = 'github',
): ActivityRepo => ({
  source,
  name,
  url: `https://example.com/${name}`,
  description: undefined,
  language: undefined,
  stars: 0,
  updatedAt,
})

describe('fetchGithubRepos', () => {
  it('normalizes repos and drops forks and archived ones', async () => {
    const fetch = vi.fn<typeof globalThis.fetch>(async () =>
      json([
        githubRepo(),
        githubRepo({ name: 'forked', fork: true }),
        githubRepo({ name: 'old', archived: true }),
      ]),
    )

    const repos = await fetchGithubRepos({ username: 'kgroat', token: 'secret', fetch })

    expect(repos).toEqual([
      {
        source: 'github',
        name: 'ruths-cats',
        url: 'https://github.com/kgroat/ruths-cats',
        description: 'Cats!',
        language: 'TypeScript',
        stars: 2,
        updatedAt: '2026-10-22T03:26:50.000Z',
      },
    ])
    const [url, init] = fetch.mock.calls[0]!
    expect(String(url)).toContain('/users/kgroat/repos')
    expect(new Headers(init?.headers).get('Authorization')).toBe('Bearer secret')
    expect(init?.signal).toBeInstanceOf(AbortSignal)
  })

  it('throws on HTTP errors and malformed payloads', async () => {
    await expect(
      fetchGithubRepos({ username: 'kgroat', fetch: async () => json({}, 403) }),
    ).rejects.toThrow('403')
    await expect(
      fetchGithubRepos({ username: 'kgroat', fetch: async () => json([{ name: 1 }]) }),
    ).rejects.toThrow(ZodError)
  })
})

describe('fetchGitlabProjects', () => {
  it('normalizes projects, treating blank descriptions as missing', async () => {
    const fetch = vi.fn<typeof globalThis.fetch>(async () =>
      json([gitlabProject(), gitlabProject({ name: 'fork', forked_from_project: { id: 1 } })]),
    )

    const repos = await fetchGitlabProjects({ username: 'kgroat', fetch })

    expect(repos).toEqual([
      expect.objectContaining({ source: 'gitlab', name: 'Cypress iframe', description: undefined }),
    ])
    expect(new Headers(fetch.mock.calls[0]![1]?.headers).has('PRIVATE-TOKEN')).toBe(false)
  })
})

describe('mergeActivity', () => {
  it('sorts newest first, de-duplicates mirrors, applies exclusions and limits', () => {
    const merged = mergeActivity(
      [
        [
          repo('Portfolio', '2025-09-25T00:00:00.000Z', 'gitlab'),
          repo('a', '2024-01-01T00:00:00.000Z'),
        ],
        [repo('portfolio', '2026-11-01T00:00:00.000Z'), repo('kgroat', '2026-12-01T00:00:00.000Z')],
      ],
      { limit: 5, exclude: ['kgroat'] },
    )

    expect(merged.map((r) => [r.source, r.name])).toEqual([
      ['github', 'portfolio'],
      ['github', 'a'],
    ])
    expect(mergeActivity([[repo('a', '1'), repo('b', '2')]], { limit: 1 })).toHaveLength(1)
  })
})

describe('createActivityLoader', () => {
  it('shares in-flight requests and caches results until the TTL expires', async () => {
    let now = 0
    const github = vi.fn<Fetcher>(async () => [repo('a', '2026-01-01T00:00:00.000Z')])
    const gitlab = vi.fn<Fetcher>(async () => [repo('b', '2026-02-01T00:00:00.000Z', 'gitlab')])
    const load = createActivityLoader({ fetchers: { github, gitlab }, ttlMs: 1000, now: () => now })

    const [first, second] = await Promise.all([load(6), load(1)])
    expect(github).toHaveBeenCalledTimes(1)
    expect(first.repos.map((r) => r.name)).toEqual(['b', 'a'])
    expect(second.repos).toHaveLength(1)
    expect(first.sources).toEqual({ github: 'ok', gitlab: 'ok' })

    now = 999
    await load(6)
    expect(github).toHaveBeenCalledTimes(1)

    now = 1000
    await load(6)
    expect(github).toHaveBeenCalledTimes(2)
  })

  it('degrades gracefully when a source fails, and retries sooner', async () => {
    let now = 0
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    const github = vi.fn<Fetcher>(async () => {
      throw new Error('rate limited')
    })
    const gitlab = vi.fn<Fetcher>(async () => [repo('b', '2026-02-01T00:00:00.000Z', 'gitlab')])
    const load = createActivityLoader({
      fetchers: { github, gitlab },
      ttlMs: 10 * 60_000,
      now: () => now,
    })

    const feed = await load(6)
    expect(feed.sources).toEqual({ github: 'error', gitlab: 'ok' })
    expect(feed.repos.map((r) => r.name)).toEqual(['b'])

    now = 60_000
    await load(6)
    expect(github).toHaveBeenCalledTimes(2)
  })
})
