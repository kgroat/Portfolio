import { writeFile } from 'node:fs/promises'

import { describe, expect, it } from 'vitest'

import { toResumeModel } from '~/lib/resume'

import { loadProfile } from './profile.server'
import { renderResumePdf } from './resume-pdf.server'

const resume = toResumeModel(loadProfile(), '2026-11')

/** Extracts page count from the PDF's page tree (`/Type /Pages … /Count n`). */
function pageCount(pdf: Uint8Array): number {
  const text = new TextDecoder('latin1').decode(pdf)
  const match = /\/Type\s*\/Pages[^>]*?\/Count\s+(\d+)/.exec(text)
  return Number(match?.[1] ?? 0)
}

describe('renderResumePdf', () => {
  it.each(['letter', 'a4'] as const)(
    'renders a %s PDF that fits on two pages',
    async (paper) => {
      const pdf = await renderResumePdf(resume, paper)
      // Set RESUME_PDF_OUT=<dir> to inspect the output; written first so failures can be debugged.
      if (process.env.RESUME_PDF_OUT) {
        await writeFile(`${process.env.RESUME_PDF_OUT}/resume-${paper}.pdf`, pdf)
      }

      expect(new TextDecoder().decode(pdf.slice(0, 5))).toBe('%PDF-')
      expect(pageCount(pdf)).toBeGreaterThanOrEqual(1)
      expect(pageCount(pdf)).toBeLessThanOrEqual(2)
    },
    20_000,
  )

  it('uses the selected paper size', async () => {
    const decode = (pdf: Uint8Array) => new TextDecoder('latin1').decode(pdf)
    // US Letter is 612×792pt; A4 is 595.28×841.89pt.
    expect(decode(await renderResumePdf(resume, 'letter'))).toMatch(/\/MediaBox \[0 0 612 792\]/)
    expect(decode(await renderResumePdf(resume, 'a4'))).toMatch(/\/MediaBox \[0 0 595\.2/)
  }, 20_000)
})
