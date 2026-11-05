import { useEffect, useState } from 'react'

/** Cycles through `words`, re-keying the span so the CSS morph animation replays each time. */
export function MorphingWord({ words, interval = 2600 }: { words: string[]; interval?: number }) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (words.length < 2) return
    const timer = window.setInterval(() => setIndex((i) => (i + 1) % words.length), interval)
    return () => window.clearInterval(timer)
  }, [words.length, interval])

  return (
    <span className="relative inline-grid">
      {/* Reserve the width of the longest word so the line doesn't jump. */}
      <span aria-hidden className="invisible col-start-1 row-start-1">
        {words.reduce((longest, word) => (word.length > longest.length ? word : longest), '')}
      </span>
      <span key={index} aria-hidden className="morph-word text-gradient col-start-1 row-start-1">
        {words[index]}
      </span>
    </span>
  )
}
