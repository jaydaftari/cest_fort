import type { CollectionConfig } from 'payload'
import { createLogger } from '../lib/logger'

const logger = createLogger('Collection:Categories')

export const Categories: CollectionConfig = {
  slug: 'categories',
  admin: {
    useAsTitle: 'name',
    group: 'Content',
    defaultColumns: ['name', 'slug'],
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  hooks: {
    afterChange: [
      ({ doc, operation }) => {
        logger.info(`Category ${operation}`, { id: doc.id, name: doc.name, slug: doc.slug })
      },
    ],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Category Name',
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      label: 'URL Slug',
      admin: {
        description: 'Used in the URL. E.g. "tech", "culture", "fashion"',
      },
      hooks: {
        beforeValidate: [
          ({ value, data }) => {
            if (!value && data?.name) {
              return (data.name as string)
                .toLowerCase()
                .replace(/[^\w\s-]/g, '')
                .replace(/[\s_-]+/g, '-')
                .replace(/^-+|-+$/g, '')
            }
            return value
          },
        ],
      },
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Section Description',
      admin: {
        description: 'Displayed at the top of the category page',
      },
    },
    {
      name: 'heroImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Category Hero Image',
    },
  ],
}
