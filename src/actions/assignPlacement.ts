'use server'

import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { createLogger } from '@/lib/logger'
import { SLOT_BY_ID } from '@/lib/slots'
import type { SlotId } from '@/lib/slots'

const logger = createLogger('Action:AssignPlacement')

type Result = { success: true } | { success: false; error: string }

export async function assignPlacement(
  articleId: string | number,
  slotId: SlotId | ''
): Promise<Result> {
  const headersList = await headers()
  const payload = await getPayload({ config: configPromise })

  // Auth check
  const { user } = await payload.auth({ headers: headersList })
  if (!user) return { success: false, error: 'Unauthorised.' }

  const numericId = Number(articleId)

  try {
    if (!slotId) {
      // Clear placement from this article
      await payload.update({
        collection: 'articles',
        id: numericId,
        data: { placement: '' },
        overrideAccess: false,
        user,
        draft: false,
      })
      logger.info('Placement cleared', { articleId: numericId })
    } else {
      const slot = SLOT_BY_ID[slotId]
      if (!slot) return { success: false, error: 'Unknown slot.' }

      // Exclusive slots: clear any article currently holding this slot
      if (slot.exclusive) {
        const existing = await payload.find({
          collection: 'articles',
          where: { placement: { equals: slotId } },
          limit: 10,
          overrideAccess: true,
        })

        await Promise.all(
          existing.docs
            .filter((doc) => String(doc.id) !== String(articleId))
            .map((doc) =>
              payload.update({
                collection: 'articles',
                id: Number(doc.id),
                data: { placement: '' },
                overrideAccess: false,
                user,
                draft: false,
              })
            )
        )
      }

      // Assign this article to the slot
      await payload.update({
        collection: 'articles',
        id: numericId,
        data: { placement: slotId },
        overrideAccess: false,
        user,
        draft: false,
      })

      logger.info('Placement assigned', { articleId: numericId, slot: slotId })
    }

    // Revalidate affected pages
    revalidatePath('/')
    revalidatePath('/tech')
    revalidatePath('/culture')
    revalidatePath('/fashion')
    revalidatePath('/showbusiness')
    revalidatePath('/leaders-stories')
    revalidatePath('/leaders')
    revalidatePath('/leaders/more')
    revalidatePath(`/editorial/${articleId}`)

    return { success: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    logger.error('Failed to assign placement', { error: message, articleId: numericId, slotId })
    return { success: false, error: 'Failed to assign placement. Please try again.' }
  }
}
