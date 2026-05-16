import { redirect } from 'next/navigation'
import Link from 'next/link'
import { headers } from 'next/headers'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { createLogger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

const logger = createLogger('Page:Editorial')

type WorkflowStatus = 'submitted' | 'in_review' | 'approved' | 'rejected'

const STATUS_META: Record<WorkflowStatus, { label: string; bg: string; color: string; dot: string }> = {
  submitted:  { label: 'Submitted',  bg: '#EFF6FF', color: '#1E40AF', dot: '#3B82F6' },
  in_review:  { label: 'In Review',  bg: '#FFFBEB', color: '#92400E', dot: '#D97706' },
  approved:   { label: 'Approved',   bg: '#F0FDF4', color: '#14532D', dot: '#16A34A' },
  rejected:   { label: 'Rejected',   bg: '#FEF2F2', color: '#7F1D1D', dot: '#DC2626' },
}

function StatusBadge({ status }: { status: WorkflowStatus }) {
  const m = STATUS_META[status] ?? STATUS_META.submitted
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 10px 3px 8px',
      background: m.bg, color: m.color,
      borderRadius: 2,
      fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase',
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: m.dot, flexShrink: 0 }} />
      {m.label}
    </span>
  )
}

function formatDate(iso: string | null | undefined) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

type PageProps = {
  searchParams: Promise<{ status?: string }>
}

