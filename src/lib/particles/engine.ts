import { hexToRgb, mixRgb, type Rgb } from '~/lib/color'

import {
  type Blend,
  clamp,
  easeInOutCubic,
  type Frame,
  lerp,
  lerpFrame,
  type Placement,
  placementFrame,
  resolveBlend,
  staggered,
} from './math'
import { isShapeSpec, rasterizeShape, type ShapeSpec } from './shapes'

/**
 * The particle field: a single fixed canvas whose particles morph between "scenes".
 *
 * - In `scroll` mode, scenes are DOM elements carrying `data-scene` attributes; the scroll position
 *   decides which two scenes to blend and how far (so the morph scrubs with the scrollbar).
 * - In `manual` mode, the caller picks the scene and the morph plays over time (used by /lab).
 */

export interface Scene {
  shape: ShapeSpec
  /** Color on the left edge of the shape. */
  color: string
  /** Color on the right edge of the shape (defaults to `color`). */
  accent?: string
  placement: Placement
}

interface ResolvedScene extends Scene {
  rgb: Rgb
  accentRgb: Rgb
  element?: HTMLElement
  anchor: number
}

export interface ParticleFieldOptions {
  canvas: HTMLCanvasElement
  mode: 'scroll' | 'manual'
  reducedMotion: boolean
  fontFamily: string
  /** Called (scroll mode) when the scene nearest the middle of the viewport changes. */
  onActiveChange?: (element: HTMLElement | undefined) => void
}

export interface ParticleField {
  /** Re-reads scene elements and their positions (scroll mode). */
  refresh(): void
  /** Morphs to a scene (manual mode). */
  show(scene: Scene): void
  /** 0–1 audio/interaction energy; expands and agitates the swarm. */
  setEnergy(energy: number): void
  /** Overrides the scene color (e.g. pitch-mapped color in the lab). `undefined` clears it. */
  setTint(hex: string | undefined): void
  destroy(): void
}

export const SCENE_ATTRIBUTE = 'data-scene'
const ACTIVE_ATTRIBUTE = 'data-scene-active'
const MANUAL_MORPH_MS = 1200
const BRIGHTNESS_BUCKETS = [0.32, 0.6, 0.95] as const

export function sceneAttributes(scene: Scene) {
  return {
    [SCENE_ATTRIBUTE]: scene.shape,
    'data-scene-color': scene.color,
    'data-scene-accent': scene.accent ?? scene.color,
    'data-scene-placement': scene.placement,
  }
}

function readScene(element: HTMLElement): Scene | undefined {
  const shape = element.getAttribute(SCENE_ATTRIBUTE) ?? ''
  if (!isShapeSpec(shape)) return undefined
  const placement = (element.dataset.scenePlacement ?? 'center') as Placement
  const color = element.dataset.sceneColor ?? '#ceabff'
  return { shape, placement, color, accent: element.dataset.sceneAccent ?? color }
}

/**
 * Vertical center of an element in document coordinates, from layout offsets rather than
 * `getBoundingClientRect()`, so scroll-driven transforms (reveal animations) don't skew anchors.
 */
function layoutCenter(element: HTMLElement): number {
  let top = element.offsetHeight / 2
  for (
    let node: HTMLElement | null = element;
    node;
    node = node.offsetParent as HTMLElement | null
  ) {
    top += node.offsetTop
  }
  return top
}

/** FNV-1a, so each shape gets a stable sampling seed regardless of load order. */
function hashString(value: string): number {
  let hash = 0x81_1c_9d_c5
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i)
    hash = Math.imul(hash, 0x01_00_01_93)
  }
  return hash >>> 0
}

const toCss = ({ r, g, b }: Rgb) => `rgb(${r | 0} ${g | 0} ${b | 0})`

function particleCount(width: number, height: number): number {
  return Math.round(clamp((width * height) / 520, 900, 2400))
}

