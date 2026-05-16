'use server'

// This file must be a separate server action module so Next.js can properly
// serialize the function reference and mark it as a Server Action.
import { handleServerFunctions } from '@payloadcms/next/layouts'
import type { ServerFunctionClient } from 'payload'
import configPromise from '@payload-config'
import { importMap } from './importMap'
import { createLogger } from '@/lib/logger'

const logger = createLogger('AdminServerFunction')

export const serverFunction: ServerFunctionClient = async (args) => {
  logger.debug('Admin server function called', { name: args.name })
  return handleServerFunctions({
    ...args,
    config: configPromise,
    importMap,
  })
}
