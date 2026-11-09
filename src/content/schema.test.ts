import { describe, expect, it } from 'vitest'

import { profileData } from '~/server/profile-data.server'

import { iconKeys } from './icons'
import { type ProfileInput, profileSchema } from './schema'

const clone = (): ProfileInput => structuredClone(profileData)

describe('profile data', () => {
  it('passes the schema', () => {
    const result = profileSchema.safeParse(profileData)
    expect(result.error?.issues).toBeUndefined()
  })

  it('collapses template-literal whitespace into prose', () => {
    const profile = profileSchema.parse(profileData)
    for (const text of [
      profile.summary,
      ...profile.skills.map((skill) => skill.summary),
      ...profile.projects.map((project) => project.summary),
    ]) {
      expect(text).not.toMatch(/\s{2,}|^\s|\s$/)
    }
  })

  it('only references icons that exist', () => {
    for (const skill of profileData.skills) expect(iconKeys).toContain(skill.icon)
  })
})

describe('profileSchema', () => {
  const issuePaths = (input: ProfileInput) =>
    (profileSchema.safeParse(input).error?.issues ?? []).map((issue) => issue.path.join('.'))

  it('rejects malformed months', () => {
    const input = clone()
    input.experience[0]!.start = '2022-13'
    expect(issuePaths(input)).toContain('experience.0.start')
  })

  it('rejects jobs that end before they start', () => {
    const input = clone()
    input.experience[0]!.end = '2001-01'
    expect(issuePaths(input)).toContain('experience.0.end')
  })

  it('rejects malformed education years', () => {
    const input = clone()
    input.education[0]!.start = '09'
    expect(issuePaths(input)).toContain('education.0.start')
  })

  it('rejects education that ends before it starts', () => {
    const input = clone()
    input.education[0]!.end = '2001'
    expect(issuePaths(input)).toContain('education.0.end')
  })

  it('rejects duplicate skill slugs', () => {
    const input = clone()
    input.skills[1]!.slug = input.skills[0]!.slug
    expect(issuePaths(input)).toContain('skills.1.slug')
  })

  it('requires experience to be most-recent first', () => {
    const input = clone()
    input.experience.reverse()
    expect(issuePaths(input)).toContain('experience')
  })

  it('rejects unknown icons and empty technology lists', () => {
    const input = clone()
    ;(input.skills[0] as { icon: string }).icon = 'not-an-icon'
    input.projects[0]!.technologies = []
    expect(issuePaths(input)).toEqual(
      expect.arrayContaining(['skills.0.icon', 'projects.0.technologies']),
    )
  })
})
