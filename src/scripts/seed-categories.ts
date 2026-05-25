import { getPayload } from 'payload'
import configPromise from '@payload-config'

const CATEGORIES = [
  { name: 'Tech', slug: 'tech', description: 'Technology, software, and the digital frontier.' },
  {
    name: 'Culture',
    slug: 'culture',
    description: 'Art, ideas, and the currents shaping contemporary life.',
  },
  {
    name: 'Fashion',
    slug: 'fashion',
    description: 'Style, luxury, and the aesthetics of the moment.',
  },
  {
    name: 'Show Business',
    slug: 'showbusiness',
    description: 'Film, music, entertainment, and the people who define it.',
  },
  {
    name: 'Leaders Stories',
    slug: 'leaders-stories',
    description: 'Founder stories, executive insights, and leadership perspectives.',
  },
]

async function seed() {
  const payload = await getPayload({ config: configPromise })

  for (const cat of CATEGORIES) {
    const existing = await payload.find({
      collection: 'categories',
      where: { slug: { equals: cat.slug } },
      limit: 1,
    })

    if (existing.docs.length > 0) {
      console.info(`[skip] ${cat.name} already exists`)
      continue
    }

    await payload.create({ collection: 'categories', data: cat })
    console.info(`[created] ${cat.name}`)
  }

  console.info('Seed complete.')
  process.exit(0)
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
