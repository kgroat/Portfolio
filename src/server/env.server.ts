import { z } from 'zod'

const optionalSecret = z
  .string()
  .optional()
  .transform((value) => value?.trim() || undefined)

const serverEnvSchema = z.object({
  GITHUB_TOKEN: optionalSecret,
  GITLAB_TOKEN: optionalSecret,
})

export type ServerEnv = z.output<typeof serverEnvSchema>

/**
 * Reads and validates server environment variables. Read per call (not at module load) so it
 * behaves on runtimes that inject env per request, and so secrets can never be inlined into a
 * client bundle — this file is `.server.ts`, which import protection keeps out of the client.
 */
export function readServerEnv(env: Record<string, string | undefined> = process.env): ServerEnv {
  return serverEnvSchema.parse(env)
}
