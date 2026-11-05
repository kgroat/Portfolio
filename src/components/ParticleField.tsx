import { useEffect, useEffectEvent, useRef } from 'react'

import { cn } from '~/lib/cn'
import { createParticleField, type ParticleField as Field } from '~/lib/particles/engine'

const DISPLAY_FONT = '"Bricolage Grotesque Variable", system-ui, sans-serif'

interface ParticleFieldProps {
  mode?: 'scroll' | 'manual'
  className?: string
  /** Receives the engine once it's running (manual mode drives it imperatively). */
  onReady?: (field: Field | undefined) => void
}

/**
 * Fixed, full-viewport canvas behind the page. Server-rendered as an empty canvas; the engine
 * starts after hydration, so it never affects SSR output.
 */
export function ParticleField({ mode = 'scroll', className, onReady }: ParticleFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const notifyReady = useEffectEvent((field: Field | undefined) => onReady?.(field))

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const controller = new AbortController()
    const state: { field?: Field } = {}

    // Text and the monogram are sampled from rendered glyphs, so wait for the display font.
    void document.fonts.load(`800 100px ${DISPLAY_FONT}`).finally(() => {
      if (controller.signal.aborted) return
      state.field = createParticleField({
        canvas,
        mode,
        fontFamily: DISPLAY_FONT,
        reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      })
      notifyReady(state.field)
    })

    return () => {
      controller.abort()
      state.field?.destroy()
      notifyReady(undefined)
    }
  }, [mode])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={cn('pointer-events-none fixed inset-0 z-0 h-dvh w-screen', className)}
    />
  )
}
