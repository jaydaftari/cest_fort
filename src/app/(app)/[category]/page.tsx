import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getPayloadClient } from '@/lib/payload'
import { categoryLabel, formatDateShort, truncate } from '@/lib/utils'
import { createLogger } from '@/lib/logger'
import { getMockByCategory } from '@/mock-data/articles'

export const dynamic = 'force-dynamic'

const logger = createLogger('Page:Category')

// Only these slugs are valid category pages
const VALID_SLUGS = ['tech', 'culture', 'fashion', 'showbusiness', 'leaders-stories']

type PageProps = {
  params: Promise<{ category: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category } = await params
  const label = categoryLabel(category)
  return {
    title: label,
    description: `Read the latest ${label} coverage from C'est Fort Magazine.`,
  }
}

export default async function CategoryPage({ params }: PageProps) {
  const { category: slug } = await params

  logger.info('Rendering category page', { slug })

  if (!VALID_SLUGS.includes(slug)) {
    logger.warn('Invalid category slug — 404', { slug })
    notFound()
  }

  const payload = await getPayloadClient()

  // Find the category document by slug
  const categoryResult = await payload.find({
    collection: 'categories',
    where: { slug: { equals: slug } },
    limit: 1,
  })

  const category = categoryResult.docs[0] ?? null
  logger.debug('Category lookup result', { slug, found: Boolean(category) })

  // Fetch published articles for this category
  const articlesResult = await payload.find({
    collection: 'articles',
    where: {
      and: [
        { _status: { equals: 'published' } },
        ...(category ? [{ category: { equals: category.id } }] : []),
      ],
    },
    limit: 20,
    sort: '-publishedAt',
    depth: 2,
  })

  type Doc = typeof articlesResult.docs[number]
  const articles: Doc[] = articlesResult.docs.length > 0
    ? articlesResult.docs
    : (getMockByCategory(slug) as unknown as Doc[])
  const [featuredArticle, ...restArticles] = articles

  logger.info('Category page data fetched', {
    slug,
    categoryName: category?.name,
    articleCount: articles.length,
  })

  const label = (category?.name as string | undefined) ?? categoryLabel(slug)

  const getImageUrl = (article: (typeof articles)[number]) => {
    const media = article.heroImage as { url?: string; sizes?: { card?: { url?: string } } } | null
    return media?.sizes?.card?.url ?? media?.url ?? (article.heroImageUrl as string | null)
  }

  return (
    <>
      <div className="cat-header">
        <Link className="cat-back" href="/">← HOME</Link>
        <h1 className="cat-title">{label.toUpperCase()}</h1>
      </div>

      <section className="cat-section">
        {articles.length === 0 ? (
          <div className="feed-empty">
            No articles in {label} yet.{' '}
            <Link href="/submit" style={{ borderBottom: '1px solid var(--line)' }}>
              Submit the first one.
            </Link>
          </div>
        ) : (
          <div className="cat-grid">
            {/* Side cells before the feature */}
            {restArticles.slice(0, 1).map((article) => (
              <Link key={article.id} className="cat-cell" href={`/articles/${article.slug as string}`}>
                <div className="cat-thumb">
                  {getImageUrl(article) && (
                    <Image
                      src={getImageUrl(article) as string}
                      alt={article.title as string}
                      width={400}
                      height={300}
                      style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                    />
                  )}
                </div>
                <p className="cat-sub">{label.toUpperCase()}</p>
                <p className="cat-headline">{article.title as string}</p>
                {article.dek && (
                  <p className="cat-blurb">{truncate(article.dek as string, 90)}</p>
                )}
                <p className="cat-byline">
                  {article.authorName as string}
                  {article.publishedAt ? ` · ${formatDateShort(article.publishedAt as string)}` : ''}
                </p>
              </Link>
            ))}

            {/* Feature cell: 2×2 */}
            {featuredArticle && (
              <Link className="cat-feature" href={`/articles/${featuredArticle.slug as string}`}>
                {getImageUrl(featuredArticle) && (
                  <Image
                    src={getImageUrl(featuredArticle) as string}
                    alt={featuredArticle.title as string}
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                )}
                <div className="feat-tint" />
                <div className="feat-body">
                  <p className="feat-sub">{label.toUpperCase()}</p>
                  <p className="feat-title">{featuredArticle.title as string}</p>
                  {featuredArticle.dek && (
                    <p className="feat-blurb">{truncate(featuredArticle.dek as string, 160)}</p>
                  )}
                  <p className="feat-author">
                    {featuredArticle.authorName as string}
                    {featuredArticle.publishedAt
                      ? ` · ${formatDateShort(featuredArticle.publishedAt as string)}`
                      : ''}
                  </p>
                </div>
              </Link>
            )}

            {/* Remaining cells */}
            {restArticles.slice(1).map((article) => (
              <Link key={article.id} className="cat-cell" href={`/articles/${article.slug as string}`}>
                <div className="cat-thumb">
                  {getImageUrl(article) && (
                    <Image
                      src={getImageUrl(article) as string}
                      alt={article.title as string}
                      width={400}
                      height={300}
                      style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                    />
                  )}
                </div>
                <p className="cat-sub">{label.toUpperCase()}</p>
                <p className="cat-headline">{article.title as string}</p>
                {article.dek && (
                  <p className="cat-blurb">{truncate(article.dek as string, 90)}</p>
                )}
                <p className="cat-byline">
                  {article.authorName as string}
                  {article.publishedAt ? ` · ${formatDateShort(article.publishedAt as string)}` : ''}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  )
}
