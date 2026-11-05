import { type IconKey, icons } from '~/content/icons'

import {
  invertKnockout,
  mulberry32,
  samplePointsFromMask,
  scatterPoints,
  sortByAngle,
  traceEdges,
} from './math'

/**
 * A shape the particle field can form:
 * - `icon:<key>` — any icon from the registry (brand logos, link glyphs)
 * - `text:<string>` — short text set in the display face
 * - `scatter` — a loose starfield
 */
export type ShapeSpec = `icon:${IconKey}` | `text:${string}` | 'scatter'

const RASTER_SIZE = 200
const PADDING = 0.04

export function isShapeSpec(value: string): value is ShapeSpec {
  if (value === 'scatter') return true
  if (value.startsWith('text:')) return value.length > 'text:'.length
  if (value.startsWith('icon:')) return value.slice('icon:'.length) in icons
  return false
}

function createRaster(): CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | null {
  if (typeof OffscreenCanvas !== 'undefined') {
    return new OffscreenCanvas(RASTER_SIZE, RASTER_SIZE).getContext('2d', {
      willReadFrequently: true,
    })
  }
  const canvas = document.createElement('canvas')
  canvas.width = RASTER_SIZE
  canvas.height = RASTER_SIZE
  return canvas.getContext('2d', { willReadFrequently: true })
}

/**
 * Draws a shape into a small offscreen canvas and samples `count` points from its filled pixels.
 * The result is angle-sorted (see `sortByAngle`) so any two shapes morph coherently.
 */
export function rasterizeShape(
  spec: ShapeSpec,
  count: number,
  seed: number,
  fontFamily: string,
): Float32Array {
  const rng = mulberry32(seed)
  if (spec === 'scatter') return sortByAngle(scatterPoints(count, rng))

  const ctx = createRaster()
  if (!ctx) return sortByAngle(scatterPoints(count, rng))

  ctx.clearRect(0, 0, RASTER_SIZE, RASTER_SIZE)
  ctx.fillStyle = '#fff'
  const inner = RASTER_SIZE * (1 - PADDING * 2)
  const icon = spec.startsWith('icon:') ? icons[spec.slice('icon:'.length) as IconKey] : undefined

  if (icon) {
    const scale = inner / icon.size
    ctx.setTransform(scale, 0, 0, scale, RASTER_SIZE * PADDING, RASTER_SIZE * PADDING)
    // This is CanvasRenderingContext2D.fill(path), not Array.prototype.fill.
    // oxlint-disable-next-line unicorn/no-array-fill-with-reference-type
    ctx.fill(new Path2D(icon.path), icon.fillRule)
    ctx.setTransform(1, 0, 0, 1, 0, 0)
  } else {
    const text = spec.slice('text:'.length)
    let fontSize = RASTER_SIZE * 0.7
    ctx.font = `800 ${fontSize}px ${fontFamily}`
    const measured = ctx.measureText(text).width
    if (measured > inner) {
      fontSize *= inner / measured
      ctx.font = `800 ${fontSize}px ${fontFamily}`
    }
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(text, RASTER_SIZE / 2, RASTER_SIZE / 2)
  }

  const { data } = ctx.getImageData(0, 0, RASTER_SIZE, RASTER_SIZE)
  let alpha: Uint8Array = new Uint8Array(RASTER_SIZE * RASTER_SIZE)
  for (let i = 0; i < alpha.length; i++) alpha[i] = data[i * 4 + 3] ?? 0

  if (icon?.particles === 'knockout') {
    alpha = invertKnockout(alpha, RASTER_SIZE, RASTER_SIZE, Math.round(RASTER_SIZE * 0.05))
  } else if (icon?.particles === 'edges') {
    alpha = traceEdges(alpha, RASTER_SIZE, RASTER_SIZE, Math.round(RASTER_SIZE * 0.03))
  }

  return sortByAngle(samplePointsFromMask(alpha, RASTER_SIZE, RASTER_SIZE, count, rng))
}
