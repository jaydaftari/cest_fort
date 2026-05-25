import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getPayloadClient } from '@/lib/payload'
import { formatDate, truncate, getArticleImageUrl } from '@/lib/utils'
import { StoryCard, LatestCard, RailItem } from '@/components/ui/ArticleCard'
import { NewsletterForm } from '@/components/ui/NewsletterForm'
import { MOCK_ARTICLES } from '@/mock-data/articles'
import { createLogger } from '@/lib/logger'
import JsonLd from '@/components/seo/JsonLd'

export const revalidate = 30

const logger = createLogger('Page:Home')

export const metadata: Metadata = {
  title: "C'est Fort — Tech, Culture & The New Luxury",
}

async function fetchByPlacement(
  payload: Awaited<ReturnType<typeof getPayloadClient>>,
  slotId: string
) {
  const result = await payload.find({
    collection: 'articles',
    where: { and: [{ placement: { equals: slotId } }, { _status: { equals: 'published' } }] },
    limit: 1,
    depth: 2,
  })
  return result.docs[0] ?? null
}

export default async function HomePage() {
  logger.info('Rendering homepage')

  const payload = await getPayloadClient()

  // Fetch placed articles + sponsor band global in parallel
  const [
    hero,
    leadStory,
    editorsPick,
    feat1,
    feat2,
    feat3,
    feat4,
    rail1,
    rail2,
    rail3,
    latest1,
    latest2,
    latest3,
    latest4,
    sponsorBandRaw,
  ] = await Promise.all([
    fetchByPlacement(payload, 'homepage.hero'),
    fetchByPlacement(payload, 'homepage.lead'),
    fetchByPlacement(payload, 'homepage.editors-pick'),
    fetchByPlacement(payload, 'homepage.featured-1'),
    fetchByPlacement(payload, 'homepage.featured-2'),
    fetchByPlacement(payload, 'homepage.featured-3'),
    fetchByPlacement(payload, 'homepage.featured-4'),
    fetchByPlacement(payload, 'homepage.rail-1'),
    fetchByPlacement(payload, 'homepage.rail-2'),
    fetchByPlacement(payload, 'homepage.rail-3'),
    fetchByPlacement(payload, 'homepage.latest-1'),
    fetchByPlacement(payload, 'homepage.latest-2'),
    fetchByPlacement(payload, 'homepage.latest-3'),
    fetchByPlacement(payload, 'homepage.latest-4'),
    payload.findGlobal({ slug: 'sponsor-band' }).catch(() => null),
  ])

  const sponsor = sponsorBandRaw as {
    enabled?: boolean
    image?: { url?: string; sizes?: { hero?: { url?: string } } } | null
    imageUrl?: string | null
    eyebrow?: string | null
    brand?: string | null
    tagline?: string | null
    linkUrl?: string | null
    linkLabel?: string | null
  } | null

  const sponsorImageUrl =
    sponsor?.image?.sizes?.hero?.url ?? sponsor?.image?.url ?? sponsor?.imageUrl ?? null

  // Merge with hardcoded mock — shown until an editor overrides via Sponsor Band settings
  const effectiveSponsor = {
    enabled: sponsor?.enabled ?? true,
    brand: sponsor?.brand ?? 'MAISON VERMEIL',
    eyebrow: sponsor?.eyebrow ?? 'PRESENTED BY',
    tagline: sponsor?.tagline ?? 'The art of fragrance, reimagined for the modern connoisseur',
    linkUrl: sponsor?.linkUrl ?? '#',
    linkLabel: sponsor?.linkLabel ?? 'EXPLORE',
  }

  // Fetch latest articles for the grid (exclude placed ones)
  const placedIds = [
    hero?.id,
    leadStory?.id,
    editorsPick?.id,
    feat1?.id,
    feat2?.id,
    feat3?.id,
    feat4?.id,
    rail1?.id,
    rail2?.id,
    rail3?.id,
    latest1?.id,
    latest2?.id,
    latest3?.id,
    latest4?.id,
  ]
    .filter(Boolean)
    .map(String)

  const latestResult = await payload.find({
    collection: 'articles',
    where: { _status: { equals: 'published' } },
    limit: 12,
    sort: '-publishedAt',
    depth: 2,
  })

  // Fall back to mock data when DB has no published articles yet
  const hasRealArticles = latestResult.docs.length > 0 || !!hero
  type Doc = (typeof latestResult.docs)[number]
  const mockDocs = hasRealArticles ? [] : (MOCK_ARTICLES as unknown as Doc[])

  // Filter out placed articles from the latest grid to avoid duplicates
  const latestDocs = hasRealArticles
    ? latestResult.docs.filter((doc) => !placedIds.includes(String(doc.id)))
    : mockDocs.slice(1)

  const heroDoc = hero ?? mockDocs[0] ?? null
  const leadDoc = leadStory ?? mockDocs[1] ?? null
  const pickDoc = editorsPick ?? mockDocs[2] ?? null
  // Rail items beside Lead Story — use placed slots, fill gaps from latest
  const placedRail = [rail1, rail2, rail3]
  const hasAnyRailPlacement = placedRail.some(Boolean)
  const railFallback = latestDocs.filter(
    (doc) => ![rail1?.id, rail2?.id, rail3?.id].filter(Boolean).map(String).includes(String(doc.id))
  )
  const railItems = hasRealArticles
    ? (() => {
        if (!hasAnyRailPlacement) return latestDocs.slice(1, 4)
        const result: Doc[] = []
        let fi = 0
        for (const placed of placedRail) {
          if (placed) result.push(placed as Doc)
          else if (fi < railFallback.length) result.push(railFallback[fi++])
        }
        return result
      })()
    : mockDocs.slice(1, 4)

  // Featured Stories: use editorially-placed slots, fill any empty slots from latest articles
  const placedFeatured = [feat1, feat2, feat3, feat4]
  const hasAnyFeaturedPlacement = placedFeatured.some(Boolean)
  const featuredFallback = latestResult.docs.filter((doc) => !placedIds.includes(String(doc.id)))
  const featuredStories = hasRealArticles
    ? (() => {
        const result: Doc[] = []
        let fallbackIdx = 0
        for (const placed of placedFeatured) {
          if (placed) {
            result.push(placed as Doc)
          } else if (fallbackIdx < featuredFallback.length) {
            result.push(featuredFallback[fallbackIdx++])
          }
        }
        // If no placements at all, just use the first 4 latest
        return hasAnyFeaturedPlacement ? result : latestResult.docs.slice(0, 4)
      })()
    : mockDocs.slice(4, 8)

  // Latest Articles row — use placed slots, fill gaps from most-recent unplaced articles
  const placedLatest = [latest1, latest2, latest3, latest4]
  const hasAnyLatestPlacement = placedLatest.some(Boolean)
  const latestArticles = hasRealArticles
    ? (() => {
        if (!hasAnyLatestPlacement) return latestDocs.slice(0, 4)
        const latestFallback = latestDocs.filter(
          (doc) =>
            ![latest1?.id, latest2?.id, latest3?.id, latest4?.id]
              .filter(Boolean)
              .map(String)
              .includes(String(doc.id))
        )
        const result: Doc[] = []
        let fi = 0
        for (const placed of placedLatest) {
          if (placed) result.push(placed as Doc)
          else if (fi < latestFallback.length) result.push(latestFallback[fi++])
        }
        return result
      })()
    : mockDocs.slice(0, 4)

  logger.info('Homepage data fetched', {
    heroId: hero?.id,
    latestCount: latestResult.totalDocs,
  })

  const getImageUrl = (article: typeof hero) =>
    article ? getArticleImageUrl(article, ['hero', 'card']) : null

  const getCategory = (article: typeof hero) => {
    if (!article) return null
    return article.category as { name: string; slug: string } | null
  }

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: "C'est Fort",
    url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cestfort.com',
    description: 'Tech, Culture & The New Luxury',
  }

  return (
    <>
      <JsonLd data={organizationSchema} />
      {/* ── Hero ────────────────────────────────────────────── */}
      {heroDoc ? (
        <section className="hero">
          <article className="hero-grid">
            <Link className="hero-media" href={`/articles/${heroDoc.slug as string}`}>
              <span className="cat-pill">
                {(getCategory(heroDoc)?.name ?? 'ARTICLE').toUpperCase()}
              </span>
              {getImageUrl(heroDoc) && (
                <Image
                  src={getImageUrl(heroDoc) as string}
                  alt={heroDoc.title as string}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  style={{ objectFit: 'cover' }}
                  priority
                />
              )}
            </Link>

            <div className="hero-text">
              <p className="eyebrow">{(getCategory(heroDoc)?.name ?? '').toUpperCase()}</p>
              <h1 className="display">{heroDoc.title as string}</h1>
              {heroDoc.dek && <p className="dek">{truncate(heroDoc.dek as string, 220)}</p>}
              <hr className="rule" />
              <div className="byline">
                <span
                  className="avatar"
                  style={
                    heroDoc.authorAvatarUrl
                      ? { backgroundImage: `url(${heroDoc.authorAvatarUrl as string})` }
                      : {}
                  }
                />
                <div>
                  <p className="author">{heroDoc.authorName as string}</p>
                  {heroDoc.publishedAt && (
                    <p className="date">
                      {formatDate(heroDoc.publishedAt as string).toUpperCase()}
                    </p>
                  )}
                </div>
              </div>
              <Link className="btn-ghost" href={`/articles/${heroDoc.slug as string}`}>
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
            <Link className="btn-ghost" href="/submit">
              SUBMIT AN ARTICLE
            </Link>
          </div>
        </section>
      )}

      {/* ── Featured Coverage ──────────────────────────────── */}
      {leadDoc && (
        <section className="coverage">
          <div className="coverage-head">
            <div>
              <p className="eyebrow">FEATURED COVERAGE</p>
              <h2 className="section-title">{getCategory(leadDoc)?.name ?? 'Latest'}</h2>
            </div>
            {getCategory(leadDoc) && (
              <Link className="view-all" href={`/${getCategory(leadDoc)!.slug}`}>
                VIEW ALL
              </Link>
            )}
          </div>

          <div className="coverage-grid">
            <article className="lead-story">
              <Link className="lead-media" href={`/articles/${leadDoc.slug as string}`}>
                <span className="cat-pill">
                  {(getCategory(leadDoc)?.name ?? 'ARTICLE').toUpperCase()}
                </span>
                {getImageUrl(leadDoc) && (
                  <Image
                    src={getImageUrl(leadDoc) as string}
                    alt={leadDoc.title as string}
                    fill
                    sizes="(max-width: 1024px) 100vw, 55vw"
                    style={{ objectFit: 'cover' }}
                  />
                )}
              </Link>
              <h3 className="lead-title">{leadDoc.title as string}</h3>
              {leadDoc.dek && <p className="lead-dek">{truncate(leadDoc.dek as string, 180)}</p>}
              <div className="byline">
                <span
                  className="avatar"
                  style={
                    leadDoc.authorAvatarUrl
                      ? { backgroundImage: `url(${leadDoc.authorAvatarUrl as string})` }
                      : {}
                  }
                />
                <div>
                  <p className="author">{leadDoc.authorName as string}</p>
                  {leadDoc.publishedAt && (
                    <p className="date">
                      {formatDate(leadDoc.publishedAt as string).toUpperCase()}
                    </p>
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

      {/* ── Sponsor Band ──────────────────────────────────── */}
      {effectiveSponsor.enabled !== false && (
        <section className="sponsor" aria-hidden="true">
          {sponsorImageUrl && (
            <Image
              className="sponsor-img"
              src={sponsorImageUrl}
              alt=""
              width={1800}
              height={380}
              style={{ objectFit: 'cover' }}
            />
          )}
          <div className="sponsor-tint" />
          <div className="sponsor-inner">
            {effectiveSponsor.eyebrow && (
              <p className="eyebrow eyebrow--light">{effectiveSponsor.eyebrow}</p>
            )}
            <p className="sponsor-brand">{effectiveSponsor.brand}</p>
            {effectiveSponsor.tagline && <p className="sponsor-tag">{effectiveSponsor.tagline}</p>}
            {effectiveSponsor.linkUrl && (
              <a
                href={effectiveSponsor.linkUrl}
                className="btn-ghost btn-ghost--light"
                target="_blank"
                rel="noopener noreferrer"
              >
                {effectiveSponsor.linkLabel ?? 'EXPLORE'}
              </a>
            )}
          </div>
        </section>
      )}

      {/* ── Featured Stories ───────────────────────────────── */}
      <section className="featured">
        <header className="featured-head">
          <p className="eyebrow">CURATED SELECTION</p>
          <h2 className="display center">Featured Stories</h2>
        </header>

        {featuredStories.length > 0 && (
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
        )}
      </section>

      {/* ── Editor&apos;s Pick (dark section) ─────────────────── */}
      {pickDoc && (
        <section className="editor-pick">
          <div className="editor-grid">
            <div className="editor-text">
              <p className="eyebrow eyebrow--light">EDITOR&apos;S PICK</p>
              <h2 className="display display--light">{pickDoc.title as string}</h2>
              {pickDoc.dek && <p className="editor-dek">{truncate(pickDoc.dek as string, 260)}</p>}
              <Link className="btn-outline" href={`/articles/${pickDoc.slug as string}`}>
                DISCOVER MORE
              </Link>
              <hr className="rule rule--light" />
              <div className="byline byline--light">
                <span
                  className="avatar avatar--dark"
                  style={
                    pickDoc.authorAvatarUrl
                      ? { backgroundImage: `url(${pickDoc.authorAvatarUrl as string})` }
                      : {}
                  }
                />
                <div>
                  <p className="author">{pickDoc.authorName as string}</p>
                  <p className="date date--muted">{getCategory(pickDoc)?.name ?? 'Contributor'}</p>
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
          <Link className="view-all" href="/leaders">
            VIEW ALL
          </Link>
        </div>
        <hr className="section-rule" />

        {latestArticles.length > 0 && (
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
            Receive curated insights on tech, culture, and refined living. Delivered weekly to the
            most discerning readers.
          </p>
          <NewsletterForm />
          <p className="newsletter-fineprint">
            By subscribing, you agree to our <Link href="/privacy">Privacy Policy</Link> and consent
            to receive updates.
          </p>
        </div>
      </section>
    </>
  )
}
