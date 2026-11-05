import { describe, expect, it } from 'vitest'

import {
  homeSearchSchema,
  labSearchSchema,
  parseSearchParams,
  pdfSearchSchema,
  resumeSearchSchema,
} from './search'

describe('route search schemas', () => {
  it('accepts a skill slug on the home page and drops invalid ones', () => {
    expect(homeSearchSchema.parse({ skill: 'react-query' })).toEqual({ skill: 'react-query' })
    expect(homeSearchSchema.parse({ skill: 'Not A Slug' })).toEqual({ skill: undefined })
    expect(homeSearchSchema.parse({ skill: 42 })).toEqual({ skill: undefined })
    expect(homeSearchSchema.parse({})).toEqual({})
  })

  it('defaults and coerces the résumé paper size', () => {
    expect(resumeSearchSchema.parse({})).toEqual({ paper: 'letter' })
    expect(resumeSearchSchema.parse({ paper: 'a4' })).toEqual({ paper: 'a4' })
    expect(resumeSearchSchema.parse({ paper: 'tabloid' })).toEqual({ paper: 'letter' })
  })

  it('validates the lab shape', () => {
    expect(labSearchSchema.parse({ shape: 'vite' })).toEqual({ shape: 'vite' })
    expect(labSearchSchema.parse({ shape: '../etc' })).toEqual({ shape: undefined })
  })
})

describe('pdf search params', () => {
  const parse = (query: string) => parseSearchParams(pdfSearchSchema, new URLSearchParams(query))

  it('has sensible defaults', () => {
    expect(parse('').data).toEqual({ paper: 'letter', download: false })
  })

  it('parses paper size and boolean-ish download flags', () => {
    expect(parse('paper=a4&download=1').data).toEqual({ paper: 'a4', download: true })
    expect(parse('download=true').data).toEqual({ paper: 'letter', download: true })
    expect(parse('download=false').data).toEqual({ paper: 'letter', download: false })
  })

  it('rejects invalid input instead of guessing (it is a public endpoint)', () => {
    expect(parse('paper=tabloid').success).toBe(false)
    expect(parse('download=maybe').success).toBe(false)
  })
})
