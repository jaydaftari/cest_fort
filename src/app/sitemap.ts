import type { MetadataRoute } from 'next'
import { getPayloadClient } from '@/lib/payload'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

const STATIC_ROUTES: MetadataRoute.Sitemap = [
  { url: BASE_URL, priority: 1.0, changeFrequency: 'daily' },
  { url: `${BASE_URL}/tech`, priority: 0.8, changeFrequency: 'daily' },
  { url: `${BASE_URL}/culture`, priority: 0.8, changeFrequency: 'daily' },
  { url: `${BASE_URL}/fashion`, priority: 0.8, changeFrequency: 'daily' },
  { url: `${BASE_URL}/showbusiness`, priority: 0.8, changeFrequency: 'daily' },
  { url: `${BASE_URL}/leaders`, priority: 0.8, changeFrequency: 'daily' },
  { url: `${BASE_URL}/about`, priority: 0.5, changeFrequency: 'monthly' },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const payload = await getPayloadClient()

  const { docs: articles } = await payload.find({
    collection: 'articles',
    where: { _status: { equals: 'published' } },
    limit: 0,
    depth: 0,
    select: { slug: true, publishedAt: true, updatedAt: true },
  })

  const articleRoutes: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${BASE_URL}/articles/${article.slug as string}`,
    lastModified: new Date((article.publishedAt ?? article.updatedAt) as string),
    priority: 0.7,
    changeFrequency: 'weekly',
  }))

  return [...STATIC_ROUTES, ...articleRoutes]
}
