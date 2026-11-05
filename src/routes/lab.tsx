import { createFileRoute, Link } from '@tanstack/react-router'
import { createClientOnlyFn } from '@tanstack/react-start'
import { useEffect, useRef, useState } from 'react'

import { BrandIcon } from '~/components/BrandIcon'
import { ParticleField } from '~/components/ParticleField'
import { getSkillSwatches } from '~/functions/profile.functions'
import { dominantFrequency, frequencyToNote, noteColor, rms } from '~/lib/audio/pitch'
import { type AudioRig, startDemo, startMicrophone } from '~/lib/audio/sources.client'
import { cn } from '~/lib/cn'
import type { ParticleField as Field } from '~/lib/particles/engine'
import { labSearchSchema } from '~/lib/search'
import { absoluteUrl, site } from '~/lib/site'

type AudioKind = 'demo' | 'mic'

/** Explicit client boundary: on the server this is a stub that throws, and the import is pruned. */
const startAudio = createClientOnlyFn((kind: AudioKind): Promise<AudioRig> =>
  kind === 'demo' ? startDemo() : startMicrophone(),
)

/**
 * The particle engine in "manual" mode, driven by Web Audio.
 *
 * `ssr: 'data-only'`: the loader runs on the server (skill swatches come from the server-only
 * profile), but the component — canvas, Web Audio, getUserMedia — only renders in the browser.
 * The server sends `pendingComponent` as the HTML fallback.
 */
export const Route = createFileRoute('/lab')({
  ssr: 'data-only',
  validateSearch: labSearchSchema,
  loader: () => getSkillSwatches(),
  staleTime: Infinity,
  pendingComponent: LabPending,
  head: () => ({
    meta: [
      { title: `Particle lab — ${site.name}` },
      {
        name: 'description',
        content:
          'A playground for the particle engine behind kgroat.dev: logos that dance to sound.',
      },
    ],
    links: [{ rel: 'canonical', href: absoluteUrl('/lab') }],
  }),
  component: LabPage,
})

function LabPending() {
  return (
    <main id="main" className="grid min-h-dvh place-items-center bg-night-950 text-mist-300">
      <p className="animate-pulse font-mono text-sm tracking-widest uppercase">
        Warming up the particles…
      </p>
    </main>
  )
}

