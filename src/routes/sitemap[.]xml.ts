import { createFileRoute } from '@tanstack/react-router'

import { absoluteUrl } from '~/lib/site'

const pages = ['/', '/resume', '/lab'] as const

export const Route = createFileRoute('/sitemap.xml')({
  server: {
    handlers: {
      GET: () => {
        const urls = pages.map((path) => `  <url><loc>${absoluteUrl(path)}</loc></url>`).join('\n')
        return new Response(
          `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
          {
            headers: {
              'Content-Type': 'application/xml; charset=utf-8',
              'Cache-Control': 'public, max-age=3600, s-maxage=86400',
            },
          },
        )
      },
    },
  },
})
