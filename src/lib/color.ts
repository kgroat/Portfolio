export interface Rgb {
  r: number
  g: number
  b: number
}

export function hexToRgb(hex: string): Rgb {
  const match = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim())
  if (!match?.[1]) throw new TypeError(`Invalid hex color "${hex}"`)
  const digits =
    match[1].length === 3 ? [...match[1]].map((digit) => digit + digit).join('') : match[1]
  const value = Number.parseInt(digits, 16)
  return { r: (value >> 16) & 0xff, g: (value >> 8) & 0xff, b: value & 0xff }
}

export function rgbToHex({ r, g, b }: Rgb): string {
  const channel = (value: number) =>
    Math.round(Math.min(255, Math.max(0, value)))
      .toString(16)
      .padStart(2, '0')
  return `#${channel(r)}${channel(g)}${channel(b)}`
}

export function mixRgb(a: Rgb, b: Rgb, t: number): Rgb {
  return {
    r: a.r + (b.r - a.r) * t,
    g: a.g + (b.g - a.g) * t,
    b: a.b + (b.b - a.b) * t,
  }
}

/** WCAG relative luminance, 0 (black) to 1 (white). */
export function relativeLuminance({ r, g, b }: Rgb): number {
  const linear = (channel: number) => {
    const c = channel / 255
    return c <= 0.039_28 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b)
}

const WHITE: Rgb = { r: 255, g: 255, b: 255 }

/** The light variant used for monochrome logos (a soft, slightly cool white). */
export const LIGHT_NEUTRAL = '#e6e4f2'

/**
 * Makes a brand color readable on the dark background.
 *
 * - Bright enough colors are returned unchanged.
 * - Dark *neutral* colors (Next.js, Vercel, GitHub and T3 Code are black) become the light
 *   variant, which is how those brands present themselves on dark backgrounds.
 * - Other dark colors are mixed toward white just enough to reach `minLuminance`, so they keep
 *   their hue.
 */
export function ensureVisibleOnDark(hex: string, minLuminance = 0.18): string {
  const rgb = hexToRgb(hex)
  const chroma = Math.max(rgb.r, rgb.g, rgb.b) - Math.min(rgb.r, rgb.g, rgb.b)
  if (chroma <= 24 && relativeLuminance(rgb) < minLuminance) return LIGHT_NEUTRAL
  // Measure the *rounded* color, since rounding to hex can nudge luminance below the target.
  const candidate = (t: number) => rgbToHex(mixRgb(rgb, WHITE, t))
  const passes = (t: number) => relativeLuminance(hexToRgb(candidate(t))) >= minLuminance
  if (passes(0)) return candidate(0)
  let low = 0
  let high = 1
  for (let step = 0; step < 20; step++) {
    const mid = (low + high) / 2
    if (passes(mid)) high = mid
    else low = mid
  }
  return candidate(high)
}

/** HSL (hue in degrees, saturation/lightness 0–1) to `#rrggbb`. */
export function hslToHex(hue: number, saturation: number, lightness: number): string {
  const h = ((hue % 360) + 360) % 360
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation
  const x = chroma * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = lightness - chroma / 2
  const [r, g, b] =
    h < 60
      ? [chroma, x, 0]
      : h < 120
        ? [x, chroma, 0]
        : h < 180
          ? [0, chroma, x]
          : h < 240
            ? [0, x, chroma]
            : h < 300
              ? [x, 0, chroma]
              : [chroma, 0, x]
  return rgbToHex({ r: (r + m) * 255, g: (g + m) * 255, b: (b + m) * 255 })
}
