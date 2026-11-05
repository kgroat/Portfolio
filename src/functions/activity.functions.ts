import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { loadActivityFeed } from '~/server/activity.server'
import { readServerEnv } from '~/server/env.server'

/** Recent public repositories from GitHub and GitLab. Never throws for upstream failures. */
export const getActivity = createServerFn({ method: 'GET' })
  .validator(z.object({ limit: z.number().int().min(1).max(12).default(6) }))
  .handler(({ data }) => loadActivityFeed(data.limit, readServerEnv()))
