/// <reference types="vite/client" />
import { createRootRoute, HeadContent, Outlet, Scripts } from '@tanstack/react-router'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import type { ReactNode } from 'react'

import { absoluteUrl, site } from '~/lib/site'

import appCss from '~/styles/app.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
      { title: site.title },
      { name: 'description', content: site.description },
      { name: 'theme-color', content: site.themeColor },
      { name: 'author', content: site.name },
      { property: 'og:site_name', content: site.name },
      { property: 'og:type', content: 'website' },
      { property: 'og:title', content: site.title },
      { property: 'og:description', content: site.description },
      { property: 'og:image', content: absoluteUrl('/avatar.jpg') },
      { name: 'twitter:card', content: 'summary' },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
      { rel: 'icon', type: 'image/png', sizes: '512x512', href: '/favicon.png' },
      { rel: 'apple-touch-icon', href: '/favicon.png' },
      { rel: 'alternate', type: 'application/pdf', href: '/resume.pdf', title: 'Résumé (PDF)' },
      {
        rel: 'alternate',
        type: 'application/json',
        href: '/resume.json',
        title: 'Résumé (JSON Resume)',
      },
    ],
  }),
  shellComponent: RootDocument,
  component: Outlet,
})

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <a
          href="#main"
          className="sr-only z-100 rounded-full bg-peach-300 px-4 py-2 font-medium text-night-950 focus:not-sr-only focus:fixed focus:top-4 focus:left-4"
        >
          Skip to content
        </a>
        {children}
        {/* Only Vercel serves these scripts; elsewhere they would just 404. */}
        {__VERCEL__ ? (
          <>
            <Analytics />
            <SpeedInsights />
          </>
        ) : null}
        <Scripts />
      </body>
    </html>
  )
}
