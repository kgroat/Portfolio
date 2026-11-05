import { createRouter } from '@tanstack/react-router'

import { NotFound } from '~/components/NotFound'
import { RouteError } from '~/components/RouteError'

import { routeTree } from './routeTree.gen'

export function getRouter() {
  return createRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreload: 'intent',
    defaultErrorComponent: RouteError,
    defaultNotFoundComponent: NotFound,
  })
}
