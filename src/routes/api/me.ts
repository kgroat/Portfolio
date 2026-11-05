import { createFileRoute } from '@tanstack/react-router'

import { loadProfile } from '~/server/profile.server'

/** `GET /api/me` — the raw, validated profile (kept for compatibility with the old site). */
export const Route = createFileRoute('/api/me')({
  server: {
    handlers: {
      GET: () =>
        new Response(JSON.stringify(loadProfile(), null, 2), {
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'public, max-age=3600, s-maxage=86400',
          },
        }),
    },
  },
})
