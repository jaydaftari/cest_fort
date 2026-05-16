import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { createLogger } from './logger'

const logger = createLogger('PayloadClient')

// getPayload is internally memoized by Payload — safe to call on every request
const getPayloadClient = async () => {
  logger.debug('Requesting Payload client')
  const client = await getPayload({ config: configPromise })
  logger.debug('Payload client ready')
  return client
}

export { getPayloadClient }
