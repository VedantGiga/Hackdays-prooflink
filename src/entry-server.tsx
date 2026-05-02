import {
  createMemoryHistory,
  StartServer,
} from '@tanstack/react-start/server'
import { createRouter } from './router'
import {
  createRequestHandler,
} from '@tanstack/react-start/server'

export default createRequestHandler({
  createRouter,
  getRouterContext: async () => ({
    // Add any context you need here
  }),
})
