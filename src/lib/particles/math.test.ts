import { describe, expect, it } from 'vitest'

import {
  COMPACT_BREAKPOINT,
  easeInOutCubic,
  invertKnockout,
  traceEdges,
  lerpFrame,
  mulberry32,
  placementFrame,
  resolveBlend,
  samplePointsFromMask,
  scatterPoints,
  smoothstep,
  sortByAngle,
  staggered,
} from './math'

const pairs = (points: Float32Array): Array<[number, number]> =>
  Array.from({ length: points.length / 2 }, (_, i) => [points[i * 2]!, points[i * 2 + 1]!])

describe('mulberry32', () => {
  it('is deterministic per seed and stays in [0, 1)', () => {
    const a = mulberry32(42)
    const b = mulberry32(42)
    const values = Array.from({ length: 1000 }, () => a())
    expect(values).toEqual(Array.from({ length: 1000 }, () => b()))
    expect(Math.min(...values)).toBeGreaterThanOrEqual(0)
    expect(Math.max(...values)).toBeLessThan(1)
  })

  it('differs between seeds', () => {
    expect(mulberry32(1)()).not.toBe(mulberry32(2)())
  })
})

describe('easing', () => {
  it('smoothstep clamps and eases', () => {
    expect(smoothstep(0.2, 0.8, 0)).toBe(0)
    expect(smoothstep(0.2, 0.8, 1)).toBe(1)
    expect(smoothstep(0.2, 0.8, 0.5)).toBeCloseTo(0.5)
    expect(smoothstep(0.5, 0.5, 0.6)).toBe(1)
  })

  it('easeInOutCubic is symmetric with fixed ends', () => {
    expect(easeInOutCubic(0)).toBe(0)
    expect(easeInOutCubic(1)).toBe(1)
    expect(easeInOutCubic(0.25) + easeInOutCubic(0.75)).toBeCloseTo(1)
  })

  it('staggered progress respects each particle offset', () => {
    expect(staggered(0.2, 1)).toBe(0)
    expect(staggered(1, 1)).toBe(1)
    expect(staggered(0.5, 0)).toBeGreaterThan(staggered(0.5, 1))
  })
})

describe('samplePointsFromMask', () => {
  // A 4×2 filled rectangle inside an 8×8 mask, starting at (2, 3).
  const width = 8
  const height = 8
  const mask = new Uint8Array(width * height)
  for (let y = 3; y < 5; y++) for (let x = 2; x < 6; x++) mask[y * width + x] = 255

  it('only samples filled pixels, normalized to [-1, 1] around the shape', () => {
    const points = samplePointsFromMask(mask, width, height, 200, mulberry32(7))
    for (const [x, y] of pairs(points)) {
      expect(x).toBeGreaterThanOrEqual(-1)
      expect(x).toBeLessThanOrEqual(1)
      // The shape is twice as wide as tall, so y only spans half the range.
      expect(y).toBeGreaterThanOrEqual(-0.5)
      expect(y).toBeLessThanOrEqual(0.5)
    }
  })

  it('uses every pixel once before repeating', () => {
    const points = samplePointsFromMask(mask, width, height, 8, mulberry32(3))
    const cells = new Set(
      pairs(points).map(([x, y]) => `${Math.floor(x * 2)},${Math.floor(y * 2)}`),
    )
    expect(cells.size).toBe(8)
  })

  it('returns zeros for an empty mask', () => {
    const points = samplePointsFromMask(new Uint8Array(16), 4, 4, 5, mulberry32(1))
    expect([...points].every((value) => value === 0)).toBe(true)
  })

  it('respects the alpha threshold', () => {
    const faint = new Uint8Array(16).fill(100)
    const points = samplePointsFromMask(faint, 4, 4, 3, mulberry32(1), 128)
    expect([...points].every((value) => value === 0)).toBe(true)
  })
})

describe('sortByAngle', () => {
  it('orders points counter-clockwise from -π and keeps pairs intact', () => {
    const points = new Float32Array([1, 0, 0, 1, -1, 0, 0, -1])
    expect(pairs(sortByAngle(points))).toEqual([
      [0, -1],
      [1, 0],
      [0, 1],
      [-1, 0],
    ])
  })
})

