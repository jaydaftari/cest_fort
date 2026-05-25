import type { CollectionConfig } from 'payload'

export const InlineMedia: CollectionConfig = {
  slug: 'inline-media',
  admin: {
    group: 'Assets',
    description: 'Images embedded in article body — no size variants generated.',
  },
  access: {
    read: () => true,
  },
  upload: {
    adminThumbnail: 'original',
    mimeTypes: ['image/*'],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      label: 'Alt Text',
    },
  ],
}
