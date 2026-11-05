import { describe, expect, it } from 'vitest'

import { iconForTech, normalizeTech, pickFeaturedIcons } from './tech'

describe('normalizeTech', () => {
  it('ignores case, spaces and punctuation but keeps # and +', () => {
    expect(normalizeTech('Spring Boot')).toBe('springboot')
    expect(normalizeTech('Next.js')).toBe('nextjs')
    expect(normalizeTech('C#')).toBe('c#')
  })
})

describe('iconForTech', () => {
  it('maps technology names to icons', () => {
    expect(iconForTech('TypeScript')).toBe('typescript')
    expect(iconForTech('React Native')).toBe('react')
    expect(iconForTech('ASP.NET')).toBe('dotnet')
    expect(iconForTech('Argo Workflows')).toBe('argo')
  })

  it('returns undefined for technologies without an icon', () => {
    expect(iconForTech('Oracle IDCS')).toBeUndefined()
  })
})

describe('pickFeaturedIcons', () => {
  it('prefers icons that have not been featured yet', () => {
    expect(
      pickFeaturedIcons([
        { technologies: ['React', 'TypeScript'] },
        { technologies: ['React', 'TypeScript', 'Java'] },
        { technologies: ['React', 'TypeScript', 'Java'] },
      ]),
    ).toEqual(['react', 'typescript', 'java'])
  })

  it('falls back to the first icon when everything is taken', () => {
    expect(
      pickFeaturedIcons([{ technologies: ['C#', 'ASP.NET'] }, { technologies: ['C#', 'ASP.NET'] }]),
    ).toEqual(['dotnet', 'dotnet'])
  })

  it('returns undefined for items with no iconified technology', () => {
    expect(pickFeaturedIcons([{ technologies: ['Oracle IDCS', 'MS SQL'] }])).toEqual([undefined])
  })
})
