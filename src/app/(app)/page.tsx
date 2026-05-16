import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getPayloadClient } from '@/lib/payload'
import { formatDate, formatDateShort, truncate } from '@/lib/utils'
import { StoryCard, LatestCard, RailItem } from '@/components/ui/ArticleCard'
import { NewsletterForm } from '@/components/ui/NewsletterForm'
import { MOCK_ARTICLES } from '@/mock-data/articles'
import { createLogger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

const logger = createLogger('Page:Home')

export const metadata: Metadata = {
  title: "C'est Fort — Tech, Culture & The New Luxury",
}

export default async function HomePage() {
  logger.info('Rendering homepage')

  const payload = await getPayloadClient()

  // Fetch hero (featured) article
  const heroResult = await payload.find({
    collection: 'articles',
    where: { and: [{ featured: { equals: true } }, { _status: { equals: 'published' } }] },
    limit: 1,
    sort: '-publishedAt',
    depth: 2,
  })

  // Fetch lead story for coverage section + 3 rail items
  const coverageResult = await payload.find({
    collection: 'articles',
    where: { _status: { equals: 'published' } },
    limit: 4,
    sort: '-publishedAt',
    depth: 2,
  })

  // Fetch featured stories grid (next 4)
  const featuredResult = await payload.find({
    collection: 'articles',
    where: { _status: { equals: 'published' } },
    limit: 4,
    sort: '-publishedAt',
    depth: 2,
    page: 2,
  })

  // Fetch latest articles (5-col grid)
  const latestResult = await payload.find({
    collection: 'articles',
    where: { _status: { equals: 'published' } },
    limit: 4,
    sort: '-publishedAt',
    depth: 2,
  })

  // Fall back to mock data when the DB has no published articles yet
  const hasRealArticles = coverageResult.docs.length > 0 || heroResult.docs.length > 0
  type Doc = typeof coverageResult.docs[number]
  const mockDocs = hasRealArticles ? [] : (MOCK_ARTICLES as unknown as Doc[])

  const hero = heroResult.docs[0] ?? coverageResult.docs[0] ?? mockDocs[0] ?? null

  // Exclude hero from coverage so it isn't shown twice
  const coverageDocs = hasRealArticles
    ? coverageResult.docs.filter((doc) => String(doc.id) !== String(hero?.id))
    : mockDocs.slice(1)

  const [leadStory, ...railItems] = coverageDocs
  const featuredStories = hasRealArticles ? featuredResult.docs : mockDocs.slice(4, 8)
  const latestArticles = hasRealArticles ? latestResult.docs : mockDocs.slice(0, 4)

  logger.info('Homepage data fetched', {
    heroId: hero?.id,
    coverageCount: coverageResult.totalDocs,
    featuredCount: featuredResult.totalDocs,
  })

  // Helpers to safely pull media URL from Payload upload or external URL
  const getImageUrl = (article: typeof hero) => {
    if (!article) return null
    const media = article.heroImage as { url?: string; sizes?: { card?: { url?: string }; hero?: { url?: string } } } | null
    return media?.sizes?.hero?.url ?? media?.sizes?.card?.url ?? media?.url ?? (article.heroImageUrl as string | null)
  }

  const getCategory = (article: typeof hero) => {
    if (!article) return null
    return article.category as { name: string; slug: string } | null
  }

  return (
    <>
      {/* ── Hero ────────────────────────────────────────────── */}
      {hero ? (
        <section className="hero">
          <article className="hero-grid">
            <Link className="hero-media" href={`/articles/${hero.slug as string}`}>
              <span className="cat-pill">{(getCategory(hero)?.name ?? 'ARTICLE').toUpperCase()}</span>
              {getImageUrl(hero) && (
                <Image
                  src={getImageUrl(hero) as string}
                  alt={hero.title as string}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  style={{ objectFit: 'cover' }}
                  priority
                />
              )}
            </Link>

            <div className="hero-text">
              <p className="eyebrow">{(getCategory(hero)?.name ?? '').toUpperCase()}</p>
              <h1 className="display">{hero.title as string}</h1>
              {hero.dek && (
                <p className="dek">{truncate(hero.dek as string, 220)}</p>
              )}
              <hr className="rule" />
              <div className="byline">
                <span
                  className="avatar"
                  style={
                    hero.authorAvatarUrl
                      ? { backgroundImage: `url(${hero.authorAvatarUrl as string})` }
                      : {}
                  }
                />
                <div>
                  <p className="author">{hero.authorName as string}</p>
                  {hero.publishedAt && (
                    <p className="date">{formatDate(hero.publishedAt as string).toUpperCase()}</p>
                  )}
                </div>
              </div>
              <Link className="btn-ghost" href={`/articles/${hero.slug as string}`}>
                READ ARTICLE
              </Link>
            </div>
          </article>
        </section>
      ) : (
        <section className="hero">
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--muted)' }}>
            <p className="eyebrow">WELCOME</p>
            <h1 className="display" style={{ margin: '0 auto 24px', maxWidth: 640 }}>
              C&apos;est Fort Magazine
            </h1>
            <p className="dek" style={{ maxWidth: 540, margin: '0 auto 32px' }}>
              Tech, culture, and refined living. Publish your first article to see it featured here.
            </p>
            <Link className="btn-ghost" href="/submit">SUBMIT AN ARTICLE</Link>
          </div>
        </section>
      )}

      {/* ── Featured Coverage ──────────────────────────────── */}
      {leadStory && (
        <section className="coverage">
          <div className="coverage-head">
            <div>
              <p className="eyebrow">FEATURED COVERAGE</p>
              <h2 className="section-title">
                {(getCategory(leadStory)?.name) ?? 'Latest'}
              </h2>
            </div>
            {getCategory(leadStory) && (
              <Link className="view-all" href={`/${getCategory(leadStory)!.slug}`}>
                VIEW ALL
              </Link>
            )}
          </div>

          <div className="coverage-grid">
            <article className="lead-story">
              <Link className="lead-media" href={`/articles/${leadStory.slug as string}`}>
                <span className="cat-pill">
                  {(getCategory(leadStory)?.name ?? 'ARTICLE').toUpperCase()}
                </span>
                {getImageUrl(leadStory) && (
                  <Image
                    src={getImageUrl(leadStory) as string}
                    alt={leadStory.title as string}
                    fill
                    sizes="(max-width: 1024px) 100vw, 55vw"
                    style={{ objectFit: 'cover' }}
                  />
                )}
              </Link>
              <h3 className="lead-title">{leadStory.title as string}</h3>
              {leadStory.dek && (
                <p className="lead-dek">{truncate(leadStory.dek as string, 180)}</p>
              )}
              <div className="byline">
                <span
                  className="avatar"
                  style={
                    leadStory.authorAvatarUrl
                      ? { backgroundImage: `url(${leadStory.authorAvatarUrl as string})` }
                      : {}
                  }
                />
                <div>
                  <p className="author">{leadStory.authorName as string}</p>
                  {leadStory.publishedAt && (
                    <p className="date">{formatDate(leadStory.publishedAt as string).toUpperCase()}</p>
                  )}
                </div>
              </div>
            </article>

            <aside className="story-rail">
              {railItems.slice(0, 3).map((article) => (
                <RailItem
                  key={String(article.id)}
                  id={article.id}
                  slug={article.slug as string}
                  title={article.title as string}
                  dek={article.dek as string | null}
                  authorName={article.authorName as string}
                  publishedAt={article.publishedAt as string | null}
                  category={getCategory(article)}
                />
              ))}
            </aside>
          </div>
        </section>
      )}

      {/* ── Sponsor Band (static) ──────────────────────────── */}
      <section className="sponsor" aria-hidden="true">
        <Image
          className="sponsor-img"
          src="https://images.unsplash.com/photo-1541643600914-78b084683601?w=1800&q=80"
          alt=""
          width={1800}
          height={380}
          style={{ objectFit: 'cover' }}
        />
        <div className="sponsor-tint" />
        <div className="sponsor-inner">
          <p className="eyebrow eyebrow--light">PRESENTED BY</p>
          <p className="sponsor-brand">MAISON VERMEIL</p>
          <p className="sponsor-tag">The art of fragrance, reimagined for the modern connoisseur</p>
          <span className="btn-ghost btn-ghost--light">EXPLORE</span>
        </div>
      </section>

      {/* ── Featured Stories ───────────────────────────────── */}
      <section className="featured">
        <header className="featured-head">
          <p className="eyebrow">CURATED SELECTION</p>
          <h2 className="display center">Featured Stories</h2>
        </header>

        {featuredStories.length > 0 ? (
          <div className="featured-grid">
            {featuredStories.map((article) => (
              <StoryCard
                key={String(article.id)}
                id={article.id}
                slug={article.slug as string}
                title={article.title as string}
                dek={article.dek as string | null}
                authorName={article.authorName as string}
                publishedAt={article.publishedAt as string | null}
                heroImage={article.heroImage as Parameters<typeof StoryCard>[0]['heroImage']}
                heroImageUrl={article.heroImageUrl as string | null}
                category={getCategory(article)}
              />
            ))}
          </div>
        ) : (
          <div className="feed-empty">No featured stories yet. Add articles via the admin panel.</div>
        )}
      </section>

      {/* ── Editor&apos;s Pick (dark section) ─────────────────── */}
      {hero && (
        <section className="editor-pick">
          <div className="editor-grid">
            <div className="editor-text">
              <p className="eyebrow eyebrow--light">EDITOR&apos;S PICK</p>
              <h2 className="display display--light">{hero.title as string}</h2>
              {hero.dek && (
                <p className="editor-dek">{truncate(hero.dek as string, 260)}</p>
              )}
              <Link className="btn-outline" href={`/articles/${hero.slug as string}`}>
                DISCOVER MORE
              </Link>
              <hr className="rule rule--light" />
              <div className="byline byline--light">
                <span
                  className="avatar avatar--dark"
                  style={
                    hero.authorAvatarUrl
                      ? { backgroundImage: `url(${hero.authorAvatarUrl as string})` }
                      : {}
                  }
                />
                <div>
                  <p className="author">{hero.authorName as string}</p>
                  <p className="date date--muted">
                    {(getCategory(hero)?.name) ?? 'Contributor'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Latest Articles ────────────────────────────────── */}
      <section className="latest">
        <div className="latest-head">
          <h2 className="section-title">Latest Articles</h2>
          <Link className="view-all" href="/leaders">VIEW ALL</Link>
        </div>
        <hr className="section-rule" />

        {latestArticles.length > 0 ? (
          <div className="latest-grid">
            {latestArticles.map((article) => (
              <LatestCard
                key={String(article.id)}
                id={article.id}
                slug={article.slug as string}
                title={article.title as string}
                dek={article.dek as string | null}
                authorName={article.authorName as string}
                publishedAt={article.publishedAt as string | null}
                heroImage={article.heroImage as Parameters<typeof LatestCard>[0]['heroImage']}
                heroImageUrl={article.heroImageUrl as string | null}
                category={getCategory(article)}
              />
            ))}
          </div>
        ) : (
          <div className="feed-empty">No articles published yet.</div>
        )}
      </section>

      {/* ── Newsletter ─────────────────────────────────────── */}
      <section className="newsletter">
        <div className="newsletter-inner">
          <div className="mail-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
              <rect x="3" y="6" width="18" height="13" rx="1" />
              <path d="M3 7l9 7 9-7" />
            </svg>
          </div>
          <h2 className="display center">Join Our Circle</h2>
          <p className="newsletter-dek">
            Receive curated insights on tech, culture, and refined living.
            Delivered weekly to the most discerning readers.
          </p>
          <NewsletterForm />
          <p className="newsletter-fineprint">
            By subscribing, you agree to our{' '}
            <Link href="/privacy">Privacy Policy</Link> and consent to receive updates.
          </p>
        </div>
      </section>
    </>
  )
}
