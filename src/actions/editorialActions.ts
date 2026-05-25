'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { createLogger } from '@/lib/logger'
import { deleteFilesFromS3 } from '@/lib/s3'

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
    // Revalidate public pages so the article appears live
    revalidatePath('/')
    revalidatePath('/leaders')
    revalidatePath('/tech')
    revalidatePath('/culture')
    revalidatePath('/fashion')
    revalidatePath('/showbusiness')
    // Bust the article's own ISR cache by slug
    const updated = await payload.findByID({
      collection: 'articles',
      id: Number(articleId),
      depth: 0,
    })
    if (updated?.slug) {
      revalidatePath(`/articles/${updated.slug as string}`)
    }
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

export async function unpublishArticle(articleId: string): Promise<ActionResult> {
  try {
    const { payload, user } = await getAuthenticatedPayload()
    logger.info('Unpublish article', { articleId, editor: user.email })

    // Get article to find its slug for cache busting
    const article = await payload.findByID({
      collection: 'articles',
      id: Number(articleId),
      depth: 0,
      overrideAccess: true,
    })

    await payload.update({
      collection: 'articles',
      id: Number(articleId),
      data: {
        _status: 'draft',
        workflowStatus: 'in_review',
        placement: '',
      },
      overrideAccess: false,
      user,
      draft: false,
    })

    revalidatePath('/editorial')
    revalidatePath(`/editorial/${articleId}`)
    revalidatePath('/')
    revalidatePath('/tech')
    revalidatePath('/culture')
    revalidatePath('/fashion')
    revalidatePath('/showbusiness')
    revalidatePath('/leaders')
    revalidatePath('/leaders/more')
    if (article?.slug) revalidatePath(`/articles/${article.slug as string}`)

    logger.info('Article unpublished', { articleId })
    return { success: true }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to unpublish article'
    logger.error('unpublishArticle failed', { articleId, error: msg })
    return { success: false, error: msg }
  }
}

// Recursively collect image src URLs from a Lexical content tree.
// Traverses all object values and arrays — handles the { root: { children: [...] } }
// wrapper that Lexical uses at the top level.
function collectImageUrls(node: unknown): string[] {
  if (!node || typeof node !== 'object') return []
  const n = node as Record<string, unknown>
  const urls: string[] = []
  if (n.type === 'image' && typeof n.src === 'string' && n.src) urls.push(n.src)
  for (const value of Object.values(n)) {
    if (Array.isArray(value)) {
      for (const child of value) urls.push(...collectImageUrls(child))
    } else if (value && typeof value === 'object') {
      urls.push(...collectImageUrls(value))
    }
  }
  return urls
}

type MediaDoc = {
  id?: number
  filename?: string | null
  sizes?: Record<string, { filename?: string | null } | null>
}

export async function deleteArticle(articleId: string): Promise<ActionResult> {
  try {
    const { payload, user } = await getAuthenticatedPayload()
    logger.info('Delete article', { articleId, editor: user.email })

    const article = await payload.findByID({
      collection: 'articles',
      id: Number(articleId),
      depth: 1,
      overrideAccess: true,
    })

    if (!article) return { success: false, error: 'Article not found.' }

    // Helper: delete a media doc + all its R2 files
    const deleteMedia = async (doc: MediaDoc, collection: 'media' | 'inline-media' = 'media') => {
      const keys = [doc.filename, ...Object.values(doc.sizes ?? {}).map((s) => s?.filename)].filter(
        (f): f is string => Boolean(f)
      )
      await deleteFilesFromS3(keys)
      if (doc.id) {
        try {
          await payload.delete({ collection, id: Number(doc.id), overrideAccess: true })
          logger.info('Deleted media document', { mediaId: doc.id, collection, keys })
        } catch (err) {
          logger.warn('Could not delete media document', {
            mediaId: doc.id,
            collection,
            error: String(err),
          })
        }
      }
    }

    // Delete hero image
    const heroMedia = article.heroImage as MediaDoc | null
    if (heroMedia?.id) await deleteMedia(heroMedia)

    // Delete inline images embedded in the article body
    const imageUrls = collectImageUrls(article.content)
    for (const url of imageUrls) {
      const filename = decodeURIComponent(url.split('/').pop()?.split('?')[0] ?? '')
      if (!filename) continue
      try {
        const result = await payload.find({
          collection: 'inline-media',
          where: { filename: { equals: filename } },
          limit: 1,
          depth: 0,
          overrideAccess: true,
        })
        const doc = result.docs[0] as MediaDoc | undefined
        if (doc) {
          await deleteMedia(doc, 'inline-media')
        } else {
          await deleteFilesFromS3([filename])
        }
      } catch (err) {
        logger.warn('Failed to delete inline image', { filename, error: String(err) })
      }
    }

    // Delete the article itself
    await payload.delete({
      collection: 'articles',
      id: Number(articleId),
      overrideAccess: false,
      user,
    })

    revalidatePath('/editorial')
    revalidatePath('/')
    revalidatePath('/tech')
    revalidatePath('/culture')
    revalidatePath('/fashion')
    revalidatePath('/showbusiness')
    revalidatePath('/leaders')
    revalidatePath('/leaders/more')
    if (article.slug) revalidatePath(`/articles/${article.slug as string}`)

    logger.info('Article deleted', { articleId })
    return { success: true }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to delete article'
    logger.error('deleteArticle failed', { articleId, error: msg })
    return { success: false, error: msg }
  }
}
