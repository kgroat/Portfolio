import type { CSSProperties } from 'react'

import { BrandIcon } from '~/components/BrandIcon'
import { CountUp } from '~/components/CountUp'
import { sceneAttributes } from '~/lib/particles/engine'
import type { ProfileStats, TechUsage } from '~/lib/stats'

import { SectionHeading } from './Section'

interface AboutProps {
  name: string
  summary: string
  stats: ProfileStats
}

export function About({ name, summary, stats }: AboutProps) {
  const words = summary.split(' ')
  const tiles = [
    { value: stats.yearsExperience, suffix: '+', label: 'years shipping software' },
    { value: stats.companies, label: 'companies' },
    { value: stats.roles, label: 'teams & engagements' },
    // Rounded down: "60+" reads as a fact, "69" as false precision.
    { value: Math.floor(stats.technologies / 10) * 10, suffix: '+', label: 'technologies used' },
  ]

  return (
    <section
      id="about"
      aria-labelledby="about-title"
      className="relative px-6 py-32 sm:px-10 lg:px-16"
    >
      <div className="lg:ml-auto lg:max-w-[56%]">
        <SectionHeading
          index="01"
          kicker="About"
          title={<span id="about-title">Hi, I'm Kevin.</span>}
        />

        <p
          className="statement mt-10 font-display text-3xl leading-[1.25] font-medium tracking-tight text-mist-100 sm:text-4xl"
          {...sceneAttributes({
            shape: 'text:</>',
            color: '#ffd5ab',
            accent: '#ceabff',
            placement: 'left',
          })}
        >
          {words.map((word, index) => (
            <span
              // Words repeat, so the index is part of the identity here.
              // oxlint-disable-next-line react/no-array-index-key
              key={`${word}-${index}`}
              className="statement-word"
              style={{ '--p': index / words.length } as CSSProperties}
            >
              {word}{' '}
            </span>
          ))}
        </p>

        <div className="mt-16 grid gap-8 sm:grid-cols-[minmax(0,14rem)_1fr] sm:items-center">
          <div className="reveal relative mx-auto aspect-square w-56 sm:mx-0">
            <div
              aria-hidden
              className="blob absolute -inset-3 bg-linear-to-br from-lilac-300 to-peach-300 opacity-70 blur-xl"
            />
            <img
              src="/avatar.jpg"
              alt={`Portrait of ${name}`}
              width={720}
              height={720}
              loading="lazy"
              decoding="async"
              className="blob relative size-full object-cover"
            />
          </div>

          <dl className="grid grid-cols-2 gap-3">
            {tiles.map((tile) => (
              <div key={tile.label} className="reveal glass flex flex-col rounded-2xl p-5">
                <dt className="text-sm text-mist-400">{tile.label}</dt>
                <dd className="order-first text-4xl font-semibold tracking-tight text-mist-100">
                  <CountUp value={tile.value} suffix={tile.suffix} />
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <TopTechnologies items={stats.topTechnologies} total={stats.roles + stats.projects} />
      </div>
    </section>
  )
}

/** A single-series ranked bar list: how many roles and projects list each technology. */
function TopTechnologies({ items, total }: { items: TechUsage[]; total: number }) {
  const max = Math.max(...items.map((item) => item.count), 1)

  return (
    <figure className="reveal glass mt-8 rounded-3xl p-6 sm:p-8">
      <figcaption>
        <span className="block font-display text-xl font-semibold text-mist-100">
          Most reached-for
        </span>
        <span className="mt-1 block text-sm text-mist-400">
          Number of my {total} roles and projects that list each technology.
        </span>
      </figcaption>
      <ol className="mt-6 space-y-2.5">
        {items.map((item) => (
          <li
            key={item.name}
            // Focusable so keyboard users get the same detail as hover.
            // oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex
            tabIndex={0}
            className="group relative grid grid-cols-[minmax(0,9rem)_1fr] items-center gap-4 rounded-lg px-2 py-1 outline-none hover:bg-mist-100/4 focus-visible:bg-mist-100/6"
          >
            <span className="flex min-w-0 items-center gap-2 text-sm text-mist-200">
              {item.icon ? (
                <BrandIcon icon={item.icon} className="size-4 shrink-0 text-mist-400" />
              ) : null}
              <span className="truncate">{item.name}</span>
            </span>
            <span className="flex items-center gap-2">
              <span
                className="bar-fill h-2.5 rounded-r-[4px] bg-lilac-300 transition-colors group-hover:bg-peach-300 group-focus-visible:bg-peach-300"
                style={{ width: `calc((100% - 2.5rem) * ${item.count / max})` }}
              />
              <span className="text-sm font-medium text-mist-200">{item.count}</span>
            </span>
            <span
              role="tooltip"
              className="pointer-events-none absolute right-2 bottom-full z-10 mb-1 rounded-md bg-night-700 px-2 py-1 text-xs text-mist-100 opacity-0 shadow-lg transition group-hover:opacity-100 group-focus-visible:opacity-100"
            >
              In {item.count} of {total} roles &amp; projects
            </span>
          </li>
        ))}
      </ol>
    </figure>
  )
}
