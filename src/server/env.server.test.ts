import { describe, expect, it } from 'vitest'

import { readServerEnv } from './env.server'

describe('readServerEnv', () => {
  it('treats missing and blank tokens as undefined', () => {
    expect(readServerEnv({})).toEqual({ GITHUB_TOKEN: undefined, GITLAB_TOKEN: undefined })
    expect(readServerEnv({ GITHUB_TOKEN: '   ' }).GITHUB_TOKEN).toBeUndefined()
  })

  it('trims real tokens', () => {
    expect(readServerEnv({ GITHUB_TOKEN: ' ghp_123 \n' }).GITHUB_TOKEN).toBe('ghp_123')
  })
})
