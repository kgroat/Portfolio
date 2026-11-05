import { describe, expect, it } from 'vitest'

import {
  ensureVisibleOnDark,
  hexToRgb,
  hslToHex,
  LIGHT_NEUTRAL,
  mixRgb,
  relativeLuminance,
  rgbToHex,
} from './color'

describe('hex conversion', () => {
  it('round-trips 6-digit hex', () => {
    expect(rgbToHex(hexToRgb('#ceabff'))).toBe('#ceabff')
  })

  it('expands 3-digit hex and tolerates a missing #', () => {
    expect(hexToRgb('fff')).toEqual({ r: 255, g: 255, b: 255 })
  })

  it('rejects invalid colors', () => {
    expect(() => hexToRgb('#12')).toThrow(TypeError)
  })

  it('clamps and rounds channels', () => {
    expect(rgbToHex({ r: 300, g: -5, b: 127.6 })).toBe('#ff0080')
  })
})

describe('relativeLuminance', () => {
  it('is 0 for black and 1 for white', () => {
    expect(relativeLuminance(hexToRgb('#000000'))).toBe(0)
    expect(relativeLuminance(hexToRgb('#ffffff'))).toBeCloseTo(1)
  })
})

describe('mixRgb', () => {
  it('interpolates linearly', () => {
    expect(mixRgb({ r: 0, g: 0, b: 0 }, { r: 200, g: 100, b: 50 }, 0.5)).toEqual({
      r: 100,
      g: 50,
      b: 25,
    })
  })
})

describe('ensureVisibleOnDark', () => {
  it('leaves bright brand colors alone', () => {
    expect(ensureVisibleOnDark('#61DAFB')).toBe('#61dafb')
  })

  it('shows dark neutral (black/gray) logos in their light variant', () => {
    expect(ensureVisibleOnDark('#000000')).toBe(LIGHT_NEUTRAL)
    expect(ensureVisibleOnDark('#181717')).toBe(LIGHT_NEUTRAL)
  })

  it('lifts dark colored logos just enough, keeping their hue', () => {
    const lifted = ensureVisibleOnDark('#24175B', 0.18)
    expect(relativeLuminance(hexToRgb(lifted))).toBeGreaterThanOrEqual(0.18)
    expect(relativeLuminance(hexToRgb(lifted))).toBeLessThan(0.2)
    const { r, b } = hexToRgb(lifted)
    expect(b).toBeGreaterThan(r)
  })
})

describe('hslToHex', () => {
  it.each([
    [0, 1, 0.5, '#ff0000'],
    [120, 1, 0.5, '#00ff00'],
    [240, 1, 0.5, '#0000ff'],
    [360, 1, 0.5, '#ff0000'],
    [0, 0, 1, '#ffffff'],
  ])('hsl(%i, %f, %f) → %s', (h, s, l, hex) => {
    expect(hslToHex(h, s, l)).toBe(hex)
  })
})
