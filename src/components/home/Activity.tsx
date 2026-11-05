import { Await } from '@tanstack/react-router'

import { BrandIcon } from '~/components/BrandIcon'
import { formatIsoDate } from '~/lib/dates'
import { sceneAttributes } from '~/lib/particles/engine'
import type { ActivityFeed } from '~/server/activity.server'

import { SectionHeading } from './Section'

interface ActivityProps {
  /** Deferred: the page streams before this resolves. */
  feed: Promise<ActivityFeed | null>
  links: { github: string; gitlab: string }
}

export function Activity({ feed, links }: ActivityProps) {
  return (
    <section
      id="activity"
      aria-labelledby="activity-title"
      className="relative px-6 py-32 sm:px-10 lg:px-16"
      {...sceneAttributes({
        shape: 'scatter',
        color: '#ceabff',
        accent: '#ffd5ab',
        placement: 'full',
      })}
    >
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          index="05"
          kicker="Live"
          title={<span id="activity-title">Fresh off the workbench.</span>}
        >
          Public repositories from GitHub and GitLab, fetched on the server and streamed into this
          page after the rest of it was already on your screen.
        </SectionHeading>

        <Await promise={feed} fallback={<ActivitySkeleton />}>
          {(data) => <ActivityGrid feed={data} links={links} />}
        </Await>
      </div>
    </section>
  )
}

function ActivitySkeleton() {
  return (
    <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
      <span className="sr-only">Loading recent repositories…</span>
      {Array.from({ length: 6 }, (_, index) => (
        <div key={index} className="glass h-40 animate-pulse rounded-2xl" />
      ))}
    </div>
  )
}

function ActivityGrid({
  feed,
  links,
}: {
  feed: ActivityFeed | null
  links: ActivityProps['links']
}) {
  if (!feed || feed.repos.length === 0) {
    return (
      <p className="glass mt-14 rounded-2xl p-6 text-mist-300">
        The code hosts didn't answer in time, but you can browse everything on{' '}
        <a className="text-lilac-300 underline" href={links.github}>
          GitHub
        </a>{' '}
        and{' '}
        <a className="text-lilac-300 underline" href={links.gitlab}>
          GitLab
        </a>
        .
      </p>
    )
  }

  return (
    <>
      <ul className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {feed.repos.map((repo) => (
          <li key={repo.url} className="reveal">
            <a
              href={repo.url}
              target="_blank"
              rel="noreferrer"
              className="glass group flex h-full flex-col rounded-2xl p-5 transition hover:-translate-y-1 hover:border-lilac-300/40"
            >
              <span className="flex items-center justify-between gap-3">
                <span className="truncate font-mono text-sm font-medium text-mist-100">
                  {repo.name}
                </span>
                <BrandIcon
                  icon={repo.source}
                  title={repo.source === 'github' ? 'GitHub' : 'GitLab'}
                  className="size-4 shrink-0 text-mist-400 transition group-hover:text-mist-100"
                />
              </span>
              <span className="mt-3 line-clamp-3 flex-1 text-sm text-mist-300">
                {repo.description ?? 'No description — the code speaks for itself.'}
              </span>
              <span className="mt-4 flex items-center gap-3 font-mono text-xs text-mist-400">
                {repo.language ? <span>{repo.language}</span> : null}
                {repo.stars > 0 ? <span>★ {repo.stars}</span> : null}
                <span className="ml-auto">Updated {formatIsoDate(repo.updatedAt)}</span>
              </span>
            </a>
          </li>
        ))}
      </ul>
      <p className="mt-6 font-mono text-xs text-mist-400">
        Fetched {formatIsoDate(feed.fetchedAt)}
        {Object.values(feed.sources).includes('error')
          ? ' · one source was unavailable, showing what came back'
          : ''}
      </p>
    </>
  )
}
