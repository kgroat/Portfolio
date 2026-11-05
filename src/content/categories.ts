/** Skill categories, kept apart from the zod schema so client code can use them cheaply. */
export const skillCategories = ['languages', 'build-test', 'platform', 'ai', 'tools'] as const

export type SkillCategory = (typeof skillCategories)[number]

export const skillCategoryLabels: Record<SkillCategory, string> = {
  languages: 'Languages & frameworks',
  'build-test': 'Build & test',
  platform: 'Platform & delivery',
  ai: 'AI & agentic tools',
  tools: 'Tools & play',
}
