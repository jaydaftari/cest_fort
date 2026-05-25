import type { Metadata } from 'next'
import Link from 'next/link'
import { getPayloadClient } from '@/lib/payload'
import { FeedItem } from '@/components/ui/ArticleCard'
import { createLogger } from '@/lib/logger'
import { getMockByCategory } from '@/mock-data/articles'

export const revalidate = 60

const logger = createLogger('Page:Leaders')

export const metadata: Metadata = {
  title: 'Leaders Stories',
  description:
    'Founder stories, executive insights, and leadership perspectives from the people shaping tomorrow.',
}

const TOPICS = [
  'Tech',
  'Culture',
  'Fashion',
  'Leadership',
  'Startups',
  'Sustainability',
  'AI',
  'Design',
]

export default async function LeadersPage() {
  logger.info('Rendering Leaders page')

  const payload = await getPayloadClient()

  const PIN_IDS = ['leaders.pin-1', 'leaders.pin-2', 'leaders.pin-3'] as const

  const pinResults = await Promise.all(
    PIN_IDS.map((slotId) =>
      payload.find({
        collection: 'articles',
        where: { and: [{ placement: { equals: slotId } }, { _status: { equals: 'published' } }] },
        limit: 1,
        depth: 2,
      })
    )
  )

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pinnedDocs: (any | null)[] = pinResults.map((r) => r.docs[0] ?? null)
  const hasRealPins = pinnedDocs.some(Boolean)

  // Mock fallback for pinned section when no articles are placed yet
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mockDocs = hasRealPins ? [] : (getMockByCategory('leaders-stories') as unknown as any[])
  const displayPinned = hasRealPins ? pinnedDocs.filter(Boolean) : mockDocs.slice(0, 3)

  logger.info('Leaders page data fetched', { pinned: displayPinned.length })

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
      <div className="cat-header">
        <Link className="cat-back" href="/">
          ← HOME
        </Link>
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
          Founder stories, executive insights, and leadership perspectives from the people shaping
          tomorrow. Submit your story and reach the most discerning readership.
        </p>
      </div>

      <div className="feed-layout">
        {/* ── Main feed ─────────────────────────────────────── */}
        <div className="feed-main">
          {/* 3 editorially-pinned stories */}
          {displayPinned.length > 0 ? (
            <div style={{ marginBottom: 48 }}>
              <p className="eyebrow" style={{ marginBottom: 16 }}>
                FEATURED
              </p>
              <hr className="feed-rule" />
              <div className="feed-list">
                {displayPinned.map((article) => (
                  <FeedItem key={String(article.id)} {...toFeedItemProps(article)} />
                ))}
              </div>
            </div>
          ) : (
            <div className="feed-empty" style={{ marginBottom: 48 }}>
              No featured stories yet. Assign articles to Pinned Story slots from the editorial
              panel.
            </div>
          )}

          {/* More Leader Stories button */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              paddingTop: 8,
            }}
          >
            <hr style={{ flex: 1, border: 'none', borderTop: '1px solid rgba(0,0,0,0.1)' }} />
            <Link
              href="/leaders/more"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                padding: '13px 28px',
                background: '#1a1c1c',
                color: '#fff',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                textDecoration: 'none',
                borderRadius: 2,
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              MORE LEADER STORIES
              <svg
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                style={{ width: 13, height: 13 }}
              >
                <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <hr style={{ flex: 1, border: 'none', borderTop: '1px solid rgba(0,0,0,0.1)' }} />
          </div>
        </div>

        {/* ── Sidebar ───────────────────────────────────────── */}
        <aside className="feed-aside">
          <div className="aside-block">
            <p className="aside-heading">TOPICS</p>
            <div className="topic-chips">
              {TOPICS.map((topic) => (
                <span key={topic} className="chip">
                  {topic}
                </span>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </>
  )
}
