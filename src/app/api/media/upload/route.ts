import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { createLogger } from '@/lib/logger'

const logger = createLogger('API:MediaUpload')
const MAX_BYTES = 10 * 1024 * 1024 // 10 MB

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    if (!file.type.startsWith('image/')) return NextResponse.json({ error: 'Only images are accepted' }, { status: 400 })
    if (file.size > MAX_BYTES) return NextResponse.json({ error: 'File exceeds 10 MB limit' }, { status: 400 })

    logger.info('Uploading media', { name: file.name, type: file.type, size: file.size })

    const payload = await getPayloadClient()
    const buffer = Buffer.from(await file.arrayBuffer())

    const media = await payload.create({
      collection: 'media',
      data: { alt: file.name.replace(/\.[^.]+$/, '') },
      file: { data: buffer, mimetype: file.type, name: file.name, size: file.size },
    })

    logger.info('Media created', { id: media.id, url: media.url })
    return NextResponse.json({ url: media.url })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    logger.error('Media upload failed', { error: message })
    return NextResponse.json({ error: 'Upload failed. Please try again.' }, { status: 500 })
  }
}
