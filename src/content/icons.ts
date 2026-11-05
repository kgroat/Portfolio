import {
  siApachecordova,
  siArgo,
  siClaudecode,
  siCypress,
  siDocker,
  siDotnet,
  siDuckdb,
  siFigma,
  siFlydotio,
  siGithub,
  siGitlab,
  siGleam,
  siGnubash,
  siGodotengine,
  siGooglecloud,
  siGooglegemini,
  siGraphql,
  siI18next,
  siJenkins,
  siJest,
  siKubernetes,
  siMistralai,
  siNextdotjs,
  siNginx,
  siNixos,
  siNodedotjs,
  siOpenjdk,
  siPandas,
  siPostgresql,
  siPrisma,
  siPwa,
  siPython,
  siQwik,
  siReact,
  siReactquery,
  siRedux,
  siRubyonrails,
  siServerless,
  siSpring,
  siSpringboot,
  siStorybook,
  siSupabase,
  siSwift,
  siSwr,
  siTanstack,
  siTrpc,
  siTypescript,
  siVercel,
  siVite,
  siVitest,
  siVuedotjs,
  siWebgl,
  siWebpack,
} from 'simple-icons'

export interface IconData {
  title: string
  /** SVG path data. */
  path: string
  /** Brand color as `#rrggbb`. */
  hex: string
  /** Side length of the square viewBox the path is drawn in. */
  size: number
  fillRule: 'nonzero' | 'evenodd'
  /**
   * How the particle field draws it, for logos that read poorly as a solid swarm:
   * - `knockout`: a solid badge with the glyph cut out (TypeScript, GitHub) is inverted, so the
   *   glyph is solid and the badge an outline.
   * - `edges`: detail carved by channels open to the outside (Webpack, bash) is traced as lines.
   */
  particles?: ParticleStyle
}

export type ParticleStyle = 'knockout' | 'edges'

interface SimpleIcon {
  title: string
  path: string
  hex: string
}

const simple = ({ title, path, hex }: SimpleIcon, particles?: ParticleStyle): IconData => ({
  title,
  path,
  hex: `#${hex}`,
  size: 24,
  fillRule: 'nonzero',
  ...(particles ? { particles } : {}),
})

/**
 * Visual Studio Code, as Microsoft's own monochrome mark from its codicons set (CC BY 4.0,
 * https://github.com/microsoft/vscode-codicons). Microsoft's logos aren't in simple-icons. The
 * color is VS Code's brand blue (https://code.visualstudio.com/brand).
 */
const vscode: IconData = {
  title: 'Visual Studio Code',
  hex: '#007ACC',
  size: 16,
  fillRule: 'nonzero',
  path: 'M15.434 1.72887L12.14 0.144875C12.002 0.078875 11.855 0.046875 11.709 0.046875C11.353 0.046875 11.18 0.211875 11.155 0.228875C11.073 0.270875 11.005 0.337875 11.004 0.338875L4.698 6.08888L1.951 4.00488C1.832 3.91388 1.69 3.86987 1.548 3.86987C1.387 3.86987 1.226 3.92788 1.1 4.04288L0.219 4.84387C0.074 4.97587 0.001 5.15688 0.001 5.33687C0.001 5.51687 0.073 5.69688 0.218 5.82888L2.6 8.00088L0.217 10.1719C0.072 10.3039 0 10.4839 0 10.6639C0 10.8439 0.073 11.0249 0.218 11.1569L1.099 11.9579C1.226 12.0729 1.386 12.1309 1.547 12.1309C1.688 12.1309 1.83 12.0859 1.95 11.9959L4.697 9.91187L11.003 15.6619C11.003 15.6619 11.072 15.7299 11.155 15.7719C11.179 15.7889 11.353 15.9529 11.709 15.9529C11.855 15.9529 12.003 15.9209 12.141 15.8549L15.435 14.2709C15.781 14.1049 16.001 13.7539 16.001 13.3699V2.62888C16.001 2.24487 15.781 1.89488 15.435 1.72787L15.434 1.72887ZM7.217 7.99988L12.002 4.36987V11.6299L7.217 7.99988Z',
}

