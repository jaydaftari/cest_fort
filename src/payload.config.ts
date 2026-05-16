import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Articles } from './collections/Articles'
import { Categories } from './collections/Categories'
import { Media } from './collections/Media'
import { Users } from './collections/Users'
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
  collections: [Articles, Categories, Media, Users],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET ?? 'insecure-dev-secret-change-me',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL,
    },
  }),
  sharp,
  onInit: async (payload) => {
    logger.info('Payload CMS initialized', {
      collections: payload.config.collections.map((c) => c.slug),
      adminURL: `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/admin`,
    })

    // ── Seed editorial users once (skips if already exist) ──────────────────
    const SEED_USERS = [
      { email: 'jaydaftari19@gmail.com', password: 'jaydaftari@321', name: 'Jay Daftari',  role: 'admin'  },
      { email: 'ivan@olivierclub.com',   password: 'ivan@321',        name: 'Ivan',          role: 'editor' },
    ]

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
