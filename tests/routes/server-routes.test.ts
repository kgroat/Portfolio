import { describe, expect, it } from 'vitest'

import { Route as MeRoute } from '~/routes/api/me'
import { Route as JsonResumeRoute } from '~/routes/resume[.]json'
import { Route as PdfRoute } from '~/routes/resume[.]pdf'
import { Route as SitemapRoute } from '~/routes/sitemap[.]xml'

type Handler = (ctx: { request: Request }) => Response | Promise<Response>

/** Pulls the GET handler off a file route's `server.handlers` object. */
function getHandler(route: { options: unknown }): Handler {
  const { server } = route.options as { server?: { handlers?: { GET?: Handler } } }
  const handler = server?.handlers?.GET
  if (!handler) throw new Error('Route has no GET handler')
  return handler
}

const call = (route: { options: unknown }, url: string) =>
  getHandler(route)({ request: new Request(new URL(url, 'https://www.kgroat.dev')) })

describe('GET /resume.pdf', () => {
  it('serves an inline Letter PDF by default, cacheable at the CDN', async () => {
    const response = await call(PdfRoute, '/resume.pdf')
    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toBe('application/pdf')
    expect(response.headers.get('Content-Disposition')).toBe(
      'inline; filename="Kevin-Groat-Resume.pdf"',
    )
    expect(response.headers.get('Cache-Control')).toContain('s-maxage=')
    const bytes = new Uint8Array(await response.arrayBuffer())
    expect(new TextDecoder().decode(bytes.slice(0, 5))).toBe('%PDF-')
  }, 20_000)

  it('serves an A4 attachment on request', async () => {
    const response = await call(PdfRoute, '/resume.pdf?paper=a4&download=1')
    expect(response.headers.get('Content-Disposition')).toBe(
      'attachment; filename="Kevin-Groat-Resume-A4.pdf"',
    )
  }, 20_000)

  it('rejects invalid query parameters with a 400', async () => {
    const response = await call(PdfRoute, '/resume.pdf?paper=tabloid')
    expect(response.status).toBe(400)
    expect(await response.json()).toMatchObject({ fields: { paper: [expect.any(String)] } })
  })
})

describe('JSON endpoints', () => {
  it('GET /resume.json serves JSON Resume with CORS', async () => {
    const response = await call(JsonResumeRoute, '/resume.json')
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*')
    expect(await response.json()).toMatchObject({ basics: { name: 'Kevin Groat' } })
  })

  it('GET /api/me serves the validated profile', async () => {
    const response = await call(MeRoute, '/api/me')
    const body = (await response.json()) as { skills: unknown[] }
    expect(body.skills.length).toBeGreaterThan(10)
  })
})

describe('GET /sitemap.xml', () => {
  it('lists the public pages with absolute URLs', async () => {
    const xml = await (await call(SitemapRoute, '/sitemap.xml')).text()
    expect(xml).toContain('<loc>https://www.kgroat.dev/</loc>')
    expect(xml).toContain('<loc>https://www.kgroat.dev/resume</loc>')
  })
})
