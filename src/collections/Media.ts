import type { CollectionConfig } from 'payload'
import { createLogger } from '../lib/logger'

const logger = createLogger('Collection:Media')

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    group: 'Assets',
  },
  access: {
    read: () => true,
  },
  upload: {
    // Sizes generated automatically for responsive images
    imageSizes: [
      {
        name: 'thumbnail',
        width: 400,
        height: 300,
        position: 'centre',
      },
      {
        name: 'card',
        width: 800,
        height: 600,
        position: 'centre',
      },
      {
        name: 'hero',
        width: 1600,
        height: 900,
        position: 'centre',
      },
      {
        name: 'portrait',
        width: 600,
        height: 800,
        position: 'centre',
      },
    ],
    adminThumbnail: 'thumbnail',
    mimeTypes: ['image/*'],
  },
  hooks: {
    afterChange: [
      ({ doc, operation }) => {
        logger.info(`Media ${operation}`, {
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
      name: 'alt',
      type: 'text',
      label: 'Alt Text',
      admin: {
        description: 'Describe the image for screen readers and SEO',
      },
    },
    {
      name: 'caption',
      type: 'text',
      label: 'Caption',
    },
  ],
}
