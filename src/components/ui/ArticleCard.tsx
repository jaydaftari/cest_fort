import Link from 'next/link'
import Image from 'next/image'
import { formatDateShort, truncate } from '@/lib/utils'
import { createLogger } from '@/lib/logger'

const logger = createLogger('ArticleCard')

type MediaFile = {
  url?: string
  alt?: string
  sizes?: {
    card?: { url?: string }
    thumbnail?: { url?: string }
  }
}

type ArticleCardProps = {
  id: string | number
  slug: string
  title: string
  dek?: string | null
  authorName: string
  authorAvatarUrl?: string | null
  publishedAt?: string | null
  readTime?: number | null
  // views?: number | null // TODO: enable when view tracking is deployed
  heroImage?: MediaFile | null
  heroImageUrl?: string | null
  category?: { name: string; slug: string } | null
}

// TODO: enable when view tracking is deployed
// function formatViews(n: number): string {
//   if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M'
//   if (n >= 10_000) return Math.round(n / 1000) + 'K'
//   if (n >= 1_000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K'
//   return String(n)
// }

// ── Story Card — 1:1 square image, used in Featured Stories 4-col grid ──────
export function StoryCard({
  slug,
  title,
  dek,
  authorName,
  publishedAt,
  heroImage,
  heroImageUrl,
  category,
}: ArticleCardProps) {
  logger.debug('Rendering StoryCard', { slug })

  const imageUrl = heroImage?.sizes?.card?.url ?? heroImage?.url ?? heroImageUrl
  const imageAlt = heroImage?.alt ?? title

  return (
    <article className="story-card">
      <Link href={`/articles/${slug}`} className="card-media">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={imageAlt}
            width={800}
            height={800}
            style={{ objectFit: 'cover', width: '100%', height: '100%' }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', background: '#e9e7e3' }} />
        )}
      </Link>

      {category && <p className="eyebrow">{category.name.toUpperCase()}</p>}

      <h3>
        <Link href={`/articles/${slug}`} style={{ color: 'inherit' }}>
          {title}
        </Link>
      </h3>

      {dek && <p className="card-dek">{truncate(dek, 120)}</p>}

      <p className="byline-small">
        <span>{authorName}</span>
        {publishedAt && (
          <>
            {' '}
            · <span>{formatDateShort(publishedAt)}</span>
          </>
        )}
      </p>
    </article>
  )
}

// ── Latest Card — 4:5 portrait image, used in Latest Articles 5-col grid ────
export function LatestCard({
  slug,
  title,
  dek,
  authorName,
  publishedAt,
  heroImage,
  heroImageUrl,
  category,
}: ArticleCardProps) {
  logger.debug('Rendering LatestCard', { slug })

  const imageUrl = heroImage?.sizes?.card?.url ?? heroImage?.url ?? heroImageUrl
  const imageAlt = heroImage?.alt ?? title

  return (
    <article className="latest-card">
      <Link href={`/articles/${slug}`} className="card-media">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={imageAlt}
            width={700}
            height={875}
            style={{ objectFit: 'cover', width: '100%', height: '100%' }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', background: '#e9e7e3' }} />
        )}
      </Link>

      {category && <p className="eyebrow">{category.name.toUpperCase()}</p>}

      <h4>
        <Link href={`/articles/${slug}`} style={{ color: 'inherit' }}>
          {title}
        </Link>
      </h4>

      {dek && <p className="card-dek">{truncate(dek, 90)}</p>}

      <p className="byline-small">
        <span>{authorName}</span>
        {publishedAt && (
          <>
            {' '}
            · <span>{formatDateShort(publishedAt)}</span>
          </>
        )}
      </p>
    </article>
  )
}

// ── Rail Item — text-only, used in Coverage sidebar rail ────────────────────
export function RailItem({ slug, title, dek, publishedAt, category }: ArticleCardProps) {
  logger.debug('Rendering RailItem', { slug })

  return (
    <Link className="rail-item" href={`/articles/${slug}`}>
      {category && <p className="eyebrow">{category.name.toUpperCase()}</p>}
      <h4>{title}</h4>
      {dek && <p className="rail-dek">{truncate(dek, 100)}</p>}
      {publishedAt && <p className="date">{formatDateShort(publishedAt)}</p>}
    </Link>
  )
}

// ── Related Card — 4:3 image, used in article page bottom grid ───────────────
export function RelatedCard({
  slug,
  title,
  authorName,
  publishedAt,
  heroImage,
  heroImageUrl,
  category,
}: ArticleCardProps) {
  logger.debug('Rendering RelatedCard', { slug })

  const imageUrl = heroImage?.sizes?.thumbnail?.url ?? heroImage?.url ?? heroImageUrl
  const imageAlt = heroImage?.alt ?? title

  return (
    <Link className="related-card" href={`/articles/${slug}`}>
      <div className="thumb">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={imageAlt}
            width={400}
            height={300}
            style={{ objectFit: 'cover', width: '100%', height: '100%' }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', background: '#e9e7e3' }} />
        )}
      </div>

      {category && <p className="eyebrow">{category.name.toUpperCase()}</p>}
      <h4>{title}</h4>

      <p className="small-meta">
        {authorName}
        {publishedAt && ` · ${formatDateShort(publishedAt)}`}
      </p>
    </Link>
  )
}

// ── Feed Item — Medium-style row, used in Leaders feed ───────────────────────
export function FeedItem({
  slug,
  title,
  dek,
  authorName,
  authorAvatarUrl,
  publishedAt,
  readTime,
  // views, // TODO: enable when view tracking is deployed
  heroImage,
  heroImageUrl,
  category,
}: ArticleCardProps) {
  logger.debug('Rendering FeedItem', { slug })

  const imageUrl = heroImage?.sizes?.thumbnail?.url ?? heroImage?.url ?? heroImageUrl
  const imageAlt = heroImage?.alt ?? title
  const firstLetter = title[0]?.toUpperCase() ?? 'A'

  return (
    <Link className="feed-item" href={`/articles/${slug}`}>
      <div>
        <div className="feed-author">
          <span
            className="author-dot"
            style={authorAvatarUrl ? { backgroundImage: `url(${authorAvatarUrl})` } : {}}
          />
          <span className="author-name">{authorName}</span>
          {category && <span className="author-meta">&nbsp;in&nbsp;{category.name}</span>}
        </div>

        <p className="feed-title">{title}</p>

        {dek && <p className="feed-dek">{dek}</p>}

        <div className="feed-meta">
          {publishedAt && <span>{formatDateShort(publishedAt)}</span>}
          {readTime && (
            <>
              <span className="dot" />
              <span className="read">{readTime} min read</span>
            </>
          )}
          {/* TODO: enable when view tracking is deployed */}
          {/* {views != null && (
            <>
              <span className="dot" />
              <span className="read">{formatViews(views)} views</span>
            </>
          )} */}
        </div>
      </div>

      <div className={`feed-thumb${imageUrl ? '' : ' feed-thumb--letter'}`}>
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={imageAlt}
            width={180}
            height={135}
            style={{ objectFit: 'cover', width: '100%', height: '100%' }}
          />
        ) : (
          <span aria-hidden="true">{firstLetter}</span>
        )}
      </div>
    </Link>
  )
}
