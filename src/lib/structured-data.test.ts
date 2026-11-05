import { describe, expect, it } from 'vitest'

import { loadProfile } from '~/server/profile.server'

import { serializeJsonForScript, toPersonJsonLd } from './structured-data'

describe('structured data', () => {
  it('describes the person', () => {
    const jsonLd = toPersonJsonLd(loadProfile())
    expect(jsonLd).toMatchObject({ '@type': 'Person', name: 'Kevin Groat' })
    expect(jsonLd.sameAs).toContain('https://github.com/kgroat')
    expect(jsonLd.sameAs.some((url) => url.startsWith('mailto:'))).toBe(false)
  })

  it('cannot break out of a script tag', () => {
    const serialized = serializeJsonForScript({ text: '</script><script>alert(1)</script>' })
    expect(serialized).not.toContain('</script>')
    expect(JSON.parse(serialized)).toEqual({ text: '</script><script>alert(1)</script>' })
  })
})
