import { midiToFrequency } from './pitch'

/**
 * Browser-only audio sources for the lab. The `.client.ts` suffix makes import protection keep
 * this file out of the server bundle.
 */

export interface AudioRig {
  context: AudioContext
  analyser: AnalyserNode
  stop(): void
}

function createAnalyser(context: AudioContext): AnalyserNode {
  const analyser = context.createAnalyser()
  analyser.fftSize = 4096
  analyser.smoothingTimeConstant = 0.55
  return analyser
}

/** Cmaj7 → Am7 → Fmaj7 → G6, arpeggiated: something pleasant to look at. */
const ARPEGGIO = [
  [60, 64, 67, 71, 72, 71, 67, 64],
  [57, 60, 64, 67, 69, 67, 64, 60],
  [53, 57, 60, 64, 65, 64, 60, 57],
  [55, 59, 62, 64, 67, 64, 62, 59],
].flat()

const STEP_SECONDS = 0.28
const LOOKAHEAD_SECONDS = 0.12

/** A gentle generated arpeggio (no microphone needed). */
export async function startDemo(): Promise<AudioRig> {
  const context = new AudioContext()
  await context.resume()
  const analyser = createAnalyser(context)
  const master = context.createGain()
  master.gain.value = 0.14
  const filter = context.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = 2400
  filter.connect(master)
  master.connect(analyser)
  master.connect(context.destination)

  let step = 0
  let nextTime = context.currentTime + 0.05

  const playNote = (midi: number, at: number) => {
    const voice = context.createGain()
    voice.gain.setValueAtTime(0.0001, at)
    voice.gain.exponentialRampToValueAtTime(1, at + 0.015)
    voice.gain.exponentialRampToValueAtTime(0.0001, at + STEP_SECONDS * 2.2)
    voice.connect(filter)

    const tone = context.createOscillator()
    tone.type = 'triangle'
    tone.frequency.value = midiToFrequency(midi)
    tone.connect(voice)
    tone.start(at)
    tone.stop(at + STEP_SECONDS * 2.4)
  }

  const timer = window.setInterval(() => {
    while (nextTime < context.currentTime + LOOKAHEAD_SECONDS) {
      playNote(ARPEGGIO[step % ARPEGGIO.length] ?? 60, nextTime)
      step += 1
      nextTime += STEP_SECONDS
    }
  }, 25)

  return {
    context,
    analyser,
    stop() {
      window.clearInterval(timer)
      void context.close()
    },
  }
}

/** Live microphone input. Never routed to the speakers. */
export async function startMicrophone(): Promise<AudioRig> {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
  })
  const context = new AudioContext()
  await context.resume()
  const analyser = createAnalyser(context)
  context.createMediaStreamSource(stream).connect(analyser)

  return {
    context,
    analyser,
    stop() {
      for (const track of stream.getTracks()) track.stop()
      void context.close()
    },
  }
}
