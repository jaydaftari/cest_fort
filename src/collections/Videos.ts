import type { CollectionConfig } from 'payload'
import { createLogger } from '../lib/logger'

const logger = createLogger('Collection:Videos')

export const Videos: CollectionConfig = {
  slug: 'videos',
  admin: {
    group: 'Assets',
    description: 'Video uploads — mp4, webm, mov, etc. Poster image shown in admin thumbnail.',
    useAsTitle: 'title',
  },
  access: {
    read: () => true,
  },
  upload: {
    mimeTypes: ['video/*'],
    adminThumbnail: ({ doc }) => {
      // Use the poster relationship's URL if present
      const poster = doc?.poster as { url?: string } | undefined
      return poster?.url ?? null
    },
  },
  hooks: {
    afterChange: [
      ({ doc, operation }) => {
        logger.info(`Video ${operation}`, {
          id: doc.id,
          filename: doc.filename,
          mimeType: doc.mimeType,
          filesize: doc.filesize,
        })
      },
    ],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Title',
      required: true,
    },
    {
      name: 'caption',
      type: 'text',
      label: 'Caption',
    },
    {
      name: 'poster',
      type: 'upload',
      relationTo: 'media',
      label: 'Poster Image',
      admin: {
        description: 'Thumbnail shown before the video plays and in the admin list.',
      },
    },
  ],
}
