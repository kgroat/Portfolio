import { describe, expect, it } from 'vitest'

import { hexToRgb, relativeLuminance } from '~/lib/color'

import { loadProfile, loadProfileView, loadSkillSwatches } from './profile.server'

describe('loadProfileView', () => {
  const view = loadProfileView('2026-11')
  const roles = view.profile.experience.flatMap((job) => job.roles)

  it('provides one visual per role and per project', () => {
    expect(view.roleVisuals).toHaveLength(roles.length)
    expect(view.projectVisuals).toHaveLength(view.profile.projects.length)
  })

  it('features a different logo for consecutive items where possible', () => {
    const icons = [...view.roleVisuals, ...view.projectVisuals].map((visual) => visual?.icon)
    const repeats = icons.filter((icon, index) => index > 0 && icon === icons[index - 1])
    expect(repeats.length).toBeLessThanOrEqual(1)
  })

  it('makes every skill color visible on the dark background', () => {
    for (const color of Object.values(view.skillColors)) {
      expect(relativeLuminance(hexToRgb(color))).toBeGreaterThanOrEqual(0.18)
    }
  })

  it('maps technology chips to icons', () => {
    expect(view.techIcons).toMatchObject({ Vue: 'vue', 'Spring Boot': 'springboot' })
    expect(view.techIcons).not.toHaveProperty('Oracle IDCS')
  })
})

describe('loadSkillSwatches', () => {
  it('only exposes what the lab needs', () => {
    const swatches = loadSkillSwatches()
    expect(swatches).toHaveLength(loadProfile().skills.length)
    expect(Object.keys(swatches[0]!).toSorted()).toEqual(['color', 'icon', 'name', 'slug'])
  })
})
