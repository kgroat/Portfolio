import { describe, expect, it } from 'vitest'

import { loadProfile } from '~/server/profile.server'

import { displayUrl, toResumeModel } from './resume'

describe('displayUrl', () => {
  it.each([
    ['https://www.kgroat.dev', 'kgroat.dev'],
    ['https://planning.kgroat.dev/', 'planning.kgroat.dev'],
    ['https://www.linkedin.com/in/kevin-groat-62414b53/', 'linkedin.com/in/kevin-groat-62414b53'],
    ['mailto:apps@kgroat.dev', 'apps@kgroat.dev'],
  ])('%s → %s', (url, expected) => {
    expect(displayUrl(url)).toBe(expected)
  })
})

describe('toResumeModel', () => {
  const resume = toResumeModel(loadProfile(), '2026-11')

  it('leads with the website, then every profile link', () => {
    expect(resume.contacts.map((contact) => contact.label)).toEqual([
      'Website',
      'GitHub',
      'GitLab',
      'LinkedIn',
      'Email',
    ])
  })

  it('formats job dates and durations', () => {
    expect(resume.experience[1]).toMatchObject({
      company: 'Disqo',
      dates: 'Nov 2022 – Sep 2025',
      duration: '2 yrs 11 mos',
    })
  })

  it('counts the current role up to `now`', () => {
    expect(resume.experience[0]).toMatchObject({
      company: 'Brandi AI',
      dates: 'Nov 2025 – Present',
      duration: '1 yr 1 mo',
    })
    expect(toResumeModel(loadProfile(), '2026-04').experience[0]?.duration).toBe('6 mos')
  })

  it('groups skills by category in a stable order without losing any', () => {
    expect(resume.skills.map((group) => group.category)).toEqual([
      'Languages & frameworks',
      'Build & test',
      'Platform & delivery',
      'AI & agentic tools',
      'Tools & play',
    ])
    const count = resume.skills.reduce((total, group) => total + group.names.length, 0)
    expect(count).toBe(loadProfile().skills.length)
  })

  it('formats education with its credential and year range', () => {
    expect(resume.education).toEqual([
      {
        institution: 'University of Mary Washington',
        credential: "Bachelor's degree in Computer Science",
        dates: '2009 – 2013',
      },
    ])
  })

  it('flags in-progress projects', () => {
    const inProgress = resume.projects.filter((project) => project.inProgress)
    expect(inProgress.map((project) => project.name)).toEqual(['AI Game Master'])
  })
})
