import { describe, expect, it } from 'vitest'

import {
  formatDuration,
  formatIsoDate,
  formatRange,
  formatYearMonth,
  monthsInRange,
  parseYearMonth,
  toYearMonth,
} from './dates'

describe('parseYearMonth', () => {
  it('parses YYYY-MM', () => {
    expect(parseYearMonth('2022-11')).toEqual({ year: 2022, month: 11 })
  })

  it.each(['2022-13', '2022-00', '22-11', '2022/11', ''])('rejects %j', (value) => {
    expect(() => parseYearMonth(value)).toThrow(RangeError)
  })
})

describe('formatting', () => {
  it('formats short and long month names', () => {
    expect(formatYearMonth('2012-04')).toBe('Apr 2012')
    expect(formatYearMonth('2012-04', 'long')).toBe('April 2012')
  })

  it('formats ranges, including open-ended ones', () => {
    expect(formatRange('2022-11', '2025-09')).toBe('Nov 2022 – Sep 2025')
    expect(formatRange('2022-11', undefined)).toBe('Nov 2022 – Present')
  })

  it('formats ISO timestamps in UTC so server and client agree', () => {
    // 23:30 on Oct 21 in UTC is already Oct 22 in some timezones; output must not depend on it.
    expect(formatIsoDate('2026-10-21T23:30:00Z')).toBe('Oct 21, 2026')
  })

  it('converts dates to year-months using UTC', () => {
    expect(toYearMonth(new Date('2026-11-05T12:00:00Z'))).toBe('2026-11')
    expect(toYearMonth(new Date('2026-01-01T00:00:00Z'))).toBe('2026-01')
  })
})

describe('monthsInRange', () => {
  it('counts both ends of the range', () => {
    expect(monthsInRange('2025-01', '2025-01')).toBe(1)
    expect(monthsInRange('2025-01', '2025-12')).toBe(12)
    expect(monthsInRange('2022-11', '2025-09')).toBe(35)
  })

  it('rejects ranges that end before they start', () => {
    expect(() => monthsInRange('2025-02', '2025-01')).toThrow(RangeError)
  })
})

describe('formatDuration', () => {
  it.each([
    [1, '1 mo'],
    [11, '11 mos'],
    [12, '1 yr'],
    [13, '1 yr 1 mo'],
    [35, '2 yrs 11 mos'],
    [0, '0 mos'],
  ])('%i months → %s', (months, expected) => {
    expect(formatDuration(months)).toBe(expected)
  })
})
