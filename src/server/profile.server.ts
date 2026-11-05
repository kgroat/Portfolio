import { getIcon, type IconKey } from '~/content/icons'
import { type Profile, profileSchema, type YearMonth } from '~/content/schema'
import { ensureVisibleOnDark } from '~/lib/color'
import { toYearMonth } from '~/lib/dates'
import { computeStats, type ProfileStats } from '~/lib/stats'
import { iconForTech, pickFeaturedIcons } from '~/lib/tech'

import { profileData } from './profile-data.server'

let validated: Profile | undefined

/** The validated profile. Parsing happens once per server instance; bad data fails loudly. */
export function loadProfile(): Profile {
  validated ??= profileSchema.parse(profileData)
  return validated
}

export function currentYearMonth(): YearMonth {
  return toYearMonth(new Date())
}

export interface Visual {
  icon: IconKey
  color: string
}

const visualFor = (icon: IconKey | undefined): Visual | undefined =>
  icon ? { icon, color: ensureVisibleOnDark(getIcon(icon).hex) } : undefined

/** Everything the home page renders: the profile plus server-derived extras. */
export interface ProfileView {
  profile: Profile
  stats: ProfileStats
  /** One visual per role, in `experience[].roles[]` order (flattened). */
  roleVisuals: Array<Visual | undefined>
  /** One visual per project, in `projects` order. */
  projectVisuals: Array<Visual | undefined>
  /** Brand color per skill slug, adjusted for the dark theme. */
  skillColors: Record<string, string>
  /** Icon per technology name, for the tech chips. */
  techIcons: Record<string, IconKey>
  now: YearMonth
}

export function loadProfileView(now: YearMonth = currentYearMonth()): ProfileView {
  const profile = loadProfile()
  const roles = profile.experience.flatMap((job) => job.roles)
  const featured = pickFeaturedIcons([...roles, ...profile.projects])

  const techIcons: Record<string, IconKey> = {}
  for (const item of [...roles, ...profile.projects]) {
    for (const tech of item.technologies) {
      const icon = iconForTech(tech)
      if (icon) techIcons[tech] = icon
    }
  }

  return {
    profile,
    stats: computeStats(profile, now),
    roleVisuals: featured.slice(0, roles.length).map(visualFor),
    projectVisuals: featured.slice(roles.length).map(visualFor),
    skillColors: Object.fromEntries(
      profile.skills.map((skill) => [skill.slug, ensureVisibleOnDark(getIcon(skill.icon).hex)]),
    ),
    techIcons,
    now,
  }
}

/** The slimmer payload the /lab route needs: just enough to draw each skill. */
export interface SkillSwatch {
  slug: string
  name: string
  icon: IconKey
  color: string
}

export function loadSkillSwatches(): SkillSwatch[] {
  return loadProfile().skills.map((skill) => ({
    slug: skill.slug,
    name: skill.name,
    icon: skill.icon,
    color: ensureVisibleOnDark(getIcon(skill.icon).hex),
  }))
}
