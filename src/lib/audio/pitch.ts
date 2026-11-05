import { hslToHex } from '~/lib/color'

/** Pure pitch helpers for the lab's sound-to-color mapping. */

export const NOTE_NAMES = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'] as const

export interface Note {
  midi: number
  name: (typeof NOTE_NAMES)[number]
  octave: number
  /** How far the frequency is from the note, -50 to +50 cents. */
  cents: number
}

export function midiToFrequency(midi: number): number {
  return 440 * 2 ** ((midi - 69) / 12)
}

export function frequencyToNote(frequency: number): Note | undefined {
  if (!(frequency > 0) || !Number.isFinite(frequency)) return undefined
  const exact = 69 + 12 * Math.log2(frequency / 440)
  const midi = Math.round(exact)
  const pitchClass = ((midi % 12) + 12) % 12
  return {
    midi,
    name: NOTE_NAMES[pitchClass] ?? 'C',
    octave: Math.floor(midi / 12) - 1,
    cents: Math.round((exact - midi) * 100),
  }
}

/**
 * Maps a note to a color: the pitch class picks the hue (C is red, then around the color wheel
 * in semitone steps of 30°), and the octave nudges lightness so high notes glow brighter.
 */
export function noteColor(midi: number): string {
  const pitchClass = ((midi % 12) + 12) % 12
  const octave = Math.floor(midi / 12) - 1
  const lightness = Math.min(0.82, Math.max(0.6, 0.64 + (octave - 4) * 0.06))
  return hslToHex(pitchClass * 30, 0.9, lightness)
}

export interface PeakOptions {
  minHz?: number
  maxHz?: number
  /** Bins quieter than this (dBFS) are ignored. */
  floorDb?: number
}

/**
 * Finds the loudest frequency in an FFT magnitude spectrum (in dB, as returned by
 * `AnalyserNode.getFloatFrequencyData`), refined with parabolic interpolation between bins.
 */
export function dominantFrequency(
  spectrum: ArrayLike<number>,
  sampleRate: number,
  fftSize: number,
  { minHz = 60, maxHz = 2000, floorDb = -70 }: PeakOptions = {},
): number | undefined {
  const binWidth = sampleRate / fftSize
  const first = Math.max(1, Math.floor(minHz / binWidth))
  const last = Math.min(spectrum.length - 2, Math.ceil(maxHz / binWidth))

  let peak = -1
  let peakDb = floorDb
  for (let bin = first; bin <= last; bin++) {
    const db = spectrum[bin] ?? -Infinity
    if (db > peakDb) {
      peakDb = db
      peak = bin
    }
  }
  if (peak < 0) return undefined

  const left = spectrum[peak - 1] ?? peakDb
  const right = spectrum[peak + 1] ?? peakDb
  const denominator = left - 2 * peakDb + right
  const shift = denominator === 0 ? 0 : (0.5 * (left - right)) / denominator
  return (peak + shift) * binWidth
}

/** Root-mean-square level of a block of samples (0 = silence, ~0.7 = full-scale sine). */
export function rms(samples: ArrayLike<number>): number {
  if (samples.length === 0) return 0
  let sum = 0
  for (let i = 0; i < samples.length; i++) {
    const value = samples[i] ?? 0
    sum += value * value
  }
  return Math.sqrt(sum / samples.length)
}
