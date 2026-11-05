import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

import { toResumeModel } from '~/lib/resume'
import { parseSearchParams, pdfSearchSchema } from '~/lib/search'
import { site } from '~/lib/site'
import { currentYearMonth, loadProfile } from '~/server/profile.server'
import { renderResumePdf } from '~/server/resume-pdf.server'

/**
 * `GET /resume.pdf?paper=letter|a4&download=true`
 *
 * Rendered on demand with react-pdf, then cached at the CDN for a day (each deploy starts a fresh
 * cache, and the current role's duration changes monthly).
 * The `server` block is stripped from the client bundle, so react-pdf never ships to browsers.
 */
export const Route = createFileRoute('/resume.pdf')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const search = parseSearchParams(pdfSearchSchema, new URL(request.url).searchParams)
        if (!search.success) {
          return Response.json(
            { error: 'Invalid query parameters', fields: z.flattenError(search.error).fieldErrors },
            { status: 400 },
          )
        }

        const { paper, download } = search.data
        const pdf = await renderResumePdf(toResumeModel(loadProfile(), currentYearMonth()), paper)
        const fileName =
          paper === 'a4' ? site.pdfFileName.replace(/\.pdf$/, '-A4.pdf') : site.pdfFileName

        return new Response(pdf, {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `${download ? 'attachment' : 'inline'}; filename="${fileName}"`,
            'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400',
          },
        })
      },
    },
  },
})
