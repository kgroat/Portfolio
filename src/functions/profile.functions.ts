import { createServerFn } from '@tanstack/react-start'

import { toResumeModel } from '~/lib/resume'
import {
  currentYearMonth,
  loadProfile,
  loadProfileView,
  loadSkillSwatches,
} from '~/server/profile.server'

/**
 * Typed RPC boundary for profile data. These are safe to import anywhere: the compiler swaps each
 * handler for a fetch stub in the client bundle, so the server-only modules they call never ship.
 */

/** Everything the home page needs (profile + derived stats and visuals). */
export const getProfileView = createServerFn({ method: 'GET' }).handler(() => loadProfileView())

/** The presentation model shared by the HTML résumé and the PDF. */
export const getResume = createServerFn({ method: 'GET' }).handler(() =>
  toResumeModel(loadProfile(), currentYearMonth()),
)

/** Just the skills' names, icons and colors, for the lab. */
export const getSkillSwatches = createServerFn({ method: 'GET' }).handler(() => loadSkillSwatches())
