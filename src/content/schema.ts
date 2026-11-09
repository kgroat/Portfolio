import { z } from 'zod'

import { skillCategories } from './categories'
import { iconKeys } from './icons'

/** A calendar month, stored as `YYYY-MM` so it's timezone-proof and serializable. */
export const yearMonthSchema = z
  .string()
  .regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Expected a calendar month formatted as YYYY-MM')

/** A calendar year, stored as `YYYY` for entries that are only known to year precision. */
export const yearSchema = z.string().regex(/^\d{4}$/, 'Expected a calendar year formatted as YYYY')

export const slugSchema = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Expected a lowercase, dash-separated slug')

export const iconKeySchema = z.enum(iconKeys)

/** Collapses the indentation/newlines of multi-line template strings into plain prose. */
const prose = z
  .string()
  .transform((value) => value.replaceAll(/\s+/g, ' ').trim())
  .pipe(z.string().min(1))

export const linkSchema = z.object({
  kind: z.enum(['github', 'gitlab', 'linkedin', 'email']),
  label: z.string().min(1),
  handle: z.string().min(1),
  url: z.url(),
})

export const roleSchema = z.object({
  title: z.string().min(1),
  summary: prose,
  technologies: z.array(z.string().min(1)).min(1),
})

export const jobSchema = z
  .object({
    company: z.string().min(1),
    start: yearMonthSchema,
    end: yearMonthSchema.optional(),
    roles: z.array(roleSchema).min(1),
  })
  .refine((job) => job.end === undefined || job.end >= job.start, {
    message: 'A job cannot end before it starts',
    path: ['end'],
  })

export const educationSchema = z
  .object({
    institution: z.string().min(1),
    degree: z.string().min(1),
    field: z.string().min(1),
    start: yearSchema,
    end: yearSchema,
  })
  .refine((education) => education.end >= education.start, {
    message: 'Education cannot end before it starts',
    path: ['end'],
  })

export const projectSchema = z.object({
  slug: slugSchema,
  name: z.string().min(1),
  status: z.enum(['live', 'in-progress']),
  summary: prose,
  url: z.url().optional(),
  repository: z.url().optional(),
  technologies: z.array(z.string().min(1)).min(1),
})

export const skillCategorySchema = z.enum(skillCategories)

export const skillSchema = z.object({
  slug: slugSchema,
  name: z.string().min(1),
  icon: iconKeySchema,
  category: skillCategorySchema,
  summary: prose,
})

export const profileSchema = z
  .object({
    name: z.string().min(1),
    headline: z.string().min(1),
    email: z.email(),
    url: z.url(),
    source: z.url(),
    summary: prose,
    principles: z.array(z.string().min(1)).min(1),
    links: z.array(linkSchema).min(1),
    experience: z.array(jobSchema).min(1),
    education: z.array(educationSchema),
    projects: z.array(projectSchema),
    skills: z.array(skillSchema).min(1),
  })
  .superRefine((profile, ctx) => {
    const seen = new Set<string>()
    for (const [index, skill] of profile.skills.entries()) {
      if (seen.has(skill.slug)) {
        ctx.addIssue({
          code: 'custom',
          message: `Duplicate skill slug "${skill.slug}"`,
          path: ['skills', index, 'slug'],
        })
      }
      seen.add(skill.slug)
    }

    const sorted = profile.experience.toSorted((a, b) => b.start.localeCompare(a.start))
    if (sorted.some((job, index) => job !== profile.experience[index])) {
      ctx.addIssue({
        code: 'custom',
        message: 'Experience must be listed most-recent first',
        path: ['experience'],
      })
    }
  })

export type YearMonth = z.output<typeof yearMonthSchema>
export type ProfileInput = z.input<typeof profileSchema>
export type Profile = z.output<typeof profileSchema>
export type Link = z.output<typeof linkSchema>
export type Job = z.output<typeof jobSchema>
export type Role = z.output<typeof roleSchema>
export type Education = z.output<typeof educationSchema>
export type Project = z.output<typeof projectSchema>
export type Skill = z.output<typeof skillSchema>
export type { SkillCategory } from './categories'
