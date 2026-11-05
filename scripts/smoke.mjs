// Boots the production build (`pnpm build`) and checks every route end to end.
// Catches what unit tests can't: bundling, tracing and server-route wiring.
import { spawn } from 'node:child_process'
import { createServer } from 'node:net'
import { setTimeout as sleep } from 'node:timers/promises'

const entry = new URL('../.output/server/index.mjs', import.meta.url)

const freePort = () =>
  new Promise((resolve, reject) => {
    const server = createServer()
    server.on('error', reject)
    server.listen(0, () => {
      const { port } = server.address()
      server.close(() => resolve(port))
    })
  })

const port = await freePort()
const base = `http://localhost:${port}`
const server = spawn(process.execPath, [entry.pathname], {
  env: { ...process.env, PORT: String(port), NODE_ENV: 'production' },
  stdio: ['ignore', 'inherit', 'inherit'],
})

const checks = [
  {
    path: '/',
    status: 200,
    type: 'text/html',
    includes: ['<h1', 'data-scene=', 'application/ld+json'],
  },
  { path: '/?skill=react', status: 200, type: 'text/html' },
  { path: '/resume', status: 200, type: 'text/html', includes: ['Experience', 'size: letter'] },
  { path: '/resume?paper=a4', status: 200, type: 'text/html', includes: ['size: A4'] },
  { path: '/lab', status: 200, type: 'text/html', includes: ['Warming up the particles'] },
  { path: '/resume.pdf', status: 200, type: 'application/pdf', startsWith: '%PDF-' },
  { path: '/resume.pdf?paper=a4&download=1', status: 200, type: 'application/pdf' },
  { path: '/resume.pdf?paper=tabloid', status: 400, type: 'application/json' },
  { path: '/resume.json', status: 200, type: 'application/json', includes: ['"basics"'] },
  { path: '/api/me', status: 200, type: 'application/json', includes: ['"skills"'] },
  { path: '/sitemap.xml', status: 200, type: 'application/xml' },
  { path: '/robots.txt', status: 200, type: 'text/plain' },
  { path: '/definitely-not-a-page', status: 404, type: 'text/html' },
]

let failures = 0
try {
  for (let attempt = 0; ; attempt++) {
    try {
      await fetch(base)
      break
    } catch (error) {
      if (attempt > 50) throw error
      await sleep(100)
    }
  }

  for (const check of checks) {
    const response = await fetch(base + check.path, { redirect: 'manual' })
    const body = Buffer.from(await response.arrayBuffer())
    const text = body.toString('latin1')
    const problems = []
    if (response.status !== check.status) problems.push(`status ${response.status}`)
    if (!response.headers.get('content-type')?.startsWith(check.type)) {
      problems.push(`content-type ${response.headers.get('content-type')}`)
    }
    for (const needle of check.includes ?? []) {
      if (!text.includes(needle)) problems.push(`missing ${JSON.stringify(needle)}`)
    }
    if (check.startsWith && !text.startsWith(check.startsWith)) problems.push('bad signature')

    if (problems.length > 0) failures += 1
    console.log(
      `${problems.length ? '✗' : '✓'} ${check.path}${problems.length ? `  (${problems.join(', ')})` : ''}`,
    )
  }
} finally {
  server.kill()
}

if (failures > 0) {
  console.error(`\n${failures} smoke check(s) failed`)
  process.exit(1)
}
console.log(`\nAll ${checks.length} smoke checks passed`)