function LabPage() {
  const swatches = Route.useLoaderData()
  const { shape } = Route.useSearch()
  const current = swatches.find((swatch) => swatch.slug === shape) ?? swatches[0]

  const [field, setField] = useState<Field>()
  const [source, setSource] = useState<AudioKind>()
  const [note, setNote] = useState<{ label: string; color: string }>()
  const [error, setError] = useState<string>()
  const rig = useRef<AudioRig>(undefined)

  useEffect(() => {
    if (field && current) {
      field.show({ shape: `icon:${current.icon}`, color: current.color, placement: 'center' })
    }
  }, [field, current])

  // Analyse the audio every frame: loudness drives energy, the dominant pitch drives color.
  useEffect(() => {
    const active = rig.current
    if (!field || !source || !active) return
    const spectrum = new Float32Array(active.analyser.frequencyBinCount)
    const wave = new Float32Array(active.analyser.fftSize)
    const state = { lastMidi: -1, frame: 0 }

    const tick = () => {
      state.frame = requestAnimationFrame(tick)
      active.analyser.getFloatFrequencyData(spectrum)
      active.analyser.getFloatTimeDomainData(wave)
      const level = rms(wave)
      field.setEnergy(Math.min(1, level * 6))
      const frequency = dominantFrequency(
        spectrum,
        active.context.sampleRate,
        active.analyser.fftSize,
      )
      const detected = level > 0.008 && frequency ? frequencyToNote(frequency) : undefined
      if (!detected) return
      const color = noteColor(detected.midi)
      field.setTint(color)
      if (detected.midi !== state.lastMidi) {
        state.lastMidi = detected.midi
        setNote({ label: `${detected.name}${detected.octave}`, color })
      }
    }
    state.frame = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(state.frame)
      field.setEnergy(0)
      field.setTint(undefined)
    }
  }, [field, source])

  useEffect(() => () => rig.current?.stop(), [])

  const stop = () => {
    rig.current?.stop()
    rig.current = undefined
    setSource(undefined)
    setNote(undefined)
  }

  const start = async (kind: AudioKind) => {
    stop()
    setError(undefined)
    try {
      rig.current = await startAudio(kind)
      setSource(kind)
    } catch (cause) {
      setError(
        kind === 'mic'
          ? 'Microphone access was blocked. You can still play the demo melody.'
          : `Audio couldn't start: ${cause instanceof Error ? cause.message : String(cause)}`,
      )
    }
  }

  return (
    <div className="relative min-h-dvh overflow-hidden bg-night-950">
      <div aria-hidden className="backdrop-grid pointer-events-none fixed inset-0" />
      <ParticleField mode="manual" onReady={setField} />

      <main id="main" className="relative z-10 flex min-h-dvh flex-col justify-between p-5 sm:p-8">
        <header className="max-w-md">
          <Link to="/" className="text-sm text-mist-400 hover:text-mist-100">
            <span aria-hidden>←</span> kgroat.dev
          </Link>
          <h1 className="mt-4 font-display text-4xl font-bold tracking-tight text-mist-100">
            Particle lab
          </h1>
          <p className="mt-3 text-mist-300">
            The engine behind the home page, in manual mode. Pick a tool, then give it sound: pitch
            picks the color (C is red, then around the wheel) and loudness makes the swarm breathe.
            A nod to the{' '}
            <a
              href="https://soundcolorproject.com/"
              className="text-lilac-300 underline-offset-4 hover:underline"
            >
              Sound Color Project
            </a>
            .
          </p>
        </header>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <nav aria-label="Choose a shape" className="glass max-w-3xl rounded-2xl p-2">
            <ul className="flex flex-wrap gap-1.5">
              {swatches.map((swatch) => (
                <li key={swatch.slug}>
                  <Link
                    to="/lab"
                    search={{ shape: swatch.slug }}
                    replace
                    title={swatch.name}
                    aria-label={swatch.name}
                    aria-current={swatch.slug === current?.slug ? 'true' : undefined}
                    className={cn(
                      'grid size-10 place-items-center rounded-xl transition hover:bg-mist-100/10',
                      swatch.slug === current?.slug ? 'bg-mist-100/15' : 'text-mist-400',
                    )}
                    style={swatch.slug === current?.slug ? { color: swatch.color } : undefined}
                  >
                    <BrandIcon icon={swatch.icon} className="size-5" />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="glass flex flex-wrap items-center gap-2 rounded-2xl p-2 text-sm">
            <span aria-live="polite" className="flex min-w-24 items-center gap-2 px-2 font-mono">
              <span
                aria-hidden
                className="size-3 rounded-full transition-colors"
                style={{ backgroundColor: note?.color ?? 'transparent' }}
              />
              {note ? note.label : source ? 'listening…' : 'silent'}
            </span>
            <button
              type="button"
              onClick={() => void start('demo')}
              aria-pressed={source === 'demo'}
              className="rounded-xl bg-lilac-300 px-4 py-2 font-medium text-night-950 transition hover:bg-peach-300 aria-pressed:bg-peach-300"
            >
              Play a melody
            </button>
            <button
              type="button"
              onClick={() => void start('mic')}
              aria-pressed={source === 'mic'}
              className="rounded-xl border border-mist-100/20 px-4 py-2 text-mist-100 transition hover:border-mist-100/50 aria-pressed:border-peach-300"
            >
              Use microphone
            </button>
            {source ? (
              <button
                type="button"
                onClick={stop}
                className="rounded-xl px-4 py-2 text-mist-300 hover:text-mist-100"
              >
                Stop
              </button>
            ) : null}
          </div>
        </div>
        {error ? (
          <p role="alert" className="mt-3 text-sm text-peach-300">
            {error}
          </p>
        ) : null}
      </main>
    </div>
  )
}
