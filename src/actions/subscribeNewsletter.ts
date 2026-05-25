'use server'

import { getPayloadClient } from '@/lib/payload'
import { sendWelcomeEmail } from '@/lib/email'
import { createLogger } from '@/lib/logger'

const logger = createLogger('Action:Subscribe')

type Result = { success: true; alreadySubscribed?: boolean } | { success: false; error: string }

export async function subscribeNewsletter(email: string): Promise<Result> {
  const trimmed = email.trim().toLowerCase()
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!trimmed || !emailRegex.test(trimmed)) {
    return { success: false, error: 'Please enter a valid email address.' }
  }

  logger.info('Newsletter subscription attempt', { email: trimmed })

  try {
    const payload = await getPayloadClient()

    // Check for existing subscriber
    const existing = await payload.find({
      collection: 'subscribers',
      where: { email: { equals: trimmed } },
      limit: 1,
    })

    if (existing.totalDocs > 0) {
      const sub = existing.docs[0]
      if (sub.active) {
        logger.info('Already subscribed', { email: trimmed })
        return { success: true, alreadySubscribed: true }
      }
      // Re-activate a previously unsubscribed address
      await payload.update({
        collection: 'subscribers',
        id: sub.id,
        data: { active: true, subscribedAt: new Date().toISOString() },
        overrideAccess: true,
      })
      logger.info('Re-subscribed', { email: trimmed })
      sendWelcomeEmail({ email: trimmed, unsubscribeToken: sub.unsubscribeToken as string }).catch(
        (err) => logger.error('Welcome email failed on resubscribe', { error: String(err) })
      )
      return { success: true }
    }

    // New subscriber
    const token = crypto.randomUUID()
    await payload.create({
      collection: 'subscribers',
      data: {
        email: trimmed,
        active: true,
        subscribedAt: new Date().toISOString(),
        unsubscribeToken: token,
        source: 'website',
      },
      overrideAccess: true,
    })

    logger.info('New subscriber created', { email: trimmed })

    // Fire-and-forget — email failure must not fail the subscription
    sendWelcomeEmail({ email: trimmed, unsubscribeToken: token }).catch((err) =>
      logger.error('Welcome email failed on new subscribe', { error: String(err) })
    )

    return { success: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    logger.error('Newsletter subscription failed', { error: message, email: trimmed })
    return { success: false, error: 'Something went wrong. Please try again.' }
  }
}
