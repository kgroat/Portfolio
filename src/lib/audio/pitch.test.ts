import { describe, expect, it } from 'vitest'

import { dominantFrequency, frequencyToNote, midiToFrequency, noteColor, rms } from './pitch'

describe('notes', () => {
  it('maps A4 and middle C', () => {
    expect(frequencyToNote(440)).toEqual({ midi: 69, name: 'A', octave: 4, cents: 0 })
    expect(frequencyToNote(261.63)).toMatchObject({ midi: 60, name: 'C', octave: 4 })
  })

  it('reports cents off-pitch', () => {
    expect(frequencyToNote(445)?.cents).toBe(20)
  })

  it('round-trips midi and frequency', () => {
    for (let midi = 21; midi <= 108; midi++) {
      expect(frequencyToNote(midiToFrequency(midi))?.midi).toBe(midi)
    }
  })

  it('ignores silence and nonsense', () => {
    expect(frequencyToNote(0)).toBeUndefined()
    expect(frequencyToNote(Number.NaN)).toBeUndefined()
  })
})

describe('noteColor', () => {
  it('maps C to red and repeats every octave in hue', () => {
    expect(noteColor(60)).toMatch(/^#f\w{5}$/)
    const hue = (hex: string) => hex.slice(1)
    expect(hue(noteColor(60))).not.toBe(hue(noteColor(67)))
  })

  it('brightens higher octaves', () => {
    const lightness = (hex: string) => Number.parseInt(hex.slice(1, 3), 16)
    expect(lightness(noteColor(84))).toBeGreaterThanOrEqual(lightness(noteColor(48)))
  })
})

describe('dominantFrequency', () => {
  const sampleRate = 48_000
  const fftSize = 4096
  const binWidth = sampleRate / fftSize

  const spectrumWithPeak = (frequency: number) => {
    const spectrum = new Float32Array(fftSize / 2).fill(-120)
    const exact = frequency / binWidth
    const bin = Math.round(exact)
    // A parabola-shaped peak centered on the exact (fractional) bin.
    for (const offset of [-1, 0, 1]) {
      spectrum[bin + offset] = -20 - 6 * (bin + offset - exact) ** 2
    }
    return spectrum
  }

  it('finds the peak with sub-bin accuracy', () => {
    expect(dominantFrequency(spectrumWithPeak(440), sampleRate, fftSize)).toBeCloseTo(440, 0)
    expect(dominantFrequency(spectrumWithPeak(523.25), sampleRate, fftSize)).toBeCloseTo(523.25, 0)
  })

  it('returns undefined when everything is below the floor', () => {
    const silence = new Float32Array(fftSize / 2).fill(-120)
    expect(dominantFrequency(silence, sampleRate, fftSize)).toBeUndefined()
  })

  it('ignores peaks outside the search range', () => {
    expect(dominantFrequency(spectrumWithPeak(30), sampleRate, fftSize)).toBeUndefined()
  })
})

describe('rms', () => {
  it('measures signal level', () => {
    expect(rms([])).toBe(0)
    expect(rms([0, 0, 0])).toBe(0)
    const sine = Array.from({ length: 4800 }, (_, i) => Math.sin((2 * Math.PI * 440 * i) / 48_000))
    expect(rms(sine)).toBeCloseTo(Math.SQRT1_2, 2)
  })
})