const linkedin: IconData = {
  title: 'LinkedIn',
  hex: '#0A66C2',
  size: 72,
  fillRule: 'evenodd',
  particles: 'knockout',
  path: 'M8 72h56a8 8 0 0 0 8-8V8a8 8 0 0 0-8-8H8a8 8 0 0 0-8 8v56a8 8 0 0 0 8 8zM62 62H51.3V43.8c0-5-1.9-7.8-5.8-7.8-4.3 0-6.6 2.9-6.6 7.8V62H28.6V27.3h10.3V32s3.1-5.7 10.5-5.7S62 30.8 62 40.1V62zM16.3 22.8a6.4 6.4 0 1 1 0-12.8 6.4 6.4 0 0 1 0 12.8zM11 62h10.8V27.3H11V62z',
}

const email: IconData = {
  title: 'Email',
  hex: '#22D3EE',
  size: 24,
  fillRule: 'evenodd',
  path: 'M3 4h18a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1zm1.6 2L12 11.3 19.4 6H4.6zM4 7.9V18h16V7.9l-8 5.7-8-5.7z',
}

/**
 * OpenAI Codex, from LobeHub's icon set (MIT, https://github.com/lobehub/lobe-icons). OpenAI's
 * marks aren't in simple-icons. Color is the midpoint of Codex's blue-violet brand gradient.
 */
const codex: IconData = {
  title: 'OpenAI Codex',
  hex: '#7A9DFF',
  size: 24,
  fillRule: 'evenodd',
  particles: 'knockout',
  path: 'M8.086.457a6.105 6.105 0 013.046-.415c1.333.153 2.521.72 3.564 1.7a.117.117 0 00.107.029c1.408-.346 2.762-.224 4.061.366l.063.03.154.076c1.357.703 2.33 1.77 2.918 3.198.278.679.418 1.388.421 2.126a5.655 5.655 0 01-.18 1.631.167.167 0 00.04.155 5.982 5.982 0 011.578 2.891c.385 1.901-.01 3.615-1.183 5.14l-.182.22a6.063 6.063 0 01-2.934 1.851.162.162 0 00-.108.102c-.255.736-.511 1.364-.987 1.992-1.199 1.582-2.962 2.462-4.948 2.451-1.583-.008-2.986-.587-4.21-1.736a.145.145 0 00-.14-.032c-.518.167-1.04.191-1.604.185a5.924 5.924 0 01-2.595-.622 6.058 6.058 0 01-2.146-1.781c-.203-.269-.404-.522-.551-.821a7.74 7.74 0 01-.495-1.283 6.11 6.11 0 01-.017-3.064.166.166 0 00.008-.074.115.115 0 00-.037-.064 5.958 5.958 0 01-1.38-2.202 5.196 5.196 0 01-.333-1.589 6.915 6.915 0 01.188-2.132c.45-1.484 1.309-2.648 2.577-3.493.282-.188.55-.334.802-.438.286-.12.573-.22.861-.304a.129.129 0 00.087-.087A6.016 6.016 0 015.635 2.31C6.315 1.464 7.132.846 8.086.457zm-.804 7.85a.848.848 0 00-1.473.842l1.694 2.965-1.688 2.848a.849.849 0 001.46.864l1.94-3.272a.849.849 0 00.007-.854l-1.94-3.393zm5.446 6.24a.849.849 0 000 1.695h4.848a.849.849 0 000-1.696h-4.848z',
}

/**
 * T3 Code's logo, from its repository (MIT, https://github.com/pingdotgg/t3code): the black tile
 * and the "T3" knocked out of it, combined into one even-odd path.
 */
