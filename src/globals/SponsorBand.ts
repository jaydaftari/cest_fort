import type { GlobalConfig } from 'payload'
import { revalidatePath } from 'next/cache'
import { createLogger } from '../lib/logger'

const logger = createLogger('Global:SponsorBand')

export const SponsorBand: GlobalConfig = {
  slug: 'sponsor-band',
  label: 'Sponsor Band',
  admin: {
    group: 'Site Settings',
    description: 'The full-width sponsor strip shown on the homepage.',
  },
  access: {
    read: () => true,
    update: ({ req: { user } }) => Boolean(user),
  },
  hooks: {
    afterChange: [
      () => {
        logger.info('SponsorBand updated — revalidating homepage')
        revalidatePath('/')
      },
    ],
  },
  fields: [
    {
      name: 'enabled',
      type: 'checkbox',
      label: 'Show sponsor band',
      defaultValue: true,
      admin: {
        description: 'Uncheck to hide the sponsor section from the homepage.',
      },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      label: 'Background Image',
      admin: {
        description: 'Uploaded image for the sponsor strip background.',
      },
    },
    {
      name: 'imageUrl',
      type: 'text',
      label: 'Background Image URL',
      admin: {
        description: 'External image URL. Used if no uploaded image is set.',
      },
    },
    {
      name: 'eyebrow',
      type: 'text',
      label: 'Eyebrow Label',
      defaultValue: 'PRESENTED BY',
      admin: {
        description:
          'Small label above the brand name (e.g. "PRESENTED BY", "IN PARTNERSHIP WITH").',
      },
    },
    {
      name: 'brand',
      type: 'text',
      label: 'Brand Name',
      required: true,
      defaultValue: 'MAISON VERMEIL',
      admin: {
        description: 'The sponsor brand name displayed prominently.',
      },
    },
    {
      name: 'tagline',
      type: 'text',
      label: 'Tagline',
      defaultValue: 'The art of fragrance, reimagined for the modern connoisseur',
      admin: {
        description: 'Short descriptor shown beneath the brand name.',
      },
    },
    {
      name: 'linkUrl',
      type: 'text',
      label: 'Link URL',
      admin: {
        description: 'Where the "Explore" button links to. Leave blank to hide the button.',
      },
    },
    {
      name: 'linkLabel',
      type: 'text',
      label: 'Button Label',
      defaultValue: 'EXPLORE',
      admin: {
        description: 'Text shown on the call-to-action button.',
      },
    },
  ],
}
