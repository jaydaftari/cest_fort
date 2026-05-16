import { REST_DELETE, REST_GET, REST_PATCH, REST_POST } from '@payloadcms/next/routes'
import configPromise from '@payload-config'
import { createLogger } from '@/lib/logger'

const logger = createLogger('API:Route')

// REST_GET/POST/etc. are curried: call with config → returns the actual Next.js route handler
export const GET = REST_GET(configPromise)
export const POST = REST_POST(configPromise)
export const DELETE = REST_DELETE(configPromise)
export const PATCH = REST_PATCH(configPromise)

// Log all API traffic via the Payload beforeOperation global hook instead
// (logging here would require wrapping the handlers in a way that fights the type system)
logger.info('Payload REST route handlers registered')
