import * as z from 'zod/mini'
import { catch as withFallback, _default as withDefault } from 'zod/mini'

/**
 * Search-param schemas for every route. These ship to the browser (the router validates search
 * params on the client too), so they use `zod/mini`, and live apart from the content schema so
 * the client never pulls that in.
 */

const slug = z.string().check(z.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/))

export const paperSizes = ['letter', 'a4'] as const
export type PaperSize = (typeof paperSizes)[number]

/** `/` — `?skill=react` deep-links (and scrolls) to a skill. Bad values are dropped, not fatal. */
export const homeSearchSchema = z.object({
  skill: withFallback(z.optional(slug), undefined),
})

/** `/resume` — paper size drives the print stylesheet and the matching PDF link. */
export const resumeSearchSchema = z.object({
  paper: withFallback(withDefault(z.enum(paperSizes), 'letter'), 'letter'),
})

/** `/lab` — which skill the particle playground starts on. */
export const labSearchSchema = z.object({
  shape: withFallback(z.optional(slug), undefined),
})

/** `/resume.pdf` — a public endpoint, so invalid input is a 400 rather than silently coerced. */
export const pdfSearchSchema = z.object({
  paper: withDefault(z.enum(paperSizes), 'letter'),
  download: withDefault(z.stringbool(), false),
})

export type HomeSearch = z.output<typeof homeSearchSchema>
export type ResumeSearch = z.output<typeof resumeSearchSchema>
export type LabSearch = z.output<typeof labSearchSchema>
export type PdfSearch = z.output<typeof pdfSearchSchema>

/** Parses URL search params (last value wins) against a schema. */
export function parseSearchParams<TSchema extends z.ZodMiniType>(
  schema: TSchema,
  params: URLSearchParams,
): ReturnType<TSchema['safeParse']> {
  return schema.safeParse(Object.fromEntries(params)) as ReturnType<TSchema['safeParse']>
}
