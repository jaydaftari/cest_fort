import type { CollectionConfig } from 'payload'
import { createLogger } from '../lib/logger'
import { SLOTS } from '../lib/slots'
import { estimateReadTime, lexicalToPlainText } from '../lib/utils'

const logger = createLogger('Collection:Articles')

export const Articles: CollectionConfig = {
  slug: 'articles',
  admin: {
    useAsTitle: 'title',
    group: 'Content',
    defaultColumns: ['title', 'category', 'workflowStatus', '_status', 'publishedAt'],
    listSearchableFields: ['title', 'dek', 'authorName'],
    description: 'All articles — editorial and contributor submissions.',
  },
  versions: {
    drafts: {
      autosave: false,
    },
  },
  access: {
    // Public readers see only published articles; editors see everything
    read: ({ req: { user } }) => {
      if (user) return true
      return { _status: { equals: 'published' } }
    },
    // Anyone can submit — editors review before anything is published
    create: () => true,
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  hooks: {
    beforeChange: [
      ({ data, operation, req }) => {
        logger.info(`Article before ${operation}`, {
          title: data?.title,
          user: req.user?.email,
          workflowStatus: data?.workflowStatus,
        })

        // Auto-calculate read time from Lexical content
        if (data.content) {
          const plainText = lexicalToPlainText(data.content)
          data = { ...data, readTime: estimateReadTime(plainText) }
        }

        // Auto-set submittedAt on first creation without a logged-in user
        if (operation === 'create' && !req.user && !data.submittedAt) {
          return { ...data, submittedAt: new Date().toISOString(), workflowStatus: 'submitted' }
        }

        // Auto-set publishedAt when an editor publishes
        if (data._status === 'published' && !data.publishedAt) {
          return { ...data, publishedAt: new Date().toISOString() }
        }

        return data
      },
    ],
    afterChange: [
      ({ doc, operation }) => {
        logger.info(`Article ${operation} complete`, {
          id: doc.id,
          title: doc.title,
          status: doc._status,
          workflowStatus: doc.workflowStatus,
        })
      },
    ],
    afterRead: [
      ({ doc }) => {
        logger.debug('Article read', { id: doc.id, title: doc.title })
        return doc
      },
    ],
  },
  fields: [
    // ── Core content ──────────────────────────────────────────
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Headline',
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      label: 'URL Slug',
      index: true,
      admin: {
        description: 'Auto-generated from title. Edit if needed.',
      },
      hooks: {
        beforeValidate: [
          ({ value, data }) => {
            if (!value && data?.title) {
              return (data.title as string)
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
      name: 'dek',
      type: 'textarea',
      label: 'Dek (Subtitle)',
      admin: {
        description: 'Short summary shown under the headline',
      },
    },
    {
      name: 'content',
      type: 'richText',
      required: true,
      label: 'Article Body',
    },
    {
      name: 'heroImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Hero Image',
    },
    {
      name: 'heroImageUrl',
      type: 'text',
      label: 'Hero Image URL',
      admin: {
        description:
          'External image URL for contributor submissions. Overridden by Hero Image upload.',
      },
    },

    // ── Classification ────────────────────────────────────────
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      required: true,
      label: 'Section',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'tags',
      type: 'array',
      label: 'Tags',
      admin: {
        position: 'sidebar',
      },
      fields: [
        {
          name: 'tag',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'featured',
      type: 'checkbox',
      label: 'Featured (Hero)',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Show in the homepage hero section',
      },
    },

    // ── Author info ────────────────────────────────────────────
    {
      name: 'authorName',
      type: 'text',
      required: true,
      label: 'Author Name',
    },
    {
      name: 'authorEmail',
      type: 'email',
      label: 'Author Email',
      admin: {
        description: 'Not shown publicly. Used for editorial communication.',
      },
    },
    {
      name: 'authorBio',
      type: 'textarea',
      label: 'Author Bio',
    },
    {
      name: 'authorUrl',
      type: 'text',
      label: 'Author URL',
      admin: {
        description: 'Personal website, LinkedIn, or portfolio link. Shown on published articles.',
      },
    },
    {
      name: 'authorAvatarUrl',
      type: 'text',
      label: 'Author Avatar URL',
    },

    // ── Metadata ───────────────────────────────────────────────
    {
      name: 'readTime',
      type: 'number',
      label: 'Read Time (minutes)',
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Calculated automatically from article content on every save.',
      },
    },
    {
      name: 'views',
      type: 'number',
      label: 'Views',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Total view count. Updated programmatically.',
      },
    },
    {
      name: 'publishedAt',
      type: 'date',
      label: 'Published Date',
      index: true,
      admin: {
        position: 'sidebar',
        date: { pickerAppearance: 'dayAndTime' },
      },
    },
    {
      name: 'submittedAt',
      type: 'date',
      label: 'Submitted At',
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Set automatically when a contributor submits',
      },
    },

    // ── Placement ─────────────────────────────────────────────
    // Stored as plain text (not a select/enum) so adding new slot IDs
    // never requires a DB enum migration.
    {
      name: 'placement',
      type: 'text',
      label: 'Page Placement',
      defaultValue: '',
      index: true,
      admin: {
        position: 'sidebar',
        description:
          'Slot ID assigned by the editorial panel. Values: ' + SLOTS.map((s) => s.id).join(', '),
        readOnly: true,
      },
    },

    // ── Editorial workflow ─────────────────────────────────────
    {
      name: 'workflowStatus',
      type: 'select',
      defaultValue: 'submitted',
      label: 'Workflow Status',
      index: true,
      admin: {
        position: 'sidebar',
        description: 'Internal editorial pipeline status',
      },
      options: [
        { label: 'Submitted', value: 'submitted' },
        { label: 'In Review', value: 'in_review' },
        { label: 'Approved', value: 'approved' },
        { label: 'Rejected', value: 'rejected' },
      ],
    },
    {
      name: 'editorialNote',
      type: 'textarea',
      label: 'Editorial Note',
      admin: {
        position: 'sidebar',
        description: 'Internal notes from the editorial team. Not shown publicly.',
      },
    },

    // ── SEO ────────────────────────────────────────────────────
    {
      name: 'seoTitle',
      type: 'text',
      label: 'SEO Title',
      admin: {
        description: 'Defaults to headline if blank',
      },
    },
    {
      name: 'seoDescription',
      type: 'textarea',
      label: 'SEO Description',
      admin: {
        description: 'Defaults to dek if blank',
      },
    },
  ],
}
