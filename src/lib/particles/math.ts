/**
 * Pure math for the particle morph. Everything here is DOM-free so it can be unit tested; the
 * browser-only parts (rasterizing, rendering) live in `shapes.ts` and `engine.ts`.
 */

export type Rng = () => number

/** Small, fast, seedable PRNG so particle layouts are stable across renders. */
export function mulberry32(seed: number): Rng {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d_2b_79_f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296
  }
}

export const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value))

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t

export function smoothstep(edge0: number, edge1: number, x: number): number {
  if (edge0 === edge1) return x < edge0 ? 0 : 1
  const t = clamp((x - edge0) / (edge1 - edge0))
  return t * t * (3 - 2 * t)
}

export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2
}

/**
 * Samples `count` points from the opaque pixels of an alpha mask.
 *
 * Returns interleaved `[x0, y0, x1, y1, …]` coordinates centered on the shape's bounding box and
 * scaled uniformly so its larger side spans `[-1, 1]`. Pixels are drawn without replacement while
 * there are enough of them, then with replacement, and every point is jittered inside its pixel.
 */
export function samplePointsFromMask(
  alpha: ArrayLike<number>,
  width: number,
  height: number,
  count: number,
  rng: Rng,
  threshold = 128,
): Float32Array {
  const points = new Float32Array(count * 2)
  const filled: number[] = []
  let minX = width
  let minY = height
  let maxX = -1
  let maxY = -1

  for (let index = 0; index < width * height; index++) {
    if ((alpha[index] ?? 0) < threshold) continue
    filled.push(index)
    const x = index % width
    const y = (index - x) / width
    if (x < minX) minX = x
    if (x > maxX) maxX = x
    if (y < minY) minY = y
    if (y > maxY) maxY = y
  }

  if (filled.length === 0) return points

  const centerX = (minX + maxX + 1) / 2
  const centerY = (minY + maxY + 1) / 2
  const half = Math.max(maxX - minX + 1, maxY - minY + 1) / 2

  for (let i = 0; i < count; i++) {
    let pick: number
    if (i < filled.length) {
      // Partial Fisher–Yates: choose a not-yet-used pixel.
      const swap = i + Math.floor(rng() * (filled.length - i))
      pick = filled[swap] ?? 0
      filled[swap] = filled[i] ?? 0
      filled[i] = pick
    } else {
      pick = filled[Math.floor(rng() * filled.length)] ?? 0
    }
    const x = pick % width
    const y = (pick - x) / width
    points[i * 2] = (x + rng() - centerX) / half
    points[i * 2 + 1] = (y + rng() - centerY) / half
  }

  return points
}

/**
 * Orders points by angle around the origin. When two shapes are both sorted this way, particle
 * `i` lives in roughly the same direction in each, so morphs read as a reshaping rather than noise.
 */
export function sortByAngle(points: Float32Array): Float32Array {
  const count = points.length / 2
  const order = Array.from({ length: count }, (_, index) => index)
  const angles = new Float32Array(count)
  for (let i = 0; i < count; i++) {
    angles[i] = Math.atan2(points[i * 2 + 1] ?? 0, points[i * 2] ?? 0)
  }
  order.sort((a, b) => (angles[a] ?? 0) - (angles[b] ?? 0))
  const sorted = new Float32Array(points.length)
  for (const [to, from] of order.entries()) {
    sorted[to * 2] = points[from * 2] ?? 0
    sorted[to * 2 + 1] = points[from * 2 + 1] ?? 0
  }
  return sorted
}

/** Uniform random points over a wide box, used for the "starfield" scene. */
export function scatterPoints(count: number, rng: Rng, spreadX = 2.2, spreadY = 1.1): Float32Array {
  const points = new Float32Array(count * 2)
  for (let i = 0; i < count; i++) {
    points[i * 2] = (rng() * 2 - 1) * spreadX
    points[i * 2 + 1] = (rng() * 2 - 1) * spreadY
  }
  return points
}

export interface Blend {
  /** Index of the scene being morphed away from. */
  from: number
  /** Index of the scene being morphed toward. */
  to: number
  /** Eased morph progress between `from` and `to`, 0–1. */
  t: number
  /** The scene closest to the focus line. */
  active: number
}

/**
 * Given the (ascending) vertical anchors of each scene and the current focus line, works out which
 * two scenes to blend and how far along the morph is. `hold` is the fraction of the gap on either
 * side of an anchor where the shape stays fully formed, so shapes "settle" while you read.
 */
export function resolveBlend(anchors: readonly number[], focus: number, hold = 0.2): Blend | null {
  const last = anchors.length - 1
  if (last < 0) return null
  const first = anchors[0] ?? 0
  if (focus <= first) return { from: 0, to: 0, t: 0, active: 0 }
  if (focus >= (anchors[last] ?? 0)) return { from: last, to: last, t: 0, active: last }

  let low = 0
  let high = last
  while (high - low > 1) {
    const mid = (low + high) >> 1
    if ((anchors[mid] ?? 0) <= focus) low = mid
    else high = mid
  }

  const start = anchors[low] ?? 0
  const span = (anchors[high] ?? 0) - start
  const raw = span <= 0 ? 1 : (focus - start) / span
  return {
    from: low,
    to: high,
    t: smoothstep(hold, 1 - hold, raw),
    active: raw < 0.5 ? low : high,
  }
}