export function createParticleField(options: ParticleFieldOptions): ParticleField {
  const { canvas, mode, reducedMotion, fontFamily } = options
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Canvas 2D is not supported')
  const ctx = context

  let width = window.innerWidth
  let height = window.innerHeight
  const count = particleCount(width, height)

  // Per-particle state, in flat typed arrays for speed.
  const x = new Float32Array(count)
  const y = new Float32Array(count)
  const offset = new Float32Array(count)
  const swirl = new Float32Array(count)
  const phase = new Float32Array(count)
  const size = new Float32Array(count)
  const buckets: number[][] = BRIGHTNESS_BUCKETS.map(() => [])
  for (let i = 0; i < count; i++) {
    offset[i] = Math.random()
    swirl[i] = (Math.random() - 0.5) * 2
    phase[i] = Math.random() * Math.PI * 2
    size[i] = 0.9 + Math.random() * 1.4
    buckets[Math.floor(Math.random() * BRIGHTNESS_BUCKETS.length)]?.push(i)
  }

  // Shapes are rasterized lazily (the two being blended, on demand) and the rest are prefetched
  // in idle time, nearest first, so startup never blocks on sampling every logo.
  const shapeCache = new Map<ShapeSpec, Float32Array>()
  const pointsFor = (shape: ShapeSpec) => {
    let points = shapeCache.get(shape)
    if (!points) {
      points = rasterizeShape(shape, count, hashString(shape), fontFamily)
      shapeCache.set(shape, points)
    }
    return points
  }

  const hasIdleCallback = typeof window.requestIdleCallback === 'function'
  let prefetchHandle = 0
  const cancelPrefetch = () =>
    hasIdleCallback
      ? window.cancelIdleCallback(prefetchHandle)
      : window.clearTimeout(prefetchHandle)

  function schedulePrefetch(shapes: ShapeSpec[]) {
    cancelPrefetch()
    const pending = shapes.filter(
      (shape, index) => !shapeCache.has(shape) && shapes.indexOf(shape) === index,
    )
    const step = () => {
      const next = pending.shift()
      if (!next) return
      pointsFor(next)
      prefetchHandle = hasIdleCallback
        ? window.requestIdleCallback(step, { timeout: 1000 })
        : window.setTimeout(step, 32)
    }
    step()
  }

  const resolve = (scene: Scene, element?: HTMLElement, anchor = 0): ResolvedScene => ({
    ...scene,
    rgb: hexToRgb(scene.color),
    accentRgb: hexToRgb(scene.accent ?? scene.color),
    element,
    anchor,
  })

  // --- scroll mode -------------------------------------------------------------------------
  let scenes: ResolvedScene[] = []
  let anchors: number[] = []
  let activeElement: HTMLElement | undefined

  function refresh() {
    if (mode !== 'scroll') return
    const next: ResolvedScene[] = []
    for (const element of document.querySelectorAll<HTMLElement>(`[${SCENE_ATTRIBUTE}]`)) {
      const scene = readScene(element)
      if (!scene) continue
      next.push(resolve(scene, element, layoutCenter(element)))
    }
    scenes = next.toSorted((a, b) => a.anchor - b.anchor)
    anchors = scenes.map((scene) => scene.anchor)
    const focus = window.scrollY + height * 0.5
    schedulePrefetch(
      scenes
        .toSorted((a, b) => Math.abs(a.anchor - focus) - Math.abs(b.anchor - focus))
        .map((scene) => scene.shape),
    )
  }

  // --- manual mode -------------------------------------------------------------------------
  let manualFrom: ResolvedScene | undefined
  let manualTo: ResolvedScene | undefined
  let manualStartedAt = 0

  function show(scene: Scene) {
    const next = resolve(scene)
    manualFrom = manualTo ?? next
    manualTo = next
    manualStartedAt = performance.now()
  }

  // --- shared state ------------------------------------------------------------------------
  let energy = 0
  let smoothedEnergy = 0
  let tint: Rgb | undefined
  let smoothedTint: Rgb | undefined
  let pointerX = -1e4
  let pointerY = -1e4
  let dpr = 1
  let startedAt = performance.now()
  let raf = 0
  let seeded = false

  function resize() {
    width = window.innerWidth
    height = window.innerHeight
    dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = Math.round(width * dpr)
    canvas.height = Math.round(height * dpr)
    refresh()
  }

  function currentBlend(now: number): { a: ResolvedScene; b: ResolvedScene; blend: Blend } | null {
    if (mode === 'manual') {
      if (!manualFrom || !manualTo) return null
      const t = reducedMotion ? 1 : clamp((now - manualStartedAt) / MANUAL_MORPH_MS)
      return { a: manualFrom, b: manualTo, blend: { from: 0, to: 1, t, active: 1 } }
    }
    const blend = resolveBlend(anchors, window.scrollY + height * 0.5)
    const a = blend && scenes[blend.from]
    const b = blend && scenes[blend.to]
    if (!blend || !a || !b) return null
    return { a, b, blend }
  }

  function updateActive(element: HTMLElement | undefined) {
    if (element === activeElement) return
    activeElement?.removeAttribute(ACTIVE_ATTRIBUTE)
    element?.setAttribute(ACTIVE_ATTRIBUTE, '')
    activeElement = element
    options.onActiveChange?.(element)
  }

  function frame(now: number) {
    raf = requestAnimationFrame(frame)
    const current = currentBlend(now)
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    if (!current) return

    const { a, b, blend } = current
    if (mode === 'scroll') updateActive(scenes[blend.active]?.element)

    const frameA: Frame = placementFrame(a.placement, width, height)
    const frameB: Frame = placementFrame(b.placement, width, height)
    const box = lerpFrame(frameA, frameB, easeInOutCubic(blend.t))

    if (!seeded) {
      // Start as a loose cloud around the first shape, so it condenses into place quickly.
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2
        const radius = Math.sqrt(Math.random()) * box.size * 0.75
        x[i] = box.cx + Math.cos(angle) * radius
        y[i] = box.cy + Math.sin(angle) * radius
      }
      seeded = true
    }

    const pointsA = pointsFor(a.shape)
    const pointsB = pointsFor(b.shape)
    smoothedEnergy = lerp(smoothedEnergy, energy, 0.18)
    const scale = (box.size / 2) * (1 + smoothedEnergy * 0.28)
    const drift = reducedMotion ? 0 : 0.01 + smoothedEnergy * 0.05
    const follow = reducedMotion ? 1 : 0.14
    const time = now - startedAt

    for (let i = 0; i < count; i++) {
      const progress = easeInOutCubic(staggered(blend.t, offset[i] ?? 0))
      const ax = pointsA[i * 2] ?? 0
      const ay = pointsA[i * 2 + 1] ?? 0
      const bx = pointsB[i * 2] ?? 0
      const by = pointsB[i * 2 + 1] ?? 0
      let nx = lerp(ax, bx, progress)
      let ny = lerp(ay, by, progress)

      if (!reducedMotion) {
        // Arc sideways mid-flight so particles swirl into place rather than sliding.
        const arc = Math.sin(Math.PI * progress) * (swirl[i] ?? 0) * 0.4
        nx += -(by - ay) * arc
        ny += (bx - ax) * arc
        const p = phase[i] ?? 0
        nx += Math.sin(time * 0.0007 + p) * drift
        ny += Math.cos(time * 0.0009 + p * 1.3) * drift
      }

      let tx = box.cx + nx * scale
      let ty = box.cy + ny * scale

      if (!reducedMotion) {
        // Gently part the swarm around the pointer.
        const dx = tx - pointerX
        const dy = ty - pointerY
        const distance = Math.hypot(dx, dy)
        if (distance < 110 && distance > 0.001) {
          const push = ((110 - distance) / 110) ** 2 * 36
          tx += (dx / distance) * push
          ty += (dy / distance) * push
        }
      }

      x[i] = lerp(x[i] ?? tx, tx, follow)
      y[i] = lerp(y[i] ?? ty, ty, follow)
    }

    let left = mixRgb(a.rgb, b.rgb, blend.t)
    let right = mixRgb(a.accentRgb, b.accentRgb, blend.t)
    if (tint) {
      smoothedTint = smoothedTint ? mixRgb(smoothedTint, tint, 0.12) : tint
      left = smoothedTint
      right = smoothedTint
    }
    const fadeIn = reducedMotion ? 1 : clamp(time / 900)

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.globalCompositeOperation = 'lighter'
    const gradient = ctx.createLinearGradient(box.cx - scale, 0, box.cx + scale, 0)
    gradient.addColorStop(0, toCss(left))
    gradient.addColorStop(1, toCss(right))
    ctx.fillStyle = gradient
    for (const [bucket, members] of buckets.entries()) {
      ctx.globalAlpha = (BRIGHTNESS_BUCKETS[bucket] ?? 1) * fadeIn
      for (const i of members) {
        const s = size[i] ?? 1
        ctx.fillRect((x[i] ?? 0) - s / 2, (y[i] ?? 0) - s / 2, s, s)
      }
    }
    ctx.globalAlpha = 1
    ctx.globalCompositeOperation = 'source-over'
  }

  const onPointerMove = (event: PointerEvent) => {
    if (event.pointerType !== 'mouse') return
    pointerX = event.clientX
    pointerY = event.clientY
  }
  const onPointerLeave = () => {
    pointerX = -1e4
    pointerY = -1e4
  }

  const resizeObserver = new ResizeObserver(() => refresh())
  resizeObserver.observe(document.body)
  window.addEventListener('resize', resize)
  window.addEventListener('pointermove', onPointerMove, { passive: true })
  document.documentElement.addEventListener('pointerleave', onPointerLeave)

  resize()
  startedAt = performance.now()
  raf = requestAnimationFrame(frame)

  return {
    refresh,
    show,
    setEnergy(value) {
      energy = clamp(value)
    },
    setTint(hex) {
      tint = hex ? hexToRgb(hex) : undefined
      if (!tint) smoothedTint = undefined
    },
    destroy() {
      cancelAnimationFrame(raf)
      cancelPrefetch()
      resizeObserver.disconnect()
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onPointerMove)
      document.documentElement.removeEventListener('pointerleave', onPointerLeave)
      updateActive(undefined)
    },
  }
}