export default async function EditorialPage({ searchParams }: PageProps) {
  const { status: filterParam } = await searchParams

  const headersList = await headers()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers: headersList })
  if (!user) redirect('/editorial/login')

  const activeFilter = (['submitted', 'in_review', 'approved', 'rejected'] as const).includes(
    filterParam as WorkflowStatus
  )
    ? (filterParam as WorkflowStatus)
    : null

  logger.info('Rendering editorial dashboard', { filter: activeFilter, editor: user.email })

  // Fetch counts for each status
  const [submittedRes, inReviewRes, approvedRes, rejectedRes] = await Promise.all([
    payload.find({ collection: 'articles', where: { workflowStatus: { equals: 'submitted' } }, limit: 0, overrideAccess: true }),
    payload.find({ collection: 'articles', where: { workflowStatus: { equals: 'in_review' } }, limit: 0, overrideAccess: true }),
    payload.find({ collection: 'articles', where: { workflowStatus: { equals: 'approved' } }, limit: 0, overrideAccess: true }),
    payload.find({ collection: 'articles', where: { workflowStatus: { equals: 'rejected' } }, limit: 0, overrideAccess: true }),
  ])

  const counts = {
    submitted:  submittedRes.totalDocs,
    in_review:  inReviewRes.totalDocs,
    approved:   approvedRes.totalDocs,
    rejected:   rejectedRes.totalDocs,
    total:      submittedRes.totalDocs + inReviewRes.totalDocs + approvedRes.totalDocs + rejectedRes.totalDocs,
  }

  // Fetch article list
  const articlesRes = await payload.find({
    collection: 'articles',
    ...(activeFilter ? { where: { workflowStatus: { equals: activeFilter } } } : {}),
    limit: 50,
    sort: '-submittedAt',
    depth: 1,
    overrideAccess: true,
  })

  const articles = articlesRes.docs

  return (
    <main style={{ padding: '40px 32px 80px', maxWidth: 1100, margin: '0 auto' }}>

      {/* ── Page header ── */}
      <div style={{ marginBottom: 40 }}>
        <h1 style={{
          fontFamily: "'Bodoni Moda', Georgia, serif",
          fontSize: 36, fontWeight: 500, letterSpacing: '0.02em',
          color: '#000', margin: 0, marginBottom: 8,
        }}>
          Submissions
        </h1>
        <p style={{ fontSize: 14, color: '#5d5f5f', margin: 0 }}>
          Review and action contributor article submissions.
        </p>
      </div>

      {/* ── Stats strip ── */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16,
        marginBottom: 40,
      }}>
        {(
          [
            { key: 'submitted' as const, label: 'Submitted' },
            { key: 'in_review' as const, label: 'In Review' },
            { key: 'approved' as const, label: 'Approved' },
            { key: 'rejected' as const, label: 'Rejected' },
          ] as const
        ).map(({ key, label }) => {
          const m = STATUS_META[key]
          return (
            <Link key={key} href={`/editorial?status=${key}`} style={{ textDecoration: 'none' }}>
              <div style={{
                background: '#fff',
                borderTop: `3px solid ${m.dot}`,
                borderRight: `1px solid ${activeFilter === key ? m.dot : '#cfc4c5'}`,
                borderBottom: `1px solid ${activeFilter === key ? m.dot : '#cfc4c5'}`,
                borderLeft: `1px solid ${activeFilter === key ? m.dot : '#cfc4c5'}`,
                borderRadius: 4,
                padding: '20px 24px',
                cursor: 'pointer',
                transition: 'border-color 0.15s',
              }}>
                <div style={{
                  fontSize: 32, fontWeight: 700,
                  fontFamily: "'Bodoni Moda', Georgia, serif",
                  color: m.color, lineHeight: 1, marginBottom: 6,
                }}>
                  {counts[key]}
                </div>
                <div style={{
                  fontSize: 10, fontWeight: 700, letterSpacing: '0.18em',
                  textTransform: 'uppercase', color: '#5d5f5f',
                }}>
                  {label}
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* ── Filter tabs ── */}
      <div style={{
        display: 'flex', gap: 0, borderBottom: '1px solid #cfc4c5',
        marginBottom: 0,
      }}>
        {([
          { key: null, label: `All (${counts.total})` },
          { key: 'submitted' as const, label: `Submitted (${counts.submitted})` },
          { key: 'in_review' as const, label: `In Review (${counts.in_review})` },
          { key: 'approved' as const, label: `Approved (${counts.approved})` },
          { key: 'rejected' as const, label: `Rejected (${counts.rejected})` },
        ]).map(({ key, label }) => {
          const active = key === activeFilter
          return (
            <Link
              key={String(key)}
              href={key ? `/editorial?status=${key}` : '/editorial'}
              style={{
                display: 'block',
                padding: '11px 20px',
                fontSize: 11, fontWeight: 600,
                letterSpacing: '0.13em', textTransform: 'uppercase',
                textDecoration: 'none',
                color: active ? '#000' : '#5d5f5f',
                borderBottom: active ? '2px solid #000' : '2px solid transparent',
                marginBottom: -1,
                transition: 'color 0.15s',
                whiteSpace: 'nowrap',
              }}
            >
              {label}
            </Link>
          )
        })}
      </div>

      {/* ── Article list ── */}
      {articles.length === 0 ? (
        <div style={{
          background: '#fff',
          borderRight: '1px solid #cfc4c5', borderBottom: '1px solid #cfc4c5', borderLeft: '1px solid #cfc4c5',
          padding: '64px 32px', textAlign: 'center',
        }}>
          <p style={{ fontSize: 14, color: '#5d5f5f', margin: 0 }}>
            No {activeFilter ? STATUS_META[activeFilter].label.toLowerCase() : ''} submissions yet.
          </p>
        </div>
      ) : (
        <div style={{ background: '#fff', borderRight: '1px solid #cfc4c5', borderBottom: '1px solid #cfc4c5', borderLeft: '1px solid #cfc4c5' }}>
          {articles.map((article, i) => {
            const status = (article.workflowStatus as WorkflowStatus) ?? 'submitted'
            const m = STATUS_META[status]
            const category = article.category as { name?: string } | null
            const isLast = i === articles.length - 1

            return (
              <div
                key={String(article.id)}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '4px 1fr auto',
                  borderBottom: isLast ? 'none' : '1px solid #e8e3de',
                }}
              >
                {/* Status indicator bar */}
                <div style={{ background: m.dot, borderRadius: '0 0 0 0' }} />

                {/* Main content */}
                <div style={{ padding: '20px 24px', minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 8 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h2 style={{
                        fontFamily: "'Bodoni Moda', Georgia, serif",
                        fontSize: 18, fontWeight: 500, lineHeight: 1.3,
                        color: '#000', margin: '0 0 4px',
                        overflow: 'hidden', textOverflow: 'ellipsis',
                        display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical',
                      }}>
                        {article.title as string}
                      </h2>
                      {article.dek && (
                        <p style={{
                          fontSize: 13, color: '#5d5f5f', margin: 0, lineHeight: 1.4,
                          overflow: 'hidden', textOverflow: 'ellipsis',
                          display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical',
                        }}>
                          {article.dek as string}
                        </p>
                      )}
                    </div>
                    <StatusBadge status={status} />
                  </div>

                  <div style={{
                    display: 'flex', flexWrap: 'wrap', gap: '4px 20px',
                    fontSize: 11, color: '#5d5f5f',
                    fontWeight: 500, letterSpacing: '0.06em',
                  }}>
                    <span>
                      <span style={{ color: '#aaa', fontWeight: 400 }}>By </span>
                      {article.authorName as string}
                    </span>
                    {article.authorEmail && (
                      <span style={{ color: '#aaa' }}>{article.authorEmail as string}</span>
                    )}
                    {category?.name && (
                      <span>
                        <span style={{ color: '#aaa', fontWeight: 400 }}>Section: </span>
                        {category.name}
                      </span>
                    )}
                    <span>
                      <span style={{ color: '#aaa', fontWeight: 400 }}>Submitted: </span>
                      {formatDate(article.submittedAt as string | null)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div style={{
                  display: 'flex', alignItems: 'center',
                  padding: '0 24px', gap: 8,
                  borderLeft: '1px solid #e8e3de',
                }}>
                  <Link
                    href={`/editorial/${article.id}`}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      padding: '9px 18px',
                      background: '#000', color: '#fff',
                      fontSize: 10, fontWeight: 700, letterSpacing: '0.16em',
                      textTransform: 'uppercase', textDecoration: 'none',
                      borderRadius: 2, whiteSpace: 'nowrap',
                    }}
                  >
                    Review →
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {articlesRes.totalDocs > 50 && (
        <p style={{ marginTop: 20, fontSize: 12, color: '#5d5f5f', textAlign: 'center' }}>
          Showing first 50 of {articlesRes.totalDocs} results. Use Payload CMS for advanced filtering.
        </p>
      )}
    </main>
  )
}
