import { describe, expect, it } from 'vitest'

import { loadProfile } from '~/server/profile.server'

import { computeStats } from './stats'

const base = {
  projects: [{ technologies: ['React', 'Vite'] }],
  skills: [{ name: 'Gleam' }],
} as Parameters<typeof computeStats>[0]

describe('computeStats', () => {
  it('derives totals from the experience', () => {
    const stats = computeStats(
      {
        ...base,
        experience: [
          {
            company: 'B',
            start: '2020-01',
            end: '2024-06',
            roles: [{ title: 'x', summary: 'x', technologies: ['React', 'TypeScript'] }],
          },
          {
            company: 'A',
            start: '2012-04',
            end: '2019-12',
            roles: [
              { title: 'y', summary: 'y', technologies: ['React', 'react'] },
              { title: 'z', summary: 'z', technologies: ['Java'] },
            ],
          },
        ],
      },
      '2026-11',
    )

    expect(stats).toMatchObject({ yearsExperience: 12, companies: 2, roles: 3, projects: 1 })
    // React (3 roles, de-duplicated within a role, + 1 project), then alphabetical ties.
    expect(stats.topTechnologies.map((tech) => [tech.name, tech.count])).toEqual([
      ['React', 3],
      ['Java', 1],
      ['TypeScript', 1],
      ['Vite', 1],
    ])
    // React, TypeScript, Java, Vite + the Gleam skill.
    expect(stats.technologies).toBe(5)
  })

  it('counts open-ended jobs up to `now`', () => {
    const stats = computeStats(
      {
        ...base,
        experience: [
          {
            company: 'A',
            start: '2020-01',
            roles: [{ title: 'x', summary: 'x', technologies: ['React'] }],
          },
        ],
      },
      '2024-12',
    )
    expect(stats.yearsExperience).toBe(5)
  })

  it('summarizes the real profile', () => {
    const stats = computeStats(loadProfile(), '2026-11')
    // Apr 2012 through the current role, still open in Nov 2026.
    expect(stats.yearsExperience).toBe(14)
    expect(stats.companies).toBe(4)
    expect(stats.topTechnologies[0]).toMatchObject({ name: 'TypeScript', icon: 'typescript' })
  })
})
