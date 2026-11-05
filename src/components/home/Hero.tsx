import { Link } from '@tanstack/react-router'

import { MorphingWord } from '~/components/MorphingWord'
import { sceneAttributes } from '~/lib/particles/engine'
import { site } from '~/lib/site'

interface HeroProps {
  name: string
  headline: string
  principles: string[]
  years: number
}

export function Hero({ name, headline, principles, years }: HeroProps) {
  const [first, ...rest] = name.split(' ')

  return (
    <section
      id="top"
      aria-labelledby="hero-title"
      className="relative flex min-h-dvh items-center px-6 pt-24 pb-16 sm:px-10 lg:px-16"
      {...sceneAttributes({
        shape: 'icon:monogram',
        color: '#ceabff',
        accent: '#ffd5ab',
        placement: 'right',
      })}
    >
      <div className="max-w-3xl lg:max-w-[52%]">
        <p className="morph-word font-mono text-xs tracking-[0.25em] text-mist-400 uppercase">
          {headline} · {years}+ years on the web
        </p>
        <h1
          id="hero-title"
          className="mt-6 font-display text-[clamp(3.6rem,11vw,9.5rem)] leading-[0.86] font-extrabold tracking-[-0.04em] text-mist-100"
        >
          <span className="block">{first}</span>
          <span className="text-gradient block">{rest.join(' ')}</span>
        </h1>
        <p className="mt-8 max-w-xl text-xl leading-relaxed text-pretty text-mist-300 sm:text-2xl">
          I build software that stays easy to change, guided by
          <span className="sr-only"> {principles.join(', ')}.</span>
          <span className="mt-1 block font-display text-2xl font-semibold sm:text-3xl">
            <MorphingWord words={principles} />
          </span>
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-3">
          <Link
            to="/"
            hash="experience"
            className="rounded-full bg-mist-100 px-6 py-3 font-medium text-night-950 transition hover:bg-peach-300"
          >
            See the work
          </Link>
          <a
            href="/resume.pdf"
            download={site.pdfFileName}
            className="rounded-full border border-mist-100/20 px-6 py-3 font-medium text-mist-100 transition hover:border-lilac-300 hover:text-lilac-200"
          >
            Download résumé
          </a>
        </div>
      </div>

      <div
        aria-hidden
        className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 font-mono text-[0.65rem] tracking-[0.3em] text-mist-400 uppercase sm:flex"
      >
        Scroll — the particles follow
        <span className="h-10 w-px overflow-hidden bg-mist-100/10">
          <span className="block h-1/2 w-px animate-bounce bg-peach-300" />
        </span>
      </div>
    </section>
  )
}
