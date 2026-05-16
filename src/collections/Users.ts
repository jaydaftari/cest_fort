import type { CollectionConfig } from 'payload'
import { createLogger } from '../lib/logger'

const logger = createLogger('Collection:Users')

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    useAsTitle: 'email',
    group: 'System',
    defaultColumns: ['email', 'name', 'role'],
  },
  // Only admins can create / delete users — no public self-registration
  access: {
    create: ({ req: { user } }) => user?.role === 'admin',
    read:   ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  hooks: {
    afterChange: [
      ({ doc, operation }) => {
        logger.info(`User ${operation}`, { id: doc.id, email: doc.email, role: doc.role })
      },
    ],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Full Name',
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'editor',
      label: 'Role',
      admin: { position: 'sidebar' },
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Editor', value: 'editor' },
      ],
    },
  ],
}
