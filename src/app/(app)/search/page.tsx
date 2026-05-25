import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getPayloadClient } from '@/lib/payload'
import { formatDateShort, truncate, getArticleImageUrl } from '@/lib/utils'
import { Pagination } from '@/components/ui/Pagination'
import { createLogger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

const logger = createLogger('Page:Search')

type PageProps = {
  searchParams: Promise<{ q?: string; page?: string }>
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const { q, page: pageStr } = await searchParams
  const query = (q?.trim() ?? '').slice(0, 200)
  const page = Math.max(1, parseInt(pageStr ?? '1', 10) || 1)
  const canonical = query
    ? page > 1
      ? `/search?q=${encodeURIComponent(query)}&page=${page}`
      : `/search?q=${encodeURIComponent(query)}`
    : '/search'
  return {
    title: query ? `"${query}" — Search — C'est Fort` : "Search — C'est Fort",
    alternates: { canonical },
  }
}

const PAGE_SIZE = 10

export default async function SearchPage({ searchParams }: PageProps) {
  const { q: rawQ, page: pageStr } = await searchParams
  const query = (rawQ?.trim() ?? '').slice(0, 200)
  const page = Math.max(1, parseInt(pageStr ?? '1', 10) || 1)

  logger.info('Search page', { query, page })

  let results: Awaited<ReturnType<Awaited<ReturnType<typeof getPayloadClient>>['find']>> | null =
    null

  if (query) {
    const payload = await getPayloadClient()
    results = await payload.find({
      collection: 'articles',
      where: {
        and: [
          { _status: { equals: 'published' } },
          {
            or: [
              { title: { contains: query } },
              { dek: { contains: query } },
              { authorName: { contains: query } },
            ],
          },
        ],
      },
      limit: PAGE_SIZE,
      page,
      sort: '-publishedAt',
      depth: 2,
    })
    logger.info('Search results', { query, total: results.totalDocs, page })
  }

  const docs = results?.docs ?? []
  const totalDocs = results?.totalDocs ?? 0
  const totalPages = Math.ceil(totalDocs / PAGE_SIZE)

  return (
    <div className="prose-page">
      <div
        style={{
          maxWidth: 'var(--container)',
          margin: '0 auto',
          padding: '48px var(--gutter) 96px',
        }}
      >
        {/* Search header */}
        <div style={{ maxWidth: 620, marginBottom: 48 }}>
          <p className="eyebrow" style={{ marginBottom: 16 }}>
            SEARCH THE ARCHIVE
          </p>
          <form action="/search" method="GET">
            <div
              style={{
                display: 'flex',
                border: '1px solid var(--line)',
                borderRadius: 2,
                overflow: 'hidden',
              }}
            >
              <input
                name="q"
                type="text"
                defaultValue={query}
                placeholder="Stories, contributors, topics…"
                maxLength={200}
                autoFocus={!query}
                style={{
                  flex: 1,
                  padding: '14px 18px',
                  border: 'none',
                  outline: 'none',
                  fontFamily: 'var(--sans)',
                  fontSize: 15,
                  color: 'var(--ink)',
                  background: 'transparent',
                }}
              />
              <button
                type="submit"
                style={{
                  padding: '0 22px',
                  background: 'var(--ink)',
                  color: 'var(--paper)',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'var(--sans)',
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                }}
              >
                Search
              </button>
            </div>
          </form>
        </div>

        {/* Results */}
        {!query ? (
          <p
            style={{
              fontFamily: 'var(--sans)',
              fontSize: 15,
              color: 'var(--muted)',
              marginTop: 64,
              textAlign: 'center',
            }}
          >
            Enter a search term above.
          </p>
        ) : docs.length === 0 ? (
          <div>
            <p
              style={{
                fontFamily: 'var(--serif)',
                fontSize: 22,
                color: 'var(--ink)',
                marginBottom: 12,
              }}
            >
              No results for &ldquo;{query}&rdquo;
            </p>
            <p style={{ fontFamily: 'var(--sans)', fontSize: 15, color: 'var(--muted)' }}>
              Try different keywords, or{' '}
              <Link
                href="/"
                style={{ color: 'var(--ink)', textDecoration: 'underline', textUnderlineOffset: 3 }}
              >
                browse the latest stories
              </Link>
              .
            </p>
          </div>
        ) : (
          <>
            <p
              style={{
                fontFamily: 'var(--sans)',
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'var(--muted)',
                marginBottom: 32,
              }}
            >
              {totalDocs} result{totalDocs !== 1 ? 's' : ''} for &ldquo;{query}&rdquo;
            </p>

            <div style={{ borderTop: '1px solid var(--line)' }}>
              {docs.map((article) => {
                const category = article.category as { name: string; slug: string } | null
                const imgUrl = getArticleImageUrl(article)
                return (
                  <Link
                    key={String(article.id)}
                    href={`/articles/${article.slug as string}`}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: imgUrl ? '1fr 120px' : '1fr',
                      gap: 24,
                      padding: '28px 0',
                      borderBottom: '1px solid var(--line)',
                      textDecoration: 'none',
                    }}
                  >
                    <div>
                      {category && (
                        <p
                          style={{
                            fontFamily: 'var(--sans)',
                            fontSize: 10,
                            fontWeight: 700,
                            letterSpacing: '0.22em',
                            textTransform: 'uppercase',
                            color: 'var(--muted)',
                            marginBottom: 10,
                          }}
                        >
                          {category.name}
                        </p>
                      )}
                      <h2
                        style={{
                          fontFamily: 'var(--serif)',
                          fontSize: 'clamp(18px, 2.5vw, 24px)',
                          fontWeight: 500,
                          lineHeight: 1.25,
                          color: 'var(--ink)',
                          margin: '0 0 10px',
                        }}
                      >
                        {article.title as string}
                      </h2>
                      {article.dek && (
                        <p
                          style={{
                            fontFamily: 'var(--sans)',
                            fontSize: 14,
                            color: 'var(--ink-soft)',
                            lineHeight: 1.55,
                            margin: '0 0 14px',
                          }}
                        >
                          {truncate(article.dek as string, 160)}
                        </p>
                      )}
                      <p
                        style={{
                          fontFamily: 'var(--sans)',
                          fontSize: 11,
                          fontWeight: 500,
                          letterSpacing: '0.14em',
                          textTransform: 'uppercase',
                          color: 'var(--muted-2)',
                        }}
                      >
                        {article.authorName as string}
                        {article.publishedAt
                          ? ` · ${formatDateShort(article.publishedAt as string)}`
                          : ''}
                      </p>
                    </div>

                    {imgUrl && (
                      <div
                        style={{
                          position: 'relative',
                          aspectRatio: '4/3',
                          overflow: 'hidden',
                          background: '#eee',
                          flexShrink: 0,
                          alignSelf: 'start',
                        }}
                      >
                        <Image
                          src={imgUrl}
                          alt={article.title as string}
                          fill
                          sizes="120px"
                          style={{ objectFit: 'cover' }}
                        />
                      </div>
                    )}
                  </Link>
                )
              })}
            </div>

            <Pagination
              page={page}
              totalPages={totalPages}
              buildHref={(p) => `/search?q=${encodeURIComponent(query)}&page=${p}`}
            />
          </>
        )}
      </div>
    </div>
  )
}
