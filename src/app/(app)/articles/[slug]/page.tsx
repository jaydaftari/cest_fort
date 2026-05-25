import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getPayloadClient } from '@/lib/payload'
import { formatDate, formatDateShort, estimateReadTime, lexicalToPlainText } from '@/lib/utils'
import RichTextRenderer from '@/components/ui/RichTextRenderer'
import { RelatedCard } from '@/components/ui/ArticleCard'
import { createLogger } from '@/lib/logger'
import { getMockBySlug, getMockByCategory } from '@/mock-data/articles'
import JsonLd from '@/components/seo/JsonLd'
import { ShareButtons } from '@/components/ui/ShareButtons'

export const revalidate = 60

export async function generateStaticParams() {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'articles',
    where: { _status: { equals: 'published' } },
    limit: 50,
    sort: '-publishedAt',
    depth: 0,
    select: { slug: true },
  })
  return docs.map((a) => ({ slug: a.slug as string }))
}

const logger = createLogger('Page:Article')

type PageProps = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const payload = await getPayloadClient()

  logger.debug('Generating metadata for article', { slug })

  const result = await payload.find({
    collection: 'articles',
    where: { and: [{ slug: { equals: slug } }, { _status: { equals: 'published' } }] },
    limit: 1,
    depth: 1,
  })

  const article = result.docs[0] ?? getMockBySlug(slug)
  if (!article) return { title: 'Article Not Found' }

  return {
    title: (article.seoTitle as string) ?? (article.title as string),
    description: (article.seoDescription as string) ?? (article.dek as string) ?? undefined,
    openGraph: {
      title: article.title as string,
      description: (article.dek as string) ?? undefined,
      images: article.heroImageUrl ? [{ url: article.heroImageUrl as string }] : [],
    },
  }
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params

  logger.info('Rendering article page', { slug })

  const payload = await getPayloadClient()

  const result = await payload.find({
    collection: 'articles',
    where: { and: [{ slug: { equals: slug } }, { _status: { equals: 'published' } }] },
    limit: 1,
    depth: 2,
  })

  type Doc = (typeof result.docs)[number]
  const article: Doc = result.docs[0] ?? (getMockBySlug(slug) as unknown as Doc)

  if (!article) {
    logger.warn('Article not found or not published', { slug })
    notFound()
  }

  logger.debug('Article found', { id: article.id, title: article.title })

  const category = article.category as { id?: string | number; name: string; slug: string } | null
  const heroMedia = article.heroImage as {
    url?: string
    sizes?: { hero?: { url?: string } }
  } | null
  const heroImageUrl =
    heroMedia?.sizes?.hero?.url ?? heroMedia?.url ?? (article.heroImageUrl as string | null)

  // Estimate read time if not set by editor
  const readTime =
    (article.readTime as number | null) ?? estimateReadTime(lexicalToPlainText(article.content))

  // Fetch related articles from same category.
  // Only query the DB when we have a valid integer category ID (real articles);
  // mock articles have no numeric ID so skip to the mock fallback below.
  const catId = Number(category?.id)
  const relatedResult =
    category && !isNaN(catId)
      ? await payload.find({
          collection: 'articles',
          where: {
            and: [
              { _status: { equals: 'published' } },
              { category: { equals: catId } },
              { slug: { not_equals: slug } },
            ],
          },
          limit: 3,
          sort: '-publishedAt',
          depth: 2,
        })
      : { docs: [] }

  type RelatedDoc = (typeof relatedResult.docs)[number]
  const relatedDocs: RelatedDoc[] =
    relatedResult.docs.length > 0
      ? relatedResult.docs
      : (getMockByCategory(category?.slug ?? '')
          .filter((a) => a.slug !== slug)
          .slice(0, 3) as unknown as RelatedDoc[])

  logger.info('Article page render complete', {
    slug,
    relatedCount: relatedResult.docs.length,
  })

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title as string,
    ...(article.dek ? { description: article.dek as string } : {}),
    author: {
      '@type': 'Person',
      name: article.authorName as string,
      ...(article.authorUrl ? { url: article.authorUrl as string } : {}),
    },
    ...(article.publishedAt ? { datePublished: article.publishedAt as string } : {}),
    ...(heroImageUrl ? { image: heroImageUrl } : {}),
  }

  return (
    <article className="article-page">
      <JsonLd data={articleSchema} />
      <div className="article-shell">
        {/* Back link */}
        <Link
          className="article-back"
          href={
            category
              ? category.slug === 'leaders-stories'
                ? '/leaders'
                : `/${category.slug}`
              : '/'
          }
        >
          ← {category?.name?.toUpperCase() ?? 'HOME'}
        </Link>

        {/* Eyebrow */}
        {category && <p className="article-eyebrow">{category.name.toUpperCase()}</p>}

        {/* Headline */}
        <h1 className="article-title">{article.title as string}</h1>

        {/* Dek */}
        {article.dek && <p className="article-dek">{article.dek as string}</p>}

        {/* Byline */}
        <div className="article-byline">
          <span
            className="author-dot"
            style={
              article.authorAvatarUrl
                ? { backgroundImage: `url(${article.authorAvatarUrl as string})` }
                : {}
            }
          />
          <div className="byline-text">
            {article.authorUrl ? (
              <a
                className="author author--link"
                href={article.authorUrl as string}
                target="_blank"
                rel="noopener noreferrer"
              >
                {article.authorName as string}
              </a>
            ) : (
              <p className="author">{article.authorName as string}</p>
            )}
            <div className="meta-line">
              {article.publishedAt && (
                <span>{formatDate(article.publishedAt as string).toUpperCase()}</span>
              )}
              <span>·</span>
              <span>{readTime} MIN READ</span>
            </div>
          </div>
        </div>

        {/* Share buttons */}
        <ShareButtons
          url={`${process.env.NEXT_PUBLIC_APP_URL ?? 'https://cestfort.com'}/articles/${slug}`}
          title={article.title as string}
        />

        {/* Hero image */}
        {heroImageUrl && (
          <div className="article-hero">
            <Image
              src={heroImageUrl}
              alt={article.title as string}
              width={1200}
              height={675}
              style={{ objectFit: 'cover', width: '100%', height: '100%' }}
              priority
            />
          </div>
        )}

        {/* Body content */}
        <RichTextRenderer
          content={article.content as Parameters<typeof RichTextRenderer>[0]['content']}
        />

        {/* Related articles */}
        {relatedDocs.length > 0 && (
          <div className="related">
            <h3>MORE FROM {category?.name?.toUpperCase() ?? "C'EST FORT"}</h3>
            <div className="related-grid">
              {relatedDocs.map((related) => {
                const relatedMedia = related.heroImage as {
                  url?: string
                  sizes?: { thumbnail?: { url?: string } }
                } | null
                return (
                  <RelatedCard
                    key={String(related.id)}
                    id={related.id}
                    slug={related.slug as string}
                    title={related.title as string}
                    authorName={related.authorName as string}
                    publishedAt={related.publishedAt as string | null}
                    heroImage={relatedMedia}
                    heroImageUrl={related.heroImageUrl as string | null}
                    category={related.category as { name: string; slug: string } | null}
                  />
                )
              })}
            </div>
          </div>
        )}
      </div>
    </article>
  )
}
