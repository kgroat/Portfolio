/** Public, client-safe site constants. Personal data lives in the server-only profile. */
export const site = {
  url: 'https://www.kgroat.dev',
  name: 'Kevin Groat',
  title: 'Kevin Groat — Software architect & engineer',
  description:
    'Kevin Groat is a software architect and engineer who writes maintainable code and builds user-friendly experiences with TypeScript, React, and the modern web platform.',
  themeColor: '#070917',
  pdfFileName: 'Kevin-Groat-Resume.pdf',
} as const

export function absoluteUrl(path: string): string {
  return new URL(path, site.url).href
}
