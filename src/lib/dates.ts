import type { YearMonth } from '~/content/schema'

const SHORT_MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const

const LONG_MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const

export interface ParsedYearMonth {
  year: number
  /** 1-based month. */
  month: number
}

export function parseYearMonth(value: YearMonth): ParsedYearMonth {
  const match = /^(\d{4})-(\d{2})$/.exec(value)
  if (!match) throw new RangeError(`Invalid year-month "${value}"`)
  const year = Number(match[1])
  const month = Number(match[2])
  if (month < 1 || month > 12) throw new RangeError(`Invalid month in "${value}"`)
  return { year, month }
}

/** Formats a `Date` as a `YYYY-MM` string using UTC so server and client always agree. */
export function toYearMonth(date: Date): YearMonth {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`
}

export function formatYearMonth(value: YearMonth, style: 'short' | 'long' = 'short'): string {
  const { year, month } = parseYearMonth(value)
  const names = style === 'short' ? SHORT_MONTHS : LONG_MONTHS
  return `${names[month - 1]} ${year}`
}

export function formatRange(
  start: YearMonth,
  end: YearMonth | undefined,
  style: 'short' | 'long' = 'short',
): string {
  return `${formatYearMonth(start, style)} – ${end ? formatYearMonth(end, style) : 'Present'}`
}

/**
 * Number of calendar months covered by a range, counting both ends (the convention résumés and
 * LinkedIn use: Jan–Jan is one month, Jan–Dec is twelve).
 */
export function monthsInRange(start: YearMonth, end: YearMonth): number {
  const a = parseYearMonth(start)
  const b = parseYearMonth(end)
  const months = (b.year - a.year) * 12 + (b.month - a.month) + 1
  if (months < 1) throw new RangeError(`Range ends (${end}) before it starts (${start})`)
  return months
}

export function formatDuration(totalMonths: number): string {
  const years = Math.floor(totalMonths / 12)
  const months = totalMonths % 12
  const parts: string[] = []
  if (years > 0) parts.push(`${years} ${years === 1 ? 'yr' : 'yrs'}`)
  if (months > 0) parts.push(`${months} ${months === 1 ? 'mo' : 'mos'}`)
  return parts.join(' ') || '0 mos'
}

export function yearOf(value: YearMonth): number {
  return parseYearMonth(value).year
}

const utcDateFormat = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
})

/** Formats an ISO timestamp deterministically (fixed locale and timezone) to avoid hydration drift. */
export function formatIsoDate(iso: string): string {
  return utcDateFormat.format(new Date(iso))
}
