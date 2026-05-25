import Link from 'next/link'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { createLogger } from '@/lib/logger'

const logger = createLogger('AdminDashboard')

// ── helpers ──────────────────────────────────────────────────────────────────

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { label: string; bg: string; color: string; border: string }> = {
    approved: {
      label: 'Published',
      bg: 'rgba(184,144,46,0.1)',
      color: '#7a5c14',
      border: 'rgba(184,144,46,0.28)',
    },
    submitted: {
      label: 'Submitted',
      bg: 'rgba(13,11,9,0.06)',
      color: '#5c5750',
      border: '#ddd8ce',
    },
    in_review: {
      label: 'In Review',
      bg: 'rgba(26,58,92,0.08)',
      color: '#1a3a5c',
      border: 'rgba(26,58,92,0.2)',
    },
    draft: { label: 'Draft', bg: 'rgba(13,11,9,0.04)', color: '#8c8778', border: '#eae6de' },
    rejected: {
      label: 'Rejected',
      bg: 'rgba(180,28,28,0.07)',
      color: '#b41c1c',
      border: 'rgba(180,28,28,0.2)',
    },
  }
  const s = map[status] ?? map.draft
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '3px 9px',
        background: s.bg,
        color: s.color,
        border: `1px solid ${s.border}`,
        borderRadius: 2,
        fontSize: 8.5,
        fontWeight: 700,
        letterSpacing: '0.16em',
        textTransform: 'uppercase' as const,
        whiteSpace: 'nowrap' as const,
      }}
    >
      {s.label}
    </span>
  )
}

function CategoryBadge({ name }: { name?: string }) {
  if (!name) return null
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 7px',
        background: 'transparent',
        border: '1px solid #eae6de',
        borderRadius: 2,
        fontSize: 8,
        fontWeight: 700,
        letterSpacing: '0.18em',
        textTransform: 'uppercase' as const,
        color: '#8c8778',
      }}
    >
      {name}
    </span>
  )
}

// ── component ─────────────────────────────────────────────────────────────────

