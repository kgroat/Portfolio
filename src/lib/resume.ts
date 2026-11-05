import { skillCategories, skillCategoryLabels } from '~/content/categories'
import type { Profile } from '~/content/schema'

import { formatDuration, formatRange, monthsInRange } from './dates'

export interface ResumeContact {
  label: string
  display: string
  url: string
}

export interface ResumeRole {
  title: string
  summary: string
  technologies: string[]
}

export interface ResumeJob {
  company: string
  dates: string
  duration: string
  roles: ResumeRole[]
}

export interface ResumeProject {
  name: string
  inProgress: boolean
  summary: string
  url: string | undefined
  displayUrl: string | undefined
  technologies: string[]
}

export interface ResumeSkillGroup {
  category: string
  names: string[]
}

/** A presentation-ready view of the profile shared by the HTML résumé and the PDF. */
export interface ResumeModel {
  name: string
  headline: string
  summary: string
  contacts: ResumeContact[]
  experience: ResumeJob[]
  projects: ResumeProject[]
  skills: ResumeSkillGroup[]
}

/** `https://www.kgroat.dev/` → `kgroat.dev`, `mailto:a@b.c` → `a@b.c`. */
export function displayUrl(url: string): string {
  if (url.startsWith('mailto:')) return url.slice('mailto:'.length)
  return url
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/$/, '')
}

export function toResumeModel(profile: Profile, now: string): ResumeModel {
  const contacts: ResumeContact[] = [
    { label: 'Website', display: displayUrl(profile.url), url: profile.url },
    ...profile.links.map((link) => ({
      label: link.label,
      display: displayUrl(link.url),
      url: link.url,
    })),
  ]

  return {
    name: profile.name,
    headline: profile.headline,
    summary: profile.summary,
    contacts,
    experience: profile.experience.map((job) => ({
      company: job.company,
      dates: formatRange(job.start, job.end),
      duration: formatDuration(monthsInRange(job.start, job.end ?? now)),
      roles: job.roles.map((role) => ({
        title: role.title,
        summary: role.summary,
        technologies: role.technologies,
      })),
    })),
    projects: profile.projects.map((project) => ({
      name: project.name,
      inProgress: project.status === 'in-progress',
      summary: project.summary,
      url: project.url,
      displayUrl: project.url ? displayUrl(project.url) : undefined,
      technologies: project.technologies,
    })),
    skills: skillCategories
      .map((category) => ({
        category: skillCategoryLabels[category],
        names: profile.skills
          .filter((skill) => skill.category === category)
          .map((skill) => skill.name),
      }))
      .filter((group) => group.names.length > 0),
  }
}
