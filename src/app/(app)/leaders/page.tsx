import type { Metadata } from 'next'
import Link from 'next/link'
import { getPayloadClient } from '@/lib/payload'
import { FeedItem } from '@/components/ui/ArticleCard'
import { createLogger } from '@/lib/logger'
import { getMockByCategory } from '@/mock-data/articles'

export const dynamic = 'force-dynamic'

const logger = createLogger('Page:Leaders')

export const metadata: Metadata = {
  title: 'Leaders Stories',
  description: "Founder stories, executive insights, and leadership perspectives from the people shaping tomorrow.",
}

const TABS = [
  { key: 'featured', label: 'Featured' },
  { key: 'latest', label: 'Latest' },
] as const

type Tab = typeof TABS[number]['key']

type PageProps = {
  searchParams: Promise<{ tab?: string }>
}

const TOPICS = ['Tech', 'Culture', 'Fashion', 'Leadership', 'Startups', 'Sustainability', 'AI', 'Design']

export default async function LeadersPage({ searchParams }: PageProps) {
  const { tab = 'featured' } = await searchParams
  const activeTab = (TABS.some((t) => t.key === tab) ? tab : 'featured') as Tab

  logger.info('Rendering Leaders page', { activeTab })

  const payload = await getPayloadClient()

  // Find the leaders-stories category
  const categoryResult = await payload.find({
    collection: 'categories',
    where: { slug: { equals: 'leaders-stories' } },
    limit: 1,
  })

  const leadersCategory = categoryResult.docs[0] ?? null
  logger.debug('Leaders category lookup', { found: Boolean(leadersCategory) })

  // Fetch articles: featured = featured flag, latest = most recent
  const articlesResult = await payload.find({
    collection: 'articles',
    where: {
      and: [
        { _status: { equals: 'published' } },
        ...(leadersCategory
          ? [{ category: { equals: leadersCategory.id } }]
          : []),
        ...(activeTab === 'featured' ? [{ featured: { equals: true } }] : []),
      ],
    },
    limit: 20,
    sort: '-publishedAt',
    depth: 2,
  })

  // Fallback: if featured tab has no results, show latest from DB
  // If DB has nothing at all, fall back to mock data
  type Doc = typeof articlesResult.docs[number]
  let articles: Doc[]
  if (articlesResult.docs.length > 0) {
    articles = articlesResult.docs
  } else if (activeTab === 'featured') {
    const latestResult = await payload.find({
      collection: 'articles',
      where: {
        and: [
          { _status: { equals: 'published' } },
          ...(leadersCategory ? [{ category: { equals: leadersCategory.id } }] : []),
        ],
      },
      limit: 20,
      sort: '-publishedAt',
      depth: 2,
    })
    articles = latestResult.docs.length > 0
      ? latestResult.docs
      : (getMockByCategory('leaders-stories') as unknown as Doc[])
  } else {
    articles = getMockByCategory('leaders-stories') as unknown as Doc[]
  }

  logger.info('Leaders page data fetched', { articleCount: articles.length, activeTab })

  return (
    <>
      <div className="cat-header">
        <Link className="cat-back" href="/">← HOME</Link>
        <div className="leaders-headrow">
          <h1 className="cat-title">LEADERS STORIES</h1>
          <Link className="btn-write" href="/submit">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
              <path d="M12 5v14M5 12h14" />
            </svg>
            WRITE A STORY
          </Link>
        </div>
        <p className="leaders-intro">
          Founder stories, executive insights, and leadership perspectives from the people shaping tomorrow.
          Submit your story and reach the most discerning readership.
        </p>
      </div>

      <div className="feed-layout">
        {/* ── Main feed ─────────────────────────────────────── */}
        <div className="feed-main">
          {/* Tabs */}
          <div className="feed-tabs">
            {TABS.map(({ key, label }) => (
              <Link
                key={key}
                href={`/leaders?tab=${key}`}
                className={`feed-tab${activeTab === key ? ' is-active' : ''}`}
              >
                {label}
              </Link>
            ))}
          </div>
          <hr className="feed-rule" />

          {/* Article list */}
          {articles.length > 0 ? (
            <div className="feed-list">
              {articles.map((article) => {
                const media = article.heroImage as { url?: string; sizes?: { thumbnail?: { url?: string } } } | null
                return (
                  <FeedItem
                    key={String(article.id)}
                    id={article.id}
                    slug={article.slug as string}
                    title={article.title as string}
                    dek={article.dek as string | null}
                    authorName={article.authorName as string}
                    authorAvatarUrl={article.authorAvatarUrl as string | null}
                    publishedAt={article.publishedAt as string | null}
                    readTime={article.readTime as number | null}
                    views={(article as { views?: number }).views ?? null}
                    heroImage={media}
                    heroImageUrl={article.heroImageUrl as string | null}
                    category={article.category as { name: string; slug: string } | null}
                  />
                )
              })}
            </div>
          ) : (
            <div className="feed-empty">
              No stories yet.{' '}
              <Link href="/submit" style={{ borderBottom: '1px solid var(--line)' }}>
                Be the first to submit.
              </Link>
            </div>
          )}
        </div>

        {/* ── Sidebar ───────────────────────────────────────── */}
        <aside className="feed-aside">
          <div className="aside-block">
            <p className="aside-heading">TOPICS</p>
            <div className="topic-chips">
              {TOPICS.map((topic) => (
                <span key={topic} className="chip">{topic}</span>
              ))}
            </div>
          </div>

          <hr className="aside-rule" />

          <div className="aside-block">
            <p className="aside-heading">SUBMIT YOUR STORY</p>
            <p className="aside-note">
              Share your perspective with C&apos;est Fort&apos;s readership.
              All submissions are reviewed by our editorial team.
            </p>
          </div>

          <div style={{ marginTop: 20 }}>
            <Link className="btn-ghost" href="/submit" style={{ display: 'inline-block' }}>
              SUBMIT NOW
            </Link>
          </div>
        </aside>
      </div>
    </>
  )
}
