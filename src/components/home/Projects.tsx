import type { CSSProperties } from 'react'

import { TechChip } from '~/components/TechChip'
import type { IconKey } from '~/content/icons'
import type { Project } from '~/content/schema'
import { sceneAttributes } from '~/lib/particles/engine'
import type { Visual } from '~/server/profile.server'

import { SectionHeading } from './Section'

interface ProjectsProps {
  projects: Project[]
  visuals: Array<Visual | undefined>
  techIcons: Record<string, IconKey>
}

export function Projects({ projects, visuals, techIcons }: ProjectsProps) {
  return (
    <section
      id="projects"
      aria-labelledby="projects-title"
      className="relative px-6 py-32 sm:px-10 lg:px-16"
    >
      <div className="max-w-2xl lg:max-w-[50%]">
        <SectionHeading
          index="03"
          kicker="Projects"
          title={<span id="projects-title">Things I build for fun.</span>}
        >
          Side projects are where I try the ideas that later make it to work — one of them even made
          it to the Smithsonian.
        </SectionHeading>

        <div className="mt-20 space-y-[16vh]">
          {projects.map((project, index) => {
            const visual = visuals[index] ?? { icon: 'monogram', color: '#ffd5ab' }
            return (
              <div
                key={project.slug}
                className="reveal"
                {...sceneAttributes({
                  shape: `icon:${visual.icon}`,
                  color: visual.color,
                  placement: 'right',
                })}
              >
                <article
                  aria-labelledby={`project-${project.slug}`}
                  className="recede glass relative overflow-hidden rounded-3xl p-7 sm:p-9"
                  style={{ '--scene-color': visual.color } as CSSProperties}
                >
                  <div
                    aria-hidden
                    className="absolute -top-24 -right-24 size-56 rounded-full opacity-25 blur-3xl"
                    style={{ backgroundColor: visual.color }}
                  />
                  <p className="font-mono text-xs tracking-[0.2em] text-mist-400 uppercase">
                    {String(index + 1).padStart(2, '0')}
                    {project.status === 'in-progress' ? (
                      <span className="ml-3 rounded-full border border-peach-300/40 px-2 py-0.5 text-peach-300">
                        In progress
                      </span>
                    ) : null}
                  </p>
                  <h3
                    id={`project-${project.slug}`}
                    className="relative mt-3 font-display text-3xl font-bold tracking-tight text-mist-100 sm:text-4xl"
                  >
                    {project.name}
                  </h3>
                  <p className="relative mt-4 leading-relaxed text-mist-300">{project.summary}</p>
                  <ul aria-label="Technologies" className="relative mt-6 flex flex-wrap gap-1.5">
                    {project.technologies.map((tech) => (
                      <TechChip key={tech} name={tech} icon={techIcons[tech]} />
                    ))}
                  </ul>
                  {project.url || project.repository ? (
                    <div className="relative mt-7 flex flex-wrap gap-3 text-sm font-medium">
                      {project.url ? (
                        <a
                          href={project.url}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-full bg-mist-100 px-4 py-2 text-night-950 transition hover:bg-peach-300"
                        >
                          Visit site<span aria-hidden> ↗</span>
                        </a>
                      ) : null}
                      {project.repository ? (
                        <a
                          href={project.repository}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-full border border-mist-100/20 px-4 py-2 text-mist-100 transition hover:border-lilac-300"
                        >
                          Source<span aria-hidden> ↗</span>
                        </a>
                      ) : null}
                    </div>
                  ) : null}
                </article>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
