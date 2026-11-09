import { skillCategoryLabels } from '~/content/categories'
import type { Profile } from '~/content/schema'

/**
 * A subset of the JSON Resume schema (https://jsonresume.org/schema), so the résumé can be
 * consumed by the JSON Resume ecosystem (themes, CLI exporters, ATS importers).
 */
export interface JsonResume {
  $schema: string
  basics: {
    name: string
    label: string
    email: string
    url: string
    summary: string
    profiles: Array<{ network: string; username: string; url: string }>
  }
  work: Array<{
    name: string
    position: string
    startDate: string
    endDate?: string
    summary: string
    highlights: string[]
  }>
  education: Array<{
    institution: string
    area: string
    studyType: string
    startDate: string
    endDate: string
  }>
  projects: Array<{
    name: string
    description: string
    url?: string
    keywords: string[]
  }>
  skills: Array<{ name: string; keywords: string[] }>
  meta: { canonical: string; version: string }
}

export const JSON_RESUME_SCHEMA =
  'https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json'

export function toJsonResume(profile: Profile): JsonResume {
  return {
    $schema: JSON_RESUME_SCHEMA,
    basics: {
      name: profile.name,
      label: profile.headline,
      email: profile.email,
      url: profile.url,
      summary: profile.summary,
      profiles: profile.links
        .filter((link) => link.kind !== 'email')
        .map((link) => ({ network: link.label, username: link.handle, url: link.url })),
    },
    work: profile.experience.flatMap((job) =>
      job.roles.map((role) => ({
        name: job.company,
        position: role.title,
        startDate: job.start,
        ...(job.end ? { endDate: job.end } : {}),
        summary: role.summary,
        highlights: role.technologies,
      })),
    ),
    education: profile.education.map((education) => ({
      institution: education.institution,
      area: education.field,
      studyType: education.degree,
      startDate: education.start,
      endDate: education.end,
    })),
    projects: profile.projects.map((project) => ({
      name: project.name,
      description: project.summary,
      ...(project.url ? { url: project.url } : {}),
      keywords: project.technologies,
    })),
    skills: Object.entries(skillCategoryLabels)
      .map(([category, label]) => ({
        name: label,
        keywords: profile.skills
          .filter((skill) => skill.category === category)
          .map((skill) => skill.name),
      }))
      .filter((group) => group.keywords.length > 0),
    meta: {
      canonical: new URL('/resume.json', profile.url).href,
      version: 'v1.0.0',
    },
  }
}
