import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { headers } from 'next/headers'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { createLogger } from '@/lib/logger'
import { estimateReadTime, lexicalToPlainText, formatEditorialDateTime } from '@/lib/utils'
import { StatusBadge } from '@/components/ui/StatusBadge'
import type { WorkflowStatus } from '@/components/ui/StatusBadge'
import RichTextRenderer from '@/components/ui/RichTextRenderer'
import ReviewActions from './ReviewActions'

export const dynamic = 'force-dynamic'

const logger = createLogger('Page:EditorialReview')

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function ArticleReviewPage({ params }: PageProps) {
  const { id } = await params

  const headersList = await headers()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers: headersList })
  if (!user) redirect('/editorial/login')

  logger.info('Loading article for review', { id, editor: user.email })

  let article
  try {
    article = await payload.findByID({
      collection: 'articles',
      id: Number(id),
      depth: 2,
      overrideAccess: true,
    })
  } catch {
    notFound()
  }

  if (!article) notFound()

  const status = (article.workflowStatus as WorkflowStatus) ?? 'submitted'
  const category = article.category as { name?: string; slug?: string } | null
  const heroMedia = article.heroImage as { url?: string } | null
  const heroImageUrl = heroMedia?.url ?? (article.heroImageUrl as string | null)
  const readTime =
    (article.readTime as number | null) ?? estimateReadTime(lexicalToPlainText(article.content))

  return (
    <main style={{ padding: '32px 32px 80px', maxWidth: 1200, margin: '0 auto' }}>
      {/* ── Top bar ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          marginBottom: 36,
          paddingBottom: 24,
          borderBottom: '1px solid #cfc4c5',
        }}
      >
        <Link
          href="/editorial"
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            textDecoration: 'none',
            color: '#5d5f5f',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          ← All Submissions
        </Link>
        <span style={{ color: '#cfc4c5' }}>·</span>
        <StatusBadge status={status} />
        <div style={{ flex: 1 }} />
      </div>

      {/* ── Two-column layout ── */}
      <div
        style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 48, alignItems: 'start' }}
      >
        {/* ── Left: Article preview ── */}
        <div>
          {/* Category eyebrow */}
          {category?.name && (
            <p
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: '#5d5f5f',
                marginBottom: 14,
              }}
            >
              {category.name}
            </p>
          )}

          {/* Headline */}
          <h1
            style={{
              fontFamily: "'Bodoni Moda', Georgia, serif",
              fontSize: 'clamp(28px, 4vw, 48px)',
              fontWeight: 500,
              lineHeight: 1.15,
              color: '#000',
              marginBottom: 16,
            }}
          >
            {article.title as string}
          </h1>

          {/* Dek */}
          {article.dek && (
            <p
              style={{
                fontSize: 18,
                lineHeight: 1.55,
                color: '#3a3a3a',
                fontWeight: 300,
                marginBottom: 24,
                borderLeft: '3px solid #cfc4c5',
                paddingLeft: 16,
              }}
            >
              {article.dek as string}
            </p>
          )}

          {/* Byline */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              marginBottom: 32,
              paddingBottom: 28,
              borderBottom: '1px solid #e8e3de',
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: '#e8e3de',
                backgroundImage: article.authorAvatarUrl
                  ? `url(${article.authorAvatarUrl as string})`
                  : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                flexShrink: 0,
              }}
            />
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, margin: '0 0 2px', color: '#000' }}>
                {article.authorName as string}
              </p>
              <p style={{ fontSize: 11, color: '#5d5f5f', margin: 0 }}>
                {readTime} min read
                {article.submittedAt &&
                  ` · Submitted ${formatEditorialDateTime(article.submittedAt as string)}`}
              </p>
            </div>
          </div>

          {/* Hero image */}
          {heroImageUrl && (
            <div
              style={{
                marginBottom: 32,
                borderRadius: 3,
                overflow: 'hidden',
                border: '1px solid #e8e3de',
              }}
            >
              <Image
                src={heroImageUrl}
                alt={article.title as string}
                width={800}
                height={450}
                style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'cover' }}
              />
            </div>
          )}

          {/* Body */}
          <div
            style={{
              fontSize: 16,
              lineHeight: 1.75,
              color: '#1a1c1c',
            }}
          >
            <style>{`
              .editorial-body p { margin: 0 0 1.5em; }
              .editorial-body h2 { font-family: 'Bodoni Moda', Georgia, serif; font-size: 26px; font-weight: 500; margin: 2em 0 0.75em; }
              .editorial-body h3 { font-family: 'Bodoni Moda', Georgia, serif; font-size: 20px; font-weight: 500; margin: 1.8em 0 0.6em; }
              .editorial-body blockquote { border-left: 3px solid #cfc4c5; margin: 2em 0; padding: 4px 20px; color: #5d5f5f; font-style: italic; }
              .editorial-body ul, .editorial-body ol { padding-left: 1.5em; margin: 1em 0 1.5em; }
              .editorial-body li { margin-bottom: 0.4em; }
              .editorial-body a { color: #000; text-decoration: underline; text-underline-offset: 3px; }
              .editorial-body pre { background: #f4f1ec; border: 1px solid #e8e3de; border-radius: 3px; padding: 16px; font-size: 13px; overflow-x: auto; }
              .editorial-body code { background: #f4f1ec; padding: 1px 5px; border-radius: 2px; font-size: 13px; }
              .editorial-body img { max-width: 100%; border-radius: 3px; }
            `}</style>
            <div className="editorial-body">
              <RichTextRenderer
                content={article.content as Parameters<typeof RichTextRenderer>[0]['content']}
              />
            </div>
          </div>

          {/* Author bio card */}
          {article.authorBio && (
            <div
              style={{
                marginTop: 48,
                padding: '24px 28px',
                background: '#fff',
                border: '1px solid #cfc4c5',
                borderRadius: 3,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    background: '#e8e3de',
                    flexShrink: 0,
                    backgroundImage: article.authorAvatarUrl
                      ? `url(${article.authorAvatarUrl as string})`
                      : undefined,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                />
                <div>
                  <p style={{ fontWeight: 600, fontSize: 14, margin: '0 0 6px' }}>
                    {article.authorName as string}
                  </p>
                  <p style={{ fontSize: 13, color: '#5d5f5f', margin: 0, lineHeight: 1.6 }}>
                    {article.authorBio as string}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Right: Sidebar ── */}
        <aside style={{ position: 'sticky', top: 88 }}>
          {/* Submission details card */}
          <div
            style={{
              background: '#fff',
              border: '1px solid #cfc4c5',
              borderRadius: 3,
              padding: '24px',
              marginBottom: 16,
            }}
          >
            <h3
              style={{
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: '#aaa',
                margin: '0 0 16px',
              }}
            >
              Submission Details
            </h3>

            {(
              [
                { label: 'Author', value: article.authorName as string },
                { label: 'Email', value: article.authorEmail as string | undefined },
                { label: 'Section', value: category?.name },
                {
                  label: 'Submitted',
                  value: formatEditorialDateTime(article.submittedAt as string | null),
                },
                { label: 'Read time', value: `${readTime} min` },
                { label: 'Article ID', value: `#${article.id}` },
              ] as const
            ).map(({ label, value }) =>
              value ? (
                <div
                  key={label}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    padding: '8px 0',
                    borderBottom: '1px solid #f0ebe6',
                    gap: 12,
                  }}
                >
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      color: '#aaa',
                      flexShrink: 0,
                    }}
                  >
                    {label}
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      color: '#1a1c1c',
                      textAlign: 'right',
                      wordBreak: 'break-all',
                    }}
                  >
                    {value}
                  </span>
                </div>
              ) : null
            )}
          </div>

          {/* Review actions card */}
          <div
            style={{
              background: '#fff',
              border: '1px solid #cfc4c5',
              borderRadius: 3,
              padding: '24px',
            }}
          >
            <h3
              style={{
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: '#aaa',
                margin: '0 0 16px',
              }}
            >
              Editorial Decision
            </h3>

            <ReviewActions
              articleId={String(article.id)}
              currentStatus={status}
              currentPlacement={article.placement as string | null}
              editorialNote={article.editorialNote as string | null}
            />
          </div>
        </aside>
      </div>
    </main>
  )
}
