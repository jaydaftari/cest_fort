import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getPayloadClient } from '@/lib/payload'
import { categoryLabel, formatDateShort, truncate, getArticleImageUrl } from '@/lib/utils'
import { Pagination } from '@/components/ui/Pagination'
import { createLogger } from '@/lib/logger'
import { getMockByCategory } from '@/mock-data/articles'
import { sectionGridSlots } from '@/lib/slots'
import type { SlotId } from '@/lib/slots'

export const revalidate = 30

const logger = createLogger('Page:Category')

const VALID_SLUGS = ['tech', 'culture', 'fashion', 'showbusiness', 'leaders-stories']
const ARTICLES_PER_PAGE = 8

function slotPrefix(slug: string): string {
  return slug === 'leaders-stories' ? 'leaders' : slug
}

type PageProps = {
  params: Promise<{ category: string }>
  searchParams: Promise<{ page?: string }>
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { category } = await params
  const { page: pageStr } = await searchParams
  const label = categoryLabel(category)
  const page = Math.max(1, parseInt(pageStr ?? '1', 10) || 1)
  const canonical = page > 1 ? `/${category}?page=${page}` : `/${category}`
  return {
    title: label,
    description: `Read the latest ${label} coverage from C'est Fort Magazine.`,
    alternates: { canonical },
  }
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { category: slug } = await params
  const { page: pageStr } = await searchParams
  const page = Math.max(1, parseInt(pageStr ?? '1', 10) || 1)

  if (!VALID_SLUGS.includes(slug)) {
    logger.warn('Invalid category slug — 404', { slug })
    notFound()
  }

  const payload = await getPayloadClient()
  const prefix = slotPrefix(slug)

  // 9 cover grid slot IDs (DOM render order)
  const slotIds = sectionGridSlots(prefix)
  // Non-exclusive article slot for the paginated feed
  const articleSlotId = `${prefix}.article` as SlotId

  // Cover grid slots only needed on page 1
  const coverSlotQueries =
    page === 1
      ? slotIds.map((slotId) =>
          payload.find({
            collection: 'articles',
            where: {
              and: [{ placement: { equals: slotId } }, { _status: { equals: 'published' } }],
            },
            limit: 1,
            depth: 2,
          })
        )
      : []

  // Fetch cover grid slots + paginated article feed in parallel
  const [categoryResult, articleFeedResult, ...slotResults] = await Promise.all([
    payload.find({ collection: 'categories', where: { slug: { equals: slug } }, limit: 1 }),

    // Paginated article feed — articles placed as {section}.article
    payload.find({
      collection: 'articles',
      where: {
        and: [{ placement: { equals: articleSlotId } }, { _status: { equals: 'published' } }],
      },
      limit: ARTICLES_PER_PAGE,
      page,
      sort: '-publishedAt',
      depth: 2,
    }),

    // 9 cover grid slots (page 1 only)
    ...coverSlotQueries,
  ])

  const category = categoryResult.docs[0] ?? null

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const slotDocs: (any | null)[] = slotResults.map((r) => r.docs[0] ?? null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mockDocs = getMockByCategory(slug) as unknown as any[]

  // Per-slot fallback: placed article OR mock for that position
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const effectiveSlots: (any | null)[] = slotIds.map((_, i) => slotDocs[i] ?? mockDocs[i] ?? null)

  // Article feed
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const feedArticles: any[] = articleFeedResult.docs
  const totalArticles = articleFeedResult.totalDocs
  const totalPages = Math.ceil(totalArticles / ARTICLES_PER_PAGE) || 1

  logger.info('Category page fetched', {
    slug,
    page,
    filledSlots: effectiveSlots.filter(Boolean).length,
    feedCount: feedArticles.length,
    totalArticles,
    totalPages,
  })

  const label = (category?.name as string | undefined) ?? categoryLabel(slug)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getImageUrl = (article: any): string | null => getArticleImageUrl(article, ['hero', 'card'])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getAuthorLine = (article: any) =>
    `By ${article.authorName as string}${article.publishedAt ? ` · ${formatDateShort(article.publishedAt as string)}` : ''}`

  const hasAnyContent = effectiveSlots.some(Boolean)

  // Named cover slots
  const [c1, cCenter, c2, c3, c4, c5, c6, c7, c8] = effectiveSlots

  return (
    <>
      <div className="cat-header">
        <Link className="cat-back" href="/">
          ← HOME
        </Link>
        <h1 className="cat-title">{label.toUpperCase()}</h1>
      </div>

      <section className="cat-section">
        {/* ── Cover grid — first page only ───────────────────── */}
        {page === 1 && hasAnyContent && (
          <>
            <div className="sg-top">
              {/* Left: cover-1 (top) + cover-3 (bottom) */}
              <div className="sg-side">
                {c1 ? (
                  <Link className="sg-card" href={`/articles/${c1.slug as string}`}>
                    <div className="sg-card-thumb">
                      {getImageUrl(c1) && (
                        <Image
                          src={getImageUrl(c1) as string}
                          alt={c1.title as string}
                          width={560}
                          height={420}
                          style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                        />
                      )}
                    </div>
                    <p className="sg-label">{label.toUpperCase()}</p>
                    <p className="sg-title-sm">{c1.title as string}</p>
                    <p className="sg-author">{getAuthorLine(c1)}</p>
                  </Link>
                ) : (
                  <div className="sg-card sg-card--empty" />
                )}

                {c3 ? (
                  <Link className="sg-card" href={`/articles/${c3.slug as string}`}>
                    <div className="sg-card-thumb">
                      {getImageUrl(c3) && (
                        <Image
                          src={getImageUrl(c3) as string}
                          alt={c3.title as string}
                          width={560}
                          height={420}
                          style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                        />
                      )}
                    </div>
                    <p className="sg-label">{label.toUpperCase()}</p>
                    <p className="sg-title-sm">{c3.title as string}</p>
                    <p className="sg-author">{getAuthorLine(c3)}</p>
                  </Link>
                ) : (
                  <div className="sg-card sg-card--empty" />
                )}
              </div>

              {/* Center feature */}
              {cCenter ? (
                <Link className="sg-feature" href={`/articles/${cCenter.slug as string}`}>
                  {getImageUrl(cCenter) && (
                    <Image
                      src={getImageUrl(cCenter) as string}
                      alt={cCenter.title as string}
                      fill
                      sizes="(max-width: 900px) 100vw, 50vw"
                      style={{ objectFit: 'cover' }}
                      priority
                    />
                  )}
                  <div className="sg-feature-overlay" />
                  <div className="sg-feature-body">
                    <p className="sg-label sg-label--light">{label.toUpperCase()}</p>
                    <p className="sg-title-lg">{cCenter.title as string}</p>
                    {cCenter.dek && (
                      <p className="sg-blurb sg-blurb--light">
                        {truncate(cCenter.dek as string, 200)}
                      </p>
                    )}
                    <p className="sg-author sg-author--light">{getAuthorLine(cCenter)}</p>
                  </div>
                </Link>
              ) : (
                <div className="sg-feature sg-feature--empty" />
              )}

              {/* Right: cover-2 (top) + cover-4 (bottom) */}
              <div className="sg-side">
                {c2 ? (
                  <Link className="sg-card" href={`/articles/${c2.slug as string}`}>
                    <div className="sg-card-thumb">
                      {getImageUrl(c2) && (
                        <Image
                          src={getImageUrl(c2) as string}
                          alt={c2.title as string}
                          width={560}
                          height={420}
                          style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                        />
                      )}
                    </div>
                    <p className="sg-label">{label.toUpperCase()}</p>
                    <p className="sg-title-sm">{c2.title as string}</p>
                    <p className="sg-author">{getAuthorLine(c2)}</p>
                  </Link>
                ) : (
                  <div className="sg-card sg-card--empty" />
                )}

                {c4 ? (
                  <Link className="sg-card" href={`/articles/${c4.slug as string}`}>
                    <div className="sg-card-thumb">
                      {getImageUrl(c4) && (
                        <Image
                          src={getImageUrl(c4) as string}
                          alt={c4.title as string}
                          width={560}
                          height={420}
                          style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                        />
                      )}
                    </div>
                    <p className="sg-label">{label.toUpperCase()}</p>
                    <p className="sg-title-sm">{c4.title as string}</p>
                    <p className="sg-author">{getAuthorLine(c4)}</p>
                  </Link>
                ) : (
                  <div className="sg-card sg-card--empty" />
                )}
              </div>
            </div>

            {/* Bottom row: cover-5 through cover-8 */}
            <div className="sg-bottom">
              {[c5, c6, c7, c8].map((article, i) =>
                article ? (
                  <Link
                    key={`b${i}`}
                    className="sg-bcard"
                    href={`/articles/${article.slug as string}`}
                  >
                    <div className="sg-bcard-thumb">
                      {getImageUrl(article) && (
                        <Image
                          src={getImageUrl(article) as string}
                          alt={article.title as string}
                          width={560}
                          height={374}
                          style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                        />
                      )}
                    </div>
                    <p className="sg-label">{label.toUpperCase()}</p>
                    <p className="sg-title-sm">{article.title as string}</p>
                    {article.dek && (
                      <p className="sg-blurb">{truncate(article.dek as string, 100)}</p>
                    )}
                    <p className="sg-author">{getAuthorLine(article)}</p>
                  </Link>
                ) : (
                  <div key={`e${i}`} className="sg-bcard sg-bcard--empty" />
                )
              )}
            </div>
          </>
        )}

        {/* ── Paginated article feed ──────────────────────────── */}
        {feedArticles.length > 0 && (
          <>
            {page === 1 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '48px 0 0' }}>
                <p className="eyebrow">MORE IN {label.toUpperCase()}</p>
                <hr style={{ flex: 1, border: 'none', borderTop: '1px solid rgba(0,0,0,0.1)' }} />
              </div>
            )}

            <div className="sg-more-grid" style={{ marginTop: 16 }}>
              {feedArticles.map((article) => (
                <Link
                  key={article.id}
                  className="sg-more-card"
                  href={`/articles/${article.slug as string}`}
                >
                  <div className="sg-more-thumb">
                    {getImageUrl(article) && (
                      <Image
                        src={getImageUrl(article) as string}
                        alt={article.title as string}
                        width={560}
                        height={374}
                        style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                      />
                    )}
                  </div>
                  <p className="sg-label">
                    {((article.category as { name?: string } | null)?.name ?? label).toUpperCase()}
                  </p>
                  <p className="sg-title-sm">{article.title as string}</p>
                  {article.dek && <p className="sg-blurb">{truncate(article.dek as string, 90)}</p>}
                  <p className="sg-author">{getAuthorLine(article)}</p>
                </Link>
              ))}
              {/* Fill last row to keep grid aligned */}
              {feedArticles.length % 4 !== 0 &&
                Array.from({ length: 4 - (feedArticles.length % 4) }).map((_, i) => (
                  <div key={`ep${i}`} className="sg-more-card sg-more-card--empty" />
                ))}
            </div>

            <Pagination
              page={page}
              totalPages={totalPages}
              buildHref={(p) => `/${slug}?page=${p}`}
            />
          </>
        )}
      </section>
    </>
  )
}
