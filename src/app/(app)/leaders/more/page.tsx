import type { Metadata } from 'next'
import Link from 'next/link'
import { getPayloadClient } from '@/lib/payload'
import { FeedItem } from '@/components/ui/ArticleCard'
import { Pagination } from '@/components/ui/Pagination'
import { createLogger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

const logger = createLogger('Page:LeadersMore')

const PER_PAGE = 5

type PageProps = {
  searchParams: Promise<{ page?: string }>
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const { page: pageStr } = await searchParams
  const page = Math.max(1, parseInt(pageStr ?? '1', 10) || 1)
  return {
    title: `More Leader Stories${page > 1 ? ` — Page ${page}` : ''} | C'est Fort`,
    description:
      'All leader stories — founder interviews, executive insights, and leadership perspectives.',
    alternates: { canonical: page > 1 ? `/leaders/more?page=${page}` : '/leaders/more' },
  }
}

export default async function LeadersMorePage({ searchParams }: PageProps) {
  const { page: pageStr } = await searchParams
  const page = Math.max(1, parseInt(pageStr ?? '1', 10) || 1)

  logger.info('Rendering Leaders More page', { page })

  const payload = await getPayloadClient()

  const articlesResult = await payload.find({
    collection: 'articles',
    where: {
      and: [{ placement: { equals: 'leaders.article' } }, { _status: { equals: 'published' } }],
    },
    limit: PER_PAGE,
    page,
    sort: '-publishedAt',
    depth: 2,
  })

  const articles = articlesResult.docs
  const totalPages = Math.ceil(articlesResult.totalDocs / PER_PAGE) || 1

  logger.info('Leaders More page fetched', {
    count: articles.length,
    total: articlesResult.totalDocs,
    page,
    totalPages,
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const toFeedItemProps = (article: any) => ({
    id: article.id,
    slug: article.slug as string,
    title: article.title as string,
    dek: article.dek as string | null,
    authorName: article.authorName as string,
    authorAvatarUrl: article.authorAvatarUrl as string | null,
    publishedAt: article.publishedAt as string | null,
    readTime: article.readTime as number | null,
    // views: (article as { views?: number }).views ?? null, // TODO: enable when view tracking is deployed
    heroImage: article.heroImage as {
      url?: string
      sizes?: { thumbnail?: { url?: string } }
    } | null,
    heroImageUrl: article.heroImageUrl as string | null,
    category: article.category as { name: string; slug: string } | null,
  })

  return (
    <>
      {/* Header */}
      <div className="cat-header">
        <Link className="cat-back" href="/leaders">
          ← LEADERS STORIES
        </Link>
        <h1 className="cat-title">MORE LEADER STORIES</h1>
      </div>

      <div className="feed-layout">
        <div className="feed-main">
          {articles.length === 0 ? (
            <div className="feed-empty">
              No stories here yet.{' '}
              <Link href="/submit" style={{ borderBottom: '1px solid var(--line)' }}>
                Submit the first one.
              </Link>
            </div>
          ) : (
            <>
              {/* Result count */}
              <p
                style={{
                  fontSize: 11,
                  color: '#aaa',
                  fontWeight: 500,
                  letterSpacing: '0.06em',
                  marginBottom: 20,
                }}
              >
                {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, articlesResult.totalDocs)} of{' '}
                {articlesResult.totalDocs} stories
              </p>

              <hr className="feed-rule" />
              <div className="feed-list">
                {articles.map((article) => (
                  <FeedItem key={String(article.id)} {...toFeedItemProps(article)} />
                ))}
              </div>

              <Pagination
                page={page}
                totalPages={totalPages}
                buildHref={(p) => (p === 1 ? '/leaders/more' : `/leaders/more?page=${p}`)}
                style={{ marginTop: 40 }}
              />
            </>
          )}
        </div>

        {/* Sidebar */}
        <aside className="feed-aside">
          <div className="aside-block">
            <Link
              href="/leaders"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                textDecoration: 'none',
                color: '#5d5f5f',
              }}
            >
              ← Featured Stories
            </Link>
          </div>

          <div className="aside-block" style={{ marginTop: 32 }}>
            <Link
              href="/submit"
              style={{
                display: 'block',
                padding: '16px 20px',
                background: '#1a1c1c',
                color: '#fff',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                textDecoration: 'none',
                borderRadius: 2,
                textAlign: 'center',
              }}
            >
              WRITE A STORY →
            </Link>
          </div>
        </aside>
      </div>
    </>
  )
}
