import { NextRequest, NextResponse } from 'next/server'
import { fileTypeFromBuffer } from 'file-type'
import { getPayloadClient } from '@/lib/payload'
import { deleteFilesFromS3 } from '@/lib/s3'
import { createLogger } from '@/lib/logger'

const logger = createLogger('API:MediaUpload')
const MAX_BYTES = 10 * 1024 * 1024 // 10 MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const isInline = formData.get('type') === 'inline'
    const collection = isInline ? 'inline-media' : 'media'
    const replacesMediaId = isInline ? null : formData.get('replacesMediaId')

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    if (file.size > MAX_BYTES)
      return NextResponse.json({ error: 'File exceeds 10 MB limit' }, { status: 400 })

    const buffer = Buffer.from(await file.arrayBuffer())
    const detected = await fileTypeFromBuffer(buffer)

    if (!detected || !(ALLOWED_MIME_TYPES as readonly string[]).includes(detected.mime)) {
      return NextResponse.json(
        { error: 'Only JPEG, PNG, WebP, and GIF images are accepted' },
        { status: 400 }
      )
    }

    const payload = await getPayloadClient()

    // Delete the previously uploaded (orphaned) media before creating the new one
    if (replacesMediaId) {
      const oldId = Number(replacesMediaId)
      if (!isNaN(oldId)) {
        try {
          const oldMedia = await payload.findByID({
            collection: 'media',
            id: oldId,
            depth: 0,
            overrideAccess: true,
          })
          if (oldMedia?.filename) {
            const keys = [
              oldMedia.filename,
              ...Object.values(
                (oldMedia.sizes as Record<string, { filename?: string | null } | null>) ?? {}
              ).map((s) => s?.filename),
            ].filter((f): f is string => Boolean(f))
            await deleteFilesFromS3(keys)
          }
          await payload.delete({ collection: 'media', id: oldId, overrideAccess: true })
          logger.info('Deleted replaced media', { oldId })
        } catch (err) {
          logger.warn('Could not delete replaced media', { oldId, error: String(err) })
        }
      }
    }

    // Rename to a random string to avoid spaces/special chars in filenames and R2 keys
    const ext = file.name.match(/\.[^.]+$/)?.[0] ?? ''
    const safeName = `${crypto.randomUUID()}${ext}`

    logger.info('Uploading media', {
      original: file.name,
      safeName,
      type: detected.mime,
      size: file.size,
    })

    const media = await payload.create({
      collection: collection as 'media',
      data: { alt: file.name.replace(/\.[^.]+$/, '') },
      file: { data: buffer, mimetype: detected.mime, name: safeName, size: file.size },
    })

    // When using local disk storage, Payload returns a relative path (/media/…).
    // Prepend the app URL so the client always gets a fully-qualified URL.
    const rawUrl = media.url ?? ''
    const absoluteUrl = rawUrl.startsWith('http')
      ? rawUrl
      : `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}${rawUrl}`

    logger.info('Media created', { id: media.id, url: absoluteUrl })
    return NextResponse.json({ url: absoluteUrl, id: media.id })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    logger.error('Media upload failed', { error: message })
    return NextResponse.json({ error: 'Upload failed. Please try again.' }, { status: 500 })
  }
}
