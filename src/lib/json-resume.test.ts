import { describe, expect, it } from 'vitest'

import { loadProfile } from '~/server/profile.server'

import { toJsonResume } from './json-resume'

describe('toJsonResume', () => {
  const profile = loadProfile()
  const resume = toJsonResume(profile)

  it('fills in basics and excludes email from social profiles', () => {
    expect(resume.basics).toMatchObject({ name: 'Kevin Groat', email: 'apps@kgroat.dev' })
    expect(resume.basics.profiles.map((p) => p.network)).toEqual(['GitHub', 'GitLab', 'LinkedIn'])
  })

  it('emits one work entry per role', () => {
    const roles = profile.experience.flatMap((job) => job.roles)
    expect(resume.work).toHaveLength(roles.length)
    expect(resume.work[1]).toMatchObject({
      name: 'Disqo',
      startDate: '2022-11',
      endDate: '2025-09',
    })
  })

  it('leaves endDate off the current role', () => {
    expect(resume.work[0]).toMatchObject({ name: 'Brandi AI', position: 'Staff Engineer' })
    expect(resume.work[0]).not.toHaveProperty('endDate')
  })

  it('maps education onto the JSON Resume fields', () => {
    expect(resume.education).toEqual([
      {
        institution: 'University of Mary Washington',
        area: 'Computer Science',
        studyType: "Bachelor's degree",
        startDate: '2009',
        endDate: '2013',
      },
    ])
  })

  it('omits urls for projects without one', () => {
    const gameMaster = resume.projects.find((project) => project.name === 'AI Game Master')
    expect(gameMaster).not.toHaveProperty('url')
  })

  it('points meta.canonical at the JSON endpoint', () => {
    expect(resume.meta.canonical).toBe('https://www.kgroat.dev/resume.json')
  })
})
