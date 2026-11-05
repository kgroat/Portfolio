import { Link } from '@tanstack/react-router'
import { type CSSProperties, useEffect } from 'react'

import { BrandIcon } from '~/components/BrandIcon'
import { skillCategories, skillCategoryLabels } from '~/content/categories'
import type { Skill } from '~/content/schema'
import { cn } from '~/lib/cn'
import { sceneAttributes } from '~/lib/particles/engine'

import { SectionHeading } from './Section'

interface SkillsProps {
  skills: Skill[]
  colors: Record<string, string>
  /** The skill deep-linked via `?skill=`, if it exists. */
  selected: string | undefined
}

export const skillElementId = (slug: string) => `skill-${slug}`

export function Skills({ skills, colors, selected }: SkillsProps) {
  // Deep links: scroll the selected skill to the middle of the screen, where the particles
  // finish morphing into its logo.
  useEffect(() => {
    if (!selected) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    document
      .getElementById(skillElementId(selected))
      ?.scrollIntoView({ block: 'center', behavior: reduced ? 'auto' : 'smooth' })
  }, [selected])

  return (
    <section
      id="skills"
      aria-labelledby="skills-title"
      className="relative px-6 py-32 sm:px-10 lg:px-16"
    >
      <div className="lg:ml-auto lg:max-w-[50%]">
        <SectionHeading
          index="04"
          kicker="Skills"
          title={<span id="skills-title">The toolbelt, in my own words.</span>}
        >
          Keep scrolling and the particles take the shape of each tool. Every skill has its own
          link, so you can share one directly.
        </SectionHeading>

        <nav aria-label="Jump to a skill" className="reveal mt-10">
          <ul className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <li key={skill.slug}>
                <Link
                  to="/"
                  search={{ skill: skill.slug }}
                  resetScroll={false}
                  replace
                  aria-label={skill.name}
                  title={skill.name}
                  className={cn(
                    'grid size-11 place-items-center rounded-xl border border-mist-100/10 bg-night-900/70 text-mist-300 transition hover:-translate-y-0.5 hover:border-mist-100/30 hover:text-mist-100',
                    selected === skill.slug && 'border-peach-300/60 text-mist-100',
                  )}
                >
                  <BrandIcon icon={skill.icon} className="size-5" />
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {skillCategories.map((category) => {
          const members = skills.filter((skill) => skill.category === category)
          if (members.length === 0) return null
          return (
            <div key={category} className="mt-24">
              <h3 className="reveal font-mono text-xs tracking-[0.2em] text-peach-300 uppercase">
                {skillCategoryLabels[category]}
              </h3>
              <ul className="mt-6 space-y-[6vh]">
                {members.map((skill) => {
                  const color = colors[skill.slug] ?? '#ceabff'
                  return (
                    <li
                      key={skill.slug}
                      id={skillElementId(skill.slug)}
                      className={cn(
                        'scene-card skill-row rounded-2xl border border-transparent p-6',
                        selected === skill.slug && 'ring-1 ring-peach-300/50',
                      )}
                      style={{ '--scene-color': color } as CSSProperties}
                      {...sceneAttributes({
                        shape: `icon:${skill.icon}`,
                        color,
                        placement: 'left',
                      })}
                    >
                      <div className="flex items-center gap-4">
                        <span
                          className="grid size-12 shrink-0 place-items-center rounded-xl bg-night-800"
                          style={{ color }}
                        >
                          <BrandIcon icon={skill.icon} className="size-6" />
                        </span>
                        <h4 className="font-display text-2xl font-semibold tracking-tight text-mist-100">
                          <Link
                            to="/"
                            search={{ skill: skill.slug }}
                            resetScroll={false}
                            replace
                            className="hover:underline hover:decoration-mist-100/30 hover:underline-offset-4"
                          >
                            {skill.name}
                          </Link>
                        </h4>
                      </div>
                      <p className="mt-4 leading-relaxed text-mist-300">{skill.summary}</p>
                    </li>
                  )
                })}
              </ul>
            </div>
          )
        })}
      </div>
    </section>
  )
}
