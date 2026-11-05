import type { ReactNode } from 'react'

import { cn } from '~/lib/cn'

interface SectionHeadingProps {
  index: string
  kicker: string
  title: ReactNode
  children?: ReactNode
  className?: string
}

/** Numbered section heading, e.g. "02 — Experience". */
export function SectionHeading({ index, kicker, title, children, className }: SectionHeadingProps) {
  return (
    <header className={cn('reveal max-w-2xl', className)}>
      <p className="flex items-center gap-3 font-mono text-xs tracking-[0.2em] text-peach-300 uppercase">
        <span>{index}</span>
        <span aria-hidden className="h-px w-10 bg-peach-300/50" />
        <span>{kicker}</span>
      </p>
      <h2 className="mt-4 font-display text-4xl leading-[1.05] font-bold tracking-tight text-mist-100 sm:text-6xl">
        {title}
      </h2>
      {children ? <div className="mt-5 text-lg text-mist-300">{children}</div> : null}
    </header>
  )
}
