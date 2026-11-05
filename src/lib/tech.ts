import type { IconKey } from '~/content/icons'

/** Normalizes a technology name for comparisons: `"Spring Boot"` → `"springboot"`. */
export function normalizeTech(name: string): string {
  return name.toLowerCase().replaceAll(/[^a-z0-9#+]/g, '')
}

/** Maps normalized technology names (as written in the profile) to the icon that represents them. */
const techIcons: Record<string, IconKey> = {
  typescript: 'typescript',
  react: 'react',
  reactnative: 'react',
  nodejs: 'nodejs',
  webpack: 'webpack',
  vite: 'vite',
  nextjs: 'nextjs',
  graphql: 'graphql',
  trpc: 'trpc',
  reactquery: 'reactquery',
  tanstackquery: 'reactquery',
  tanstackstart: 'tanstack',
  tanstackrouter: 'tanstack',
  jest: 'jest',
  vitest: 'vitest',
  cypress: 'cypress',
  docker: 'docker',
  kubernetes: 'kubernetes',
  k8s: 'kubernetes',
  vercel: 'vercel',
  vercelaisdk: 'vercel',
  aisdk: 'vercel',
  flyio: 'flyio',
  gitlab: 'gitlab',
  gitlabci: 'gitlab',
  gitlabduo: 'gitlab',
  github: 'github',
  gleam: 'gleam',
  bash: 'bash',
  nixos: 'nixos',
  godot: 'godot',
  vue: 'vue',
  vuejs: 'vue',
  python: 'python',
  pandas: 'pandas',
  duckdb: 'duckdb',
  argoworkflows: 'argo',
  storybook: 'storybook',
  swr: 'swr',
  figma: 'figma',
  spring: 'spring',
  springboot: 'springboot',
  java: 'java',
  nginx: 'nginx',
  googlecloudrun: 'googlecloud',
  cordova: 'cordova',
  swift: 'swift',
  serverless: 'serverless',
  i18next: 'i18next',
  redux: 'redux',
  rubyonrails: 'rails',
  jenkins: 'jenkins',
  'c#': 'dotnet',
  aspnet: 'dotnet',
  webgl: 'webgl',
  progressivewebapp: 'pwa',
  qwik: 'qwik',
  qwikcity: 'qwik',
  supabase: 'supabase',
  postgresql: 'postgresql',
  prisma: 'prisma',
  googlegemini: 'gemini',
  mistrallarge: 'mistral',
  claudecode: 'claudecode',
  codex: 'codex',
  openaicodex: 'codex',
  t3code: 't3code',
}

export function iconForTech(name: string): IconKey | undefined {
  return techIcons[normalizeTech(name)]
}

/**
 * Picks one representative icon per item for the scroll morph, preferring icons that haven't been
 * featured yet so consecutive items morph into *different* shapes. Items without any iconified
 * technology get `undefined`.
 */
export function pickFeaturedIcons(
  items: ReadonlyArray<{ technologies: readonly string[] }>,
): Array<IconKey | undefined> {
  const used = new Set<IconKey>()
  return items.map(({ technologies }) => {
    const candidates = technologies
      .map(iconForTech)
      .filter((icon): icon is IconKey => icon !== undefined)
    const pick = candidates.find((icon) => !used.has(icon)) ?? candidates[0]
    if (pick) used.add(pick)
    return pick
  })
}