const t3code: IconData = {
  title: 'T3 Code',
  hex: '#000000',
  size: 128,
  fillRule: 'evenodd',
  particles: 'knockout',
  path: 'M0 10C0 4.47715 4.47715 0 10 0H118C123.523 0 128 4.47715 128 10V118C128 123.523 123.523 128 118 128H10C4.47715 128 0 123.523 0 118V10ZM33.4509 93V47.56H15.5309V37H64.3309V47.56H46.4109V93H33.4509ZM86.7253 93.96C82.832 93.96 78.9653 93.4533 75.1253 92.44C71.2853 91.3733 68.032 89.88 65.3653 87.96L70.4053 78.04C72.5386 79.5867 75.0186 80.8133 77.8453 81.72C80.672 82.6267 83.5253 83.08 86.4053 83.08C89.6586 83.08 92.2186 82.44 94.0853 81.16C95.952 79.88 96.8853 78.12 96.8853 75.88C96.8853 73.7467 96.0586 72.0667 94.4053 70.84C92.752 69.6133 90.0853 69 86.4053 69H80.4853V60.44L96.0853 42.76L97.5253 47.4H68.1653V37H107.365V45.4L91.8453 63.08L85.2853 59.32H89.0453C95.9253 59.32 101.125 60.8667 104.645 63.96C108.165 67.0533 109.925 71.0267 109.925 75.88C109.925 79.0267 109.099 81.9867 107.445 84.76C105.792 87.48 103.259 89.6933 99.8453 91.4C96.432 93.1067 92.0586 93.96 86.7253 93.96Z',
}

/** Kevin's own KG monogram (from the original favicon). */
const monogram: IconData = {
  title: 'KG',
  hex: '#CEABFF',
  size: 120,
  fillRule: 'nonzero',
  path: 'M5.3 25h7.6v31.7h16.3L47.3 25h8.2L35.6 59.9 57 95h-8.4L29.3 63.5H12.9V95H5.3zM62.5 84V36l11-11h30.6l10.6 10.6V42h-7.6v-3.9l-6.4-6.3H76.9l-6.8 6.7v43l6.8 6.7h23.4l6.8-6.7V65.3H91.3v-6.8h23.4V84l-11 11H73.5z',
}

export const icons = {
  monogram,
  typescript: simple(siTypescript, 'knockout'),
  react: simple(siReact),
  nodejs: simple(siNodedotjs),
  webpack: simple(siWebpack, 'edges'),
  vite: simple(siVite),
  nextjs: simple(siNextdotjs),
  graphql: simple(siGraphql),
  trpc: simple(siTrpc),
  reactquery: simple(siReactquery),
  tanstack: simple(siTanstack, 'knockout'),
  jest: simple(siJest),
  vitest: simple(siVitest),
  cypress: simple(siCypress),
  vscode,
  claudecode: simple(siClaudecode, 'knockout'),
  codex,
  t3code,
  docker: simple(siDocker, 'knockout'),
  kubernetes: simple(siKubernetes, 'knockout'),
  vercel: simple(siVercel),
  flyio: simple(siFlydotio),
  gitlab: simple(siGitlab),
  github: simple(siGithub),
  gleam: simple(siGleam, 'knockout'),
  bash: simple(siGnubash, 'edges'),
  nixos: simple(siNixos),
  godot: simple(siGodotengine, 'knockout'),
  vue: simple(siVuedotjs),
  python: simple(siPython, 'edges'),
  pandas: simple(siPandas),
  duckdb: simple(siDuckdb, 'knockout'),
  argo: simple(siArgo),
  storybook: simple(siStorybook, 'knockout'),
  swr: simple(siSwr),
  figma: simple(siFigma),
  spring: simple(siSpring, 'edges'),
  springboot: simple(siSpringboot, 'knockout'),
  java: simple(siOpenjdk),
  nginx: simple(siNginx, 'knockout'),
  googlecloud: simple(siGooglecloud),
  cordova: simple(siApachecordova, 'edges'),
  swift: simple(siSwift, 'knockout'),
  serverless: simple(siServerless),
  i18next: simple(siI18next),
  redux: simple(siRedux),
  rails: simple(siRubyonrails),
  jenkins: simple(siJenkins),
  dotnet: simple(siDotnet),
  webgl: simple(siWebgl),
  pwa: simple(siPwa),
  qwik: simple(siQwik, 'knockout'),
  supabase: simple(siSupabase),
  postgresql: simple(siPostgresql),
  prisma: simple(siPrisma),
  gemini: simple(siGooglegemini),
  mistral: simple(siMistralai),
  linkedin,
  email,
} as const satisfies Record<string, IconData>

export type IconKey = keyof typeof icons

export const iconKeys = Object.keys(icons) as [IconKey, ...IconKey[]]

export function getIcon(key: IconKey): IconData {
  return icons[key]
}