/**
 * Staggers a global morph progress per particle so the swarm moves like a flock instead of in
 * lockstep. `offset` is a stable 0–1 value per particle.
 */
export function staggered(t: number, offset: number, spread = 0.35): number {
  return clamp((t - offset * spread) / (1 - spread))
}

export type Placement = 'left' | 'right' | 'center' | 'full'

export interface Frame {
  /** Center of the shape, in CSS pixels. */
  cx: number
  cy: number
  /** Side length of the box the normalized `[-1, 1]` shape maps into. */
  size: number
}

export const COMPACT_BREAKPOINT = 900

export function placementFrame(placement: Placement, width: number, height: number): Frame {
  if (placement === 'full') return { cx: width / 2, cy: height / 2, size: height }
  if (width < COMPACT_BREAKPOINT) {
    return { cx: width / 2, cy: height * 0.4, size: Math.min(width * 0.8, height * 0.48) }
  }
  const size = Math.min(width * 0.34, height * 0.6)
  const cx = placement === 'left' ? width * 0.27 : placement === 'right' ? width * 0.73 : width / 2
  return { cx, cy: height * 0.52, size }
}

export function lerpFrame(a: Frame, b: Frame, t: number): Frame {
  return { cx: lerp(a.cx, b.cx, t), cy: lerp(a.cy, b.cy, t), size: lerp(a.size, b.size, t) }
}

/** 4-connected neighbors of a pixel index. */
function neighborsOf(index: number, width: number, size: number): number[] {
  const x = index % width
  const result: number[] = []
  if (x > 0) result.push(index - 1)
  if (x < width - 1) result.push(index + 1)
  if (index >= width) result.push(index - width)
  if (index < size - width) result.push(index + width)
  return result
}

/**
 * Keeps the filled pixels within `ring` steps of a seed pixel (an empty pixel the outline should
 * hug), via breadth-first search.
 */
function ringAround(
  seeds: Uint8Array,
  filled: (index: number) => boolean,
  width: number,
  ring: number,
): Uint8Array {
  const size = seeds.length
  const reached = new Uint8Array(size)
  const result = new Uint8Array(size)
  let frontier: number[] = []
  for (let index = 0; index < size; index++) {
    if (seeds[index]) {
      reached[index] = 1
      frontier.push(index)
    }
  }
  for (let step = 1; step <= ring && frontier.length > 0; step++) {
    const next: number[] = []
    for (const index of frontier) {
      for (const neighbor of neighborsOf(index, width, size)) {
        if (!reached[neighbor] && filled(neighbor)) {
          reached[neighbor] = 1
          result[neighbor] = 255
          next.push(neighbor)
        }
      }
    }
    frontier = next
  }
  return result
}

/**
 * Re-renders a "knockout" logo mask (a solid badge with a glyph cut out of it, like TypeScript or
 * GitHub) for particles: the cut-out glyph becomes solid and the badge becomes an outline `ring`
 * pixels wide. A swarm of particles reads solid strokes far better than gaps.
 */
export function invertKnockout(
  alpha: ArrayLike<number>,
  width: number,
  height: number,
  ring: number,
  threshold = 128,
): Uint8Array {
  const size = width * height
  const filled = (index: number) => (alpha[index] ?? 0) >= threshold

  // Empty pixels reachable from the edge of the canvas are "outside"; any other empty pixel is a
  // hole in the badge (the knocked-out glyph).
  const outside = new Uint8Array(size)
  const stack: number[] = []
  for (let index = 0; index < size; index++) {
    const x = index % width
    const y = (index - x) / width
    const onEdge = x === 0 || y === 0 || x === width - 1 || y === height - 1
    if (onEdge && !filled(index)) {
      outside[index] = 1
      stack.push(index)
    }
  }
  while (stack.length > 0) {
    for (const next of neighborsOf(stack.pop() ?? 0, width, size)) {
      if (!outside[next] && !filled(next)) {
        outside[next] = 1
        stack.push(next)
      }
    }
  }

  // Keep the holes and the badge's outer ring.
  const result = ringAround(outside, filled, width, ring)
  for (let index = 0; index < size; index++) {
    if (!filled(index) && !outside[index]) result[index] = 255
  }
  return result
}

/**
 * Traces every edge of a mask, inside and out, as a line `ring` pixels wide. For logos whose
 * detail is carved by thin channels open to the outside (Webpack's cube, bash's prompt), where
 * there's no enclosed hole for `invertKnockout` to fill.
 */
export function traceEdges(
  alpha: ArrayLike<number>,
  width: number,
  height: number,
  ring: number,
  threshold = 128,
): Uint8Array {
  const size = width * height
  const filled = (index: number) => (alpha[index] ?? 0) >= threshold
  const empty = new Uint8Array(size)
  for (let index = 0; index < size; index++) if (!filled(index)) empty[index] = 1
  return ringAround(empty, filled, width, ring)
}