describe('invertKnockout', () => {
  // A 9×9 canvas: a 7×7 badge (x/y 1–7) with a 3×1 glyph cut out of its middle row.
  const width = 9
  const height = 9
  const mask = new Uint8Array(width * height)
  for (let y = 1; y <= 7; y++) for (let x = 1; x <= 7; x++) mask[y * width + x] = 255
  for (let x = 3; x <= 5; x++) mask[4 * width + x] = 0

  const at = (result: Uint8Array, x: number, y: number) => result[y * width + x]

  it('fills the knocked-out glyph and outlines the badge', () => {
    const result = invertKnockout(mask, width, height, 1)
    // The glyph is now solid…
    for (let x = 3; x <= 5; x++) expect(at(result, x, 4)).toBe(255)
    // …the badge keeps a 1px outer ring…
    expect(at(result, 1, 1)).toBe(255)
    expect(at(result, 7, 4)).toBe(255)
    // …its inside is cleared, and the canvas outside stays empty.
    expect(at(result, 2, 2)).toBe(0)
    expect(at(result, 0, 0)).toBe(0)
  })

  it('widens the outline with the ring size', () => {
    const result = invertKnockout(mask, width, height, 2)
    expect(at(result, 2, 2)).toBe(255)
    expect(at(result, 3, 3)).toBe(0)
  })
})

describe('traceEdges', () => {
  // A 9×9 solid block with a 1px channel cut from the top edge down to its middle, which
  // `invertKnockout` can't see (the channel is open to the outside).
  const width = 9
  const height = 9
  const mask = new Uint8Array(width * height).fill(255)
  for (let y = 0; y <= 4; y++) mask[y * width + 4] = 0

  const at = (result: Uint8Array, x: number, y: number) => result[y * width + x]

  it('outlines both sides of interior channels', () => {
    const result = traceEdges(mask, width, height, 1)
    expect(at(result, 3, 2)).toBe(255)
    expect(at(result, 5, 2)).toBe(255)
    expect(at(result, 4, 5)).toBe(255)
    // The channel itself stays empty, as does solid material away from any edge.
    expect(at(result, 4, 2)).toBe(0)
    expect(at(result, 1, 6)).toBe(0)
  })

  it('finds nothing to trace in a fully solid mask', () => {
    const solid = new Uint8Array(16).fill(255)
    expect([...traceEdges(solid, 4, 4, 2)].every((value) => value === 0)).toBe(true)
  })
})

describe('scatterPoints', () => {
  it('stays inside the requested spread', () => {
    for (const [x, y] of pairs(scatterPoints(500, mulberry32(9), 2, 1))) {
      expect(Math.abs(x)).toBeLessThanOrEqual(2)
      expect(Math.abs(y)).toBeLessThanOrEqual(1)
    }
  })
})

describe('resolveBlend', () => {
  const anchors = [100, 500, 900]

  it('returns null without scenes', () => {
    expect(resolveBlend([], 0)).toBeNull()
  })

  it('pins to the first and last scenes outside the anchors', () => {
    expect(resolveBlend(anchors, 0)).toEqual({ from: 0, to: 0, t: 0, active: 0 })
    expect(resolveBlend(anchors, 5000)).toEqual({ from: 2, to: 2, t: 0, active: 2 })
  })

  it('holds the shape near an anchor and morphs in between', () => {
    expect(resolveBlend(anchors, 120)).toMatchObject({ from: 0, to: 1, t: 0, active: 0 })
    expect(resolveBlend(anchors, 300)).toMatchObject({ from: 0, to: 1, active: 1 })
    expect(resolveBlend(anchors, 300)?.t).toBeCloseTo(0.5)
    expect(resolveBlend(anchors, 490)).toMatchObject({ from: 0, to: 1, t: 1, active: 1 })
    expect(resolveBlend(anchors, 700)?.t).toBeCloseTo(0.5)
  })

  it('is monotonic as you scroll through a gap', () => {
    let previous = -1
    // At exactly 500 the blend hands over to the next pair ({1→2, t=0}), the same visual state.
    for (let focus = 100; focus < 500; focus += 10) {
      const { t } = resolveBlend(anchors, focus)!
      expect(t).toBeGreaterThanOrEqual(previous)
      previous = t
    }
  })

  it('handles coincident anchors', () => {
    expect(resolveBlend([100, 100, 300], 100)).toMatchObject({ active: 0 })
    expect(resolveBlend([100, 100, 300], 200)).toMatchObject({ from: 1, to: 2 })
  })
})

describe('placementFrame', () => {
  it('puts shapes beside the content on wide screens', () => {
    const left = placementFrame('left', 1600, 900)
    const right = placementFrame('right', 1600, 900)
    expect(left.cx).toBeLessThan(800)
    expect(right.cx).toBeGreaterThan(800)
    expect(left.size).toBe(right.size)
  })

  it('centers everything on compact screens', () => {
    const frame = placementFrame('left', COMPACT_BREAKPOINT - 1, 800)
    expect(frame.cx).toBe((COMPACT_BREAKPOINT - 1) / 2)
  })

  it('fills the viewport for full placement', () => {
    expect(placementFrame('full', 1600, 900)).toEqual({ cx: 800, cy: 450, size: 900 })
  })

  it('interpolates frames', () => {
    expect(lerpFrame({ cx: 0, cy: 0, size: 100 }, { cx: 100, cy: 50, size: 200 }, 0.5)).toEqual({
      cx: 50,
      cy: 25,
      size: 150,
    })
  })
})
