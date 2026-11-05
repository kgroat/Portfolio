import type { CSSProperties } from 'react'

import { TechChip } from '~/components/TechChip'
import type { IconKey } from '~/content/icons'
import type { Job, YearMonth } from '~/content/schema'
import { formatDuration, formatRange, monthsInRange } from '~/lib/dates'
import { sceneAttributes } from '~/lib/particles/engine'
import type { Visual } from '~/server/profile.server'

import { SectionHeading } from './Section'

interface ExperienceProps {
  experience: Job[]
  roleVisuals: Array<Visual | undefined>
  techIcons: Record<string, IconKey>
  now: YearMonth
  years: number
}

const fallbackVisual: Visual = { icon: 'monogram', color: '#ceabff' }

export function Experience({ experience, roleVisuals, techIcons, now, years }: ExperienceProps) {
  // Visuals are flattened across jobs; find where each job's roles start.
  const firstRoleIndex = experience.map((_, jobIndex) =>
    experience.slice(0, jobIndex).reduce((total, job) => total + job.roles.length, 0),
  )

  return (
    <section
      id="experience"
      aria-labelledby="experience-title"
      className="relative px-6 py-32 sm:px-10 lg:px-16"
    >
      <div className="max-w-2xl lg:max-w-[50%]">
        <SectionHeading
          index="02"
          kicker="Experience"
          title={<span id="experience-title">{years} years, one through-line.</span>}
        >
          From pension systems and citizenship tools to ad-tech gateways, survey platforms, and AI
          search visibility — always the person pushing for code the next engineer will thank us
          for.
        </SectionHeading>

        <div className="mt-20 space-y-28">
          {experience.map((job, jobIndex) => (
            <article key={job.company} aria-label={job.company} className="relative">
              <header className="glass sticky top-20 z-10 -mx-3 rounded-2xl px-5 py-4">
                <h3 className="font-display text-2xl font-bold tracking-tight text-mist-100 sm:text-3xl">
                  {job.company}
                </h3>
                <p className="mt-1 font-mono text-xs tracking-wider text-mist-400 uppercase">
                  {formatRange(job.start, job.end, 'long')} ·{' '}
                  {formatDuration(monthsInRange(job.start, job.end ?? now))}
                </p>
              </header>

              <ol className="relative mt-10 space-y-[12vh] border-l border-mist-100/10 pl-6 sm:pl-8">
                {job.roles.map((role, index) => {
                  const visual =
                    roleVisuals[(firstRoleIndex[jobIndex] ?? 0) + index] ?? fallbackVisual
                  return (
                    <li
                      key={role.title}
                      className="scene-card reveal glass relative rounded-2xl p-6 sm:p-7"
                      style={{ '--scene-color': visual.color } as CSSProperties}
                      {...sceneAttributes({
                        shape: `icon:${visual.icon}`,
                        color: visual.color,
                        placement: 'right',
                      })}
                    >
                      <span
                        aria-hidden
                        className="absolute top-8 -left-[calc(1.5rem+5px)] size-2.5 rounded-full ring-4 ring-night-950 sm:-left-[calc(2rem+5px)]"
                        style={{ backgroundColor: visual.color }}
                      />
                      <h4 className="text-lg font-semibold text-mist-100">{role.title}</h4>
                      <p className="mt-3 leading-relaxed text-mist-300">{role.summary}</p>
                      <ul aria-label="Technologies" className="mt-5 flex flex-wrap gap-1.5">
                        {role.technologies.map((tech) => (
                          <TechChip key={tech} name={tech} icon={techIcons[tech]} />
                        ))}
                      </ul>
                    </li>
                  )
                })}
              </ol>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
