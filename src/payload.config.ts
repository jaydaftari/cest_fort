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
import { Videos } from './collections/Videos'
import { SponsorBand } from './globals/SponsorBand'
import { createLogger } from './lib/logger'

const logger = createLogger('PayloadConfig')

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required but not set. Add it to your environment variables.')
}

if (!process.env.PAYLOAD_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('PAYLOAD_SECRET is required in production.')
  }
  logger.warn('PAYLOAD_SECRET not set — using insecure default. Set it in .env for production.')
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
  collections: [Articles, Categories, InlineMedia, Media, Subscribers, Users, Videos],
  globals: [SponsorBand],
  plugins: [
    ...(useS3
      ? [
          s3Storage({
            collections: { media: true, 'inline-media': true, videos: true },
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
      connectionString: (() => {
        const url = new URL(process.env.DATABASE_URL!)
        url.searchParams.set('sslmode', 'verify-full')
        return url.toString()
      })(),
    },
  }),
  sharp,
  onInit: async (payload) => {
    logger.info('Payload CMS initialized', {
      collections: payload.config.collections.map((c) => c.slug),
      adminURL: `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/admin`,
    })

    // Users are created via the Payload admin UI at /admin
  },
})
