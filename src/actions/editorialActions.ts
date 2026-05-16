'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { createLogger } from '@/lib/logger'

const logger = createLogger('Action:Editorial')

type ActionResult = { success: boolean; error?: string }

async function getAuthenticatedPayload() {
  const headersList = await headers()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers: headersList })
  if (!user) throw new Error('Unauthorized')
  return { payload, user }
}

export async function markInReview(articleId: string): Promise<ActionResult> {
  try {
    const { payload, user } = await getAuthenticatedPayload()
    logger.info('Mark in review', { articleId, editor: user.email })
    await payload.update({
      collection: 'articles',
      id: Number(articleId),
      data: { workflowStatus: 'in_review' },
      overrideAccess: false,
      user,
    })
    revalidatePath('/editorial')
    revalidatePath(`/editorial/${articleId}`)
    return { success: true }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to update status'
    logger.error('markInReview failed', { articleId, error: msg })
    return { success: false, error: msg }
  }
}

export async function approveArticle(articleId: string): Promise<ActionResult> {
  try {
    const { payload, user } = await getAuthenticatedPayload()
    logger.info('Approve article', { articleId, editor: user.email })
    await payload.update({
      collection: 'articles',
      id: Number(articleId),
      data: {
        workflowStatus: 'approved',
        _status: 'published',
        publishedAt: new Date().toISOString(),
      },
      overrideAccess: false,
      user,
      draft: false,
    })
    revalidatePath('/editorial')
    revalidatePath(`/editorial/${articleId}`)
    // Revalidate public article pages so they appear live
    revalidatePath('/[category]', 'page')
    revalidatePath('/', 'page')
    return { success: true }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to approve article'
    logger.error('approveArticle failed', { articleId, error: msg })
    return { success: false, error: msg }
  }
}

export async function rejectArticle(articleId: string, note?: string): Promise<ActionResult> {
  try {
    const { payload, user } = await getAuthenticatedPayload()
    logger.info('Reject article', { articleId, editor: user.email })
    const data: Record<string, unknown> = { workflowStatus: 'rejected' }
    if (note?.trim()) data.editorialNote = note.trim()
    await payload.update({
      collection: 'articles',
      id: Number(articleId),
      data,
      overrideAccess: false,
      user,
    })
    revalidatePath('/editorial')
    revalidatePath(`/editorial/${articleId}`)
    return { success: true }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to reject article'
    logger.error('rejectArticle failed', { articleId, error: msg })
    return { success: false, error: msg }
  }
}

export async function saveEditorialNote(articleId: string, note: string): Promise<ActionResult> {
  try {
    const { payload, user } = await getAuthenticatedPayload()
    logger.info('Save editorial note', { articleId, editor: user.email })
    await payload.update({
      collection: 'articles',
      id: Number(articleId),
      data: { editorialNote: note },
      overrideAccess: false,
      user,
    })
    revalidatePath(`/editorial/${articleId}`)
    return { success: true }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to save note'
    logger.error('saveEditorialNote failed', { articleId, error: msg })
    return { success: false, error: msg }
  }
}
