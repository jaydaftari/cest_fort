import type { CollectionConfig } from 'payload'
import { createLogger } from '../lib/logger'

const logger = createLogger('Collection:Subscribers')

export const Subscribers: CollectionConfig = {
  slug: 'subscribers',
  admin: {
    useAsTitle: 'email',
    group: 'Audience',
    defaultColumns: ['email', 'active', 'subscribedAt'],
    listSearchableFields: ['email'],
    description: 'Newsletter subscribers.',
  },
  access: {
    read: ({ req: { user } }) => Boolean(user),
    create: () => true, // Server action creates on behalf of anonymous users
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  hooks: {
    afterChange: [
      ({ doc, operation }) => {
        logger.info(`Subscriber ${operation}`, { email: doc.email, active: doc.active })
      },
    ],
  },
  fields: [
    {
      name: 'email',
      type: 'email',
      required: true,
      unique: true,
      label: 'Email Address',
      index: true,
    },
    {
      name: 'active',
      type: 'checkbox',
      defaultValue: true,
      label: 'Active',
      admin: {
        position: 'sidebar',
        description: 'Uncheck to unsubscribe this address.',
      },
    },
    {
      name: 'subscribedAt',
      type: 'date',
      label: 'Subscribed At',
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'unsubscribeToken',
      type: 'text',
      label: 'Unsubscribe Token',
      unique: true,
      index: true,
      access: {
        // Never exposed to non-admins — token is only used server-side for email links
        read: ({ req: { user } }) => user?.role === 'admin',
        // Clients must never set or overwrite the token; server actions use overrideAccess
        create: () => false,
        update: () => false,
      },
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Auto-generated token for one-click unsubscribe links.',
      },
    },
    {
      name: 'source',
      type: 'select',
      label: 'Source',
      defaultValue: 'website',
      admin: { position: 'sidebar' },
      options: [
        { label: 'Website footer', value: 'website' },
        { label: 'Article page', value: 'article' },
        { label: 'Admin import', value: 'admin' },
      ],
    },
  ],
}
