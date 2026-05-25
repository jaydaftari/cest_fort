import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Articles } from './collections/Articles'
import { Categories } from './collections/Categories'
import { InlineMedia } from './collections/InlineMedia'
import { Media } from './collections/Media'
import { Subscribers } from './collections/Subscribers'
import { Users } from './collections/Users'
import { SponsorBand } from './globals/SponsorBand'
import { createLogger } from './lib/logger'

const logger = createLogger('PayloadConfig')

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

if (!process.env.PAYLOAD_SECRET) {
  logger.warn('PAYLOAD_SECRET not set — using insecure default. Set it in .env for production.')
}

if (!process.env.DATABASE_URL) {
  logger.error('DATABASE_URL is not set. The app will fail to start.')
}

const useS3 = Boolean(
  process.env.S3_BUCKET &&
  process.env.S3_ACCESS_KEY_ID &&
  process.env.S3_SECRET_ACCESS_KEY &&
  process.env.S3_ENDPOINT
)

if (useS3) {
  logger.info('S3/R2 storage enabled', { bucket: process.env.S3_BUCKET })
} else {
  logger.info('Using local disk storage (set S3_* env vars to switch to R2)')
}

export default buildConfig({
  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: "— C'est Fort",
      description: "C'est Fort Magazine — Editorial CMS",
    },
    theme: 'light',
    components: {
      graphics: {
        Logo: '@/components/admin/AdminLogo',
        Icon: '@/components/admin/AdminIcon',
      },
      views: {
        dashboard: {
          Component: '@/components/admin/Dashboard',
        },
      },
    },
  },
  collections: [Articles, Categories, InlineMedia, Media, Subscribers, Users],
  globals: [SponsorBand],
  plugins: [
    ...(useS3
      ? [
          s3Storage({
            collections: { media: true, 'inline-media': true },
            bucket: process.env.S3_BUCKET!,
            config: {
              credentials: {
                accessKeyId: process.env.S3_ACCESS_KEY_ID!,
                secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
              },
              region: process.env.S3_REGION ?? 'auto',
              endpoint: process.env.S3_ENDPOINT,
            },
          }),
        ]
      : []),
  ],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET ?? 'insecure-dev-secret-change-me',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL?.replace('sslmode=require', 'sslmode=verify-full'),
    },
  }),
  sharp,
  onInit: async (payload) => {
    logger.info('Payload CMS initialized', {
      collections: payload.config.collections.map((c) => c.slug),
      adminURL: `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/admin`,
    })

    // ── Seed editorial users once (skips if already exist) ──────────────────
    // Credentials are read from env vars — set SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD,
    // SEED_EDITOR_EMAIL, SEED_EDITOR_PASSWORD in your .env before first run.
    const SEED_USERS = [
      {
        email: process.env.SEED_ADMIN_EMAIL ?? '',
        password: process.env.SEED_ADMIN_PASSWORD ?? '',
        name: process.env.SEED_ADMIN_NAME ?? 'Admin',
        role: 'admin',
      },
      {
        email: process.env.SEED_EDITOR_EMAIL ?? '',
        password: process.env.SEED_EDITOR_PASSWORD ?? '',
        name: process.env.SEED_EDITOR_NAME ?? 'Editor',
        role: 'editor',
      },
    ].filter((u) => u.email && u.password) // skip entries with no credentials set

    for (const user of SEED_USERS) {
      try {
        const existing = await payload.find({
          collection: 'users',
          where: { email: { equals: user.email } },
          limit: 1,
        })
        if (existing.totalDocs === 0) {
          await payload.create({ collection: 'users', data: user })
          logger.info('Seeded user', { email: user.email, role: user.role })
        }
      } catch (err) {
        logger.warn('Could not seed user', { email: user.email, error: String(err) })
      }
    }
  },
})