export default async function Dashboard() {
  let stats = { total: 0, submitted: 0, inReview: 0, approved: 0, rejected: 0, draft: 0 }
  let subscribers = 0
  type RecentArticle = {
    id: string | number
    title?: string | null
    authorName?: string | null
    workflowStatus?: string | null
    publishedAt?: string | null
    updatedAt?: string | null
    category?: { name?: string } | null
  }
  let recentArticles: RecentArticle[] = []

  try {
    const payload = await getPayload({ config: configPromise })

    const [all, submitted, inReview, approved, rejected, draft, subs, recent] = await Promise.all([
      payload.find({ collection: 'articles', limit: 0, overrideAccess: true }),
      payload.find({
        collection: 'articles',
        where: { workflowStatus: { equals: 'submitted' } },
        limit: 0,
        overrideAccess: true,
      }),
      payload.find({
        collection: 'articles',
        where: { workflowStatus: { equals: 'in_review' } },
        limit: 0,
        overrideAccess: true,
      }),
      payload.find({
        collection: 'articles',
        where: { workflowStatus: { equals: 'approved' } },
        limit: 0,
        overrideAccess: true,
      }),
      payload.find({
        collection: 'articles',
        where: { workflowStatus: { equals: 'rejected' } },
        limit: 0,
        overrideAccess: true,
      }),
      payload.find({
        collection: 'articles',
        where: { workflowStatus: { equals: 'draft' } },
        limit: 0,
        overrideAccess: true,
      }),
      payload.find({
        collection: 'subscribers',
        where: { active: { equals: true } },
        limit: 0,
        overrideAccess: true,
      }),
      payload.find({
        collection: 'articles',
        limit: 6,
        sort: '-updatedAt',
        depth: 1,
        overrideAccess: true,
      }),
    ])

    stats = {
      total: all.totalDocs,
      submitted: submitted.totalDocs,
      inReview: inReview.totalDocs,
      approved: approved.totalDocs,
      rejected: rejected.totalDocs,
      draft: draft.totalDocs,
    }
    subscribers = subs.totalDocs
    recentArticles = recent.docs as RecentArticle[]

    logger.debug('Dashboard stats loaded', { ...stats, subscribers })
  } catch (err) {
    logger.warn('Could not load dashboard stats', { error: String(err) })
  }

  // Pipeline progress (approved of total)
  const publishedPct = stats.total ? Math.round((stats.approved / stats.total) * 100) : 0
  const reviewPct = stats.total ? Math.round((stats.inReview / stats.total) * 100) : 0
  const submittedPct = stats.total ? Math.round((stats.submitted / stats.total) * 100) : 0
  const draftPct = stats.total ? Math.round((stats.draft / stats.total) * 100) : 0

  const today = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const statCards = [
    { label: 'Published', value: stats.approved, accent: '#b8902e', sub: 'articles live' },
    {
      label: 'Awaiting Review',
      value: stats.submitted,
      accent: '#7a5c14',
      sub: 'pending editorial',
    },
    { label: 'In Review', value: stats.inReview, accent: '#1a3a5c', sub: 'under assessment' },
    { label: 'Subscribers', value: subscribers, accent: '#4a1a5c', sub: 'active readers' },
  ]

  const actionCards = [
    {
      label: 'New Article',
      href: '/admin/collections/articles/create',
      icon: '✦',
      desc: 'Submit a new piece for editorial review',
    },
    {
      label: 'Editorial Review',
      href: '/editorial',
      icon: '◈',
      desc: 'Review and approve pending submissions',
    },
    {
      label: 'View Site',
      href: '/',
      icon: '◎',
      desc: 'Open the live magazine in a new tab',
      external: true,
    },
    {
      label: 'Subscribers',
      href: '/admin/collections/subscribers',
      icon: '◇',
      desc: 'Manage newsletter reader list',
    },
  ]

  return (
    <div
      style={{
        fontFamily: "'Syne', system-ui, sans-serif",
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale' as const,
        background: '#f7f4ee',
        minHeight: '100%',
      }}
    >
      {/* ── Masthead ────────────────────────────────────────────────── */}
      <div
        style={{
          background: '#0d0b09',
          padding: '56px 48px 48px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* top gold rule */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 2,
            background: 'linear-gradient(90deg, #b8902e 0%, #d4aa50 45%, transparent 100%)',
          }}
        />

        {/* watermark */}
        <div
          style={{
            position: 'absolute',
            right: -20,
            bottom: -30,
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 200,
            fontWeight: 700,
            letterSpacing: '-0.04em',
            color: 'rgba(255,255,255,0.025)',
            lineHeight: 1,
            userSelect: 'none',
            pointerEvents: 'none',
          }}
        >
          CF
        </div>

        <p
          style={{
            fontSize: 8.5,
            fontWeight: 700,
            letterSpacing: '0.32em',
            textTransform: 'uppercase',
            color: 'rgba(255,253,248,0.3)',
            marginBottom: 20,
          }}
        >
          Editorial Studio · Paris
        </p>

        <h1
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 88,
            fontWeight: 300,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: '#fffdf8',
            lineHeight: 0.9,
            margin: 0,
          }}
        >
          C&apos;est Fort
        </h1>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '20px 0 18px' }}>
          <div style={{ height: 1, width: 40, background: '#b8902e' }} />
          <p
            style={{
              fontSize: 9,
              fontWeight: 600,
              letterSpacing: '0.28em',
              textTransform: 'uppercase',
              color: 'rgba(255,253,248,0.35)',
              margin: 0,
            }}
          >
            la rédaction
          </p>
          <div style={{ height: 1, flex: 1, background: 'rgba(255,255,255,0.07)' }} />
        </div>

        <p
          style={{
            fontSize: 11.5,
            color: 'rgba(255,253,248,0.38)',
            fontWeight: 400,
            letterSpacing: '0.06em',
            marginBottom: 0,
          }}
        >
          Content Management System · {today}
        </p>
      </div>

      {/* ── Stat Cards ──────────────────────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 1,
          background: '#ddd8ce',
          margin: 0,
          borderBottom: '1px solid #ddd8ce',
        }}
      >
        {statCards.map(({ label, value, accent, sub }) => (
          <div
            key={label}
            style={{
              background: '#fffdf8',
              padding: '28px 28px 24px',
              borderTop: `3px solid ${accent}`,
            }}
          >
            <p
              style={{
                fontSize: 8,
                fontWeight: 700,
                letterSpacing: '0.24em',
                textTransform: 'uppercase',
                color: '#8c8778',
                marginBottom: 14,
              }}
            >
              {label}
            </p>
            <p
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: 52,
                fontWeight: 400,
                color: '#0d0b09',
                lineHeight: 1,
                marginBottom: 8,
              }}
            >
              {value}
            </p>
            <p
              style={{
                fontSize: 9.5,
                color: '#aaa49a',
                fontWeight: 500,
                letterSpacing: '0.04em',
              }}
            >
              {sub}
            </p>
          </div>
        ))}
      </div>

      {/* ── Pipeline progress ──────────────────────────────────────── */}
      {stats.total > 0 && (
        <div
          style={{
            background: '#fffdf8',
            borderBottom: '1px solid #eae6de',
            padding: '20px 48px',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 10,
            }}
          >
            <p
              style={{
                fontSize: 8,
                fontWeight: 700,
                letterSpacing: '0.24em',
                textTransform: 'uppercase',
                color: '#8c8778',
                margin: 0,
              }}
            >
              Editorial Pipeline — {stats.total} articles total
            </p>
            <p
              style={{
                fontSize: 10,
                color: '#b8902e',
                fontWeight: 700,
                letterSpacing: '0.04em',
                margin: 0,
              }}
            >
              {publishedPct}% published
            </p>
          </div>
          <div
            style={{
              height: 5,
              background: '#f0ebe2',
              borderRadius: 3,
              overflow: 'hidden',
              display: 'flex',
            }}
          >
            <div
              style={{ width: `${publishedPct}%`, background: '#b8902e', transition: 'width 0.4s' }}
            />
            <div
              style={{ width: `${reviewPct}%`, background: '#1a3a5c', transition: 'width 0.4s' }}
            />
            <div
              style={{ width: `${submittedPct}%`, background: '#7a5c14', transition: 'width 0.4s' }}
            />
            <div
              style={{ width: `${draftPct}%`, background: '#ddd8ce', transition: 'width 0.4s' }}
            />
          </div>
          <div style={{ display: 'flex', gap: 20, marginTop: 10 }}>
            {[
              { label: 'Published', color: '#b8902e', val: stats.approved },
              { label: 'In Review', color: '#1a3a5c', val: stats.inReview },
              { label: 'Submitted', color: '#7a5c14', val: stats.submitted },
              { label: 'Draft', color: '#ddd8ce', val: stats.draft, textColor: '#8c8778' },
            ].map(({ label, color, val, textColor }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: color }} />
                <span
                  style={{
                    fontSize: 9,
                    color: textColor ?? '#5c5750',
                    fontWeight: 600,
                    letterSpacing: '0.04em',
                  }}
                >
                  {label} · {val}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Action Cards ────────────────────────────────────────────── */}
      <div style={{ padding: '36px 48px 0' }}>
        <p
          style={{
            fontSize: 8,
            fontWeight: 700,
            letterSpacing: '0.28em',
            textTransform: 'uppercase',
            color: '#8c8778',
            marginBottom: 16,
          }}
        >
          Quick Actions
        </p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 12,
            marginBottom: 40,
          }}
        >
          {actionCards.map(({ label, href, icon, desc, external }) => (
            <a
              key={href}
              href={href}
              target={external ? '_blank' : undefined}
              rel={external ? 'noopener noreferrer' : undefined}
              className="dash-action-card"
              style={{
                display: 'block',
                padding: '20px 20px 18px',
                background: '#fffdf8',
                border: '1px solid #eae6de',
                borderRadius: 3,
                textDecoration: 'none',
              }}
            >
              <p
                style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: 24,
                  color: '#b8902e',
                  marginBottom: 10,
                  lineHeight: 1,
                }}
              >
                {icon}
              </p>
              <p
                style={{
                  fontSize: 10.5,
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: '#0d0b09',
                  marginBottom: 6,
                }}
              >
                {label}
              </p>
              <p
                style={{
                  fontSize: 11,
                  color: '#8c8778',
                  fontWeight: 400,
                  lineHeight: 1.5,
                }}
              >
                {desc}
              </p>
            </a>
          ))}
        </div>
      </div>

      {/* ── Recent Articles + Quick Links row ─────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 280px',
          gap: 24,
          padding: '0 48px 48px',
        }}
      >
        {/* Recent articles */}
        <div
          style={{
            background: '#fffdf8',
            border: '1px solid #eae6de',
            borderRadius: 3,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px 24px',
              borderBottom: '1px solid #eae6de',
              background: '#faf7f2',
            }}
          >
            <p
              style={{
                fontSize: 8,
                fontWeight: 700,
                letterSpacing: '0.24em',
                textTransform: 'uppercase',
                color: '#8c8778',
                margin: 0,
              }}
            >
              Recent Activity
            </p>
            <Link
              href="/admin/collections/articles"
              style={{
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: '#b8902e',
                textDecoration: 'none',
              }}
            >
              View All →
            </Link>
          </div>

          {recentArticles.length === 0 ? (
            <div style={{ padding: '32px 24px', textAlign: 'center' }}>
              <p
                style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: 20,
                  color: '#bdb8ae',
                  fontStyle: 'italic',
                }}
              >
                No articles yet.
              </p>
              <Link
                href="/admin/collections/articles/create"
                style={{
                  display: 'inline-block',
                  marginTop: 12,
                  padding: '8px 16px',
                  background: '#0d0b09',
                  color: '#fffdf8',
                  fontSize: 9.5,
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  textDecoration: 'none',
                  borderRadius: 2,
                }}
              >
                Create the First
              </Link>
            </div>
          ) : (
            <div>
              {recentArticles.map((article, i) => {
                const cat = article.category
                const catName = typeof cat === 'object' && cat ? (cat.name ?? undefined) : undefined
                const date = article.updatedAt
                  ? new Date(article.updatedAt).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                    })
                  : null
                return (
                  <a
                    key={String(article.id)}
                    href={`/admin/collections/articles/${article.id}`}
                    className="dash-article-row"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 16,
                      padding: '14px 24px',
                      borderBottom: i < recentArticles.length - 1 ? '1px solid #f0ebe4' : 'none',
                      textDecoration: 'none',
                    }}
                  >
                    {/* index number */}
                    <span
                      style={{
                        fontFamily: "'Cormorant Garamond', Georgia, serif",
                        fontSize: 18,
                        color: '#ddd8ce',
                        fontWeight: 400,
                        minWidth: 24,
                        lineHeight: 1,
                      }}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>

                    {/* content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: '#0d0b09',
                          margin: '0 0 5px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {article.title ?? 'Untitled'}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {catName && <CategoryBadge name={catName} />}
                        <span style={{ fontSize: 10.5, color: '#aaa49a', fontWeight: 400 }}>
                          {article.authorName ?? '—'}
                        </span>
                      </div>
                    </div>

                    {/* right: status + date */}
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column' as const,
                        alignItems: 'flex-end',
                        gap: 5,
                        flexShrink: 0,
                      }}
                    >
                      <StatusPill status={article.workflowStatus ?? 'draft'} />
                      {date && (
                        <span
                          style={{
                            fontSize: 9.5,
                            color: '#bdb8ae',
                            fontWeight: 500,
                            letterSpacing: '0.02em',
                          }}
                        >
                          {date}
                        </span>
                      )}
                    </div>
                  </a>
                )
              })}
            </div>
          )}
        </div>

        {/* Right column: quick links */}
        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 16 }}>
          {/* Collections */}
          <div
            style={{
              background: '#fffdf8',
              border: '1px solid #eae6de',
              borderRadius: 3,
              overflow: 'hidden',
            }}
          >
            <p
              style={{
                fontSize: 8,
                fontWeight: 700,
                letterSpacing: '0.24em',
                textTransform: 'uppercase',
                color: '#8c8778',
                padding: '14px 20px 12px',
                borderBottom: '1px solid #eae6de',
                background: '#faf7f2',
                margin: 0,
              }}
            >
              Collections
            </p>
            {[
              { label: 'All Articles', href: '/admin/collections/articles', count: stats.total },
              { label: 'Categories', href: '/admin/collections/categories', count: null },
              { label: 'Media Library', href: '/admin/collections/media', count: null },
              { label: 'Subscribers', href: '/admin/collections/subscribers', count: subscribers },
            ].map(({ label, href, count }) => (
              <a
                key={href}
                href={href}
                className="dash-quick-link"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '11px 20px',
                  borderBottom: '1px solid #f5f1ea',
                  textDecoration: 'none',
                }}
              >
                <span
                  style={{
                    fontSize: 11.5,
                    fontWeight: 600,
                    color: '#0d0b09',
                    letterSpacing: '0.02em',
                  }}
                >
                  {label}
                </span>
                {count !== null && (
                  <span
                    style={{
                      fontSize: 11,
                      color: '#8c8778',
                      fontWeight: 500,
                      fontFamily: "'Cormorant Garamond', Georgia, serif",
                    }}
                  >
                    {count}
                  </span>
                )}
              </a>
            ))}
          </div>

          {/* Editorial tool */}
          <Link
            href="/editorial"
            style={{
              display: 'block',
              padding: '18px 20px',
              background: '#0d0b09',
              borderRadius: 3,
              textDecoration: 'none',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 2,
                background: 'linear-gradient(90deg, #b8902e, #d4aa50)',
              }}
            />
            <p
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.24em',
                textTransform: 'uppercase',
                color: '#b8902e',
                marginBottom: 8,
              }}
            >
              Editorial Panel
            </p>
            <p
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: 20,
                fontWeight: 300,
                color: '#fffdf8',
                lineHeight: 1.2,
                marginBottom: 10,
              }}
            >
              Review & place stories for publication
            </p>
            <p
              style={{
                fontSize: 9.5,
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'rgba(255,253,248,0.45)',
              }}
            >
              Open Dashboard →
            </p>
          </Link>

          {/* Workflow legend */}
          <div
            style={{
              background: '#fffdf8',
              border: '1px solid #eae6de',
              borderRadius: 3,
              padding: '16px 20px',
            }}
          >
            <p
              style={{
                fontSize: 8,
                fontWeight: 700,
                letterSpacing: '0.24em',
                textTransform: 'uppercase',
                color: '#8c8778',
                marginBottom: 14,
              }}
            >
              Workflow
            </p>
            {[
              { label: 'Draft', count: stats.draft, color: '#ddd8ce', textColor: '#8c8778' },
              {
                label: 'Submitted',
                count: stats.submitted,
                color: '#7a5c14',
                textColor: '#7a5c14',
              },
              { label: 'In Review', count: stats.inReview, color: '#1a3a5c', textColor: '#1a3a5c' },
              { label: 'Published', count: stats.approved, color: '#b8902e', textColor: '#b8902e' },
              { label: 'Rejected', count: stats.rejected, color: '#b41c1c', textColor: '#b41c1c' },
            ].map(({ label, count, color, textColor }) => (
              <div
                key={label}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 9,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 6, height: 6, borderRadius: 1, background: color }} />
                  <span style={{ fontSize: 10.5, color: '#5c5750', fontWeight: 500 }}>{label}</span>
                </div>
                <span
                  style={{
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontSize: 16,
                    color: textColor,
                    fontWeight: 400,
                  }}
                >
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
