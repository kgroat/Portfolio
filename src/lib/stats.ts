import type { IconKey } from '~/content/icons'
import type { Profile, YearMonth } from '~/content/schema'

import { monthsInRange } from './dates'
import { iconForTech, normalizeTech } from './tech'

export interface TechUsage {
  name: string
  /** How many roles and projects list this technology. */
  count: number
  icon: IconKey | undefined
}

export interface ProfileStats {
  yearsExperience: number
  companies: number
  roles: number
  projects: number
  technologies: number
  topTechnologies: TechUsage[]
}

/**
 * Derives headline numbers from the profile. `now` is only consulted for open-ended jobs, and is
 * passed in (rather than read) so the result is deterministic on server and client.
 */
export function computeStats(
  profile: Pick<Profile, 'experience' | 'projects' | 'skills'>,
  now: YearMonth,
  topCount = 8,
): ProfileStats {
  const starts = profile.experience.map((job) => job.start)
  const ends = profile.experience.map((job) => job.end ?? now)
  const earliest = starts.toSorted()[0]
  const latest = ends.toSorted().at(-1)
  const totalMonths = earliest && latest ? monthsInRange(earliest, latest) : 0

  const usage = new Map<string, TechUsage>()
  const tally = (technologies: readonly string[]) => {
    // Count each technology once per role/project, even if it's listed twice with different casing.
    const unique = new Map(technologies.map((name) => [normalizeTech(name), name]))
    for (const [key, name] of unique) {
      const entry = usage.get(key)
      if (entry) entry.count += 1
      else usage.set(key, { name, count: 1, icon: iconForTech(name) })
    }
  }

  const roles = profile.experience.flatMap((job) => job.roles)
  for (const role of roles) tally(role.technologies)
  for (const project of profile.projects) tally(project.technologies)

  const known = new Set(usage.keys())
  for (const skill of profile.skills) known.add(normalizeTech(skill.name))

  const topTechnologies = [...usage.values()]
    .toSorted((a, b) => b.count - a.count || a.name.localeCompare(b.name))
    .slice(0, topCount)

  return {
    yearsExperience: Math.floor(totalMonths / 12),
    companies: profile.experience.length,
    roles: roles.length,
    projects: profile.projects.length,
    technologies: known.size,
    topTechnologies,
  }
}
