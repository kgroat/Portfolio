import { useEffect, useRef, useState } from 'react'

/**
 * Counts up to `value` the first time it scrolls into view. Server-renders the final number so
 * the markup is correct without JavaScript.
 */
export function CountUp({ value, suffix = '' }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const [display, setDisplay] = useState(value)

  useEffect(() => {
    const element = ref.current
    if (!element || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const frame = { id: 0 }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return
        observer.disconnect()
        const started = performance.now()
        const tick = (now: number) => {
          const t = Math.min(1, (now - started) / 1400)
          setDisplay(Math.round(value * (1 - (1 - t) ** 4)))
          if (t < 1) frame.id = requestAnimationFrame(tick)
        }
        setDisplay(0)
        frame.id = requestAnimationFrame(tick)
      },
      { threshold: 0.6 },
    )
    observer.observe(element)
    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame.id)
    }
  }, [value])

  return (
    <span ref={ref}>
      {display}
      {suffix}
    </span>
  )
}
