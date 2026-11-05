import { createFileRoute } from '@tanstack/react-router'

import { toJsonResume } from '~/lib/json-resume'
import { loadProfile } from '~/server/profile.server'

/** `GET /resume.json` — the résumé in the open JSON Resume format. Public, CORS-enabled. */
export const Route = createFileRoute('/resume.json')({
  server: {
    handlers: {
      GET: () =>
        new Response(JSON.stringify(toJsonResume(loadProfile()), null, 2), {
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'public, max-age=3600, s-maxage=86400',
          },
        }),
    },
  },
})
