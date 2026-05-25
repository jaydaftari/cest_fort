import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'
import { headers } from 'next/headers'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { createLogger } from '@/lib/logger'
import { formatEditorialDate } from '@/lib/utils'
import { SLOT_BY_ID } from '@/lib/slots'
import type { SlotId } from '@/lib/slots'
import { StatusBadge, STATUS_META } from '@/components/ui/StatusBadge'
import type { WorkflowStatus } from '@/components/ui/StatusBadge'
import { Pagination } from '@/components/ui/Pagination'
import EditorialSearch from './EditorialSearch'

export const dynamic = 'force-dynamic'

const logger = createLogger('Page:Editorial')

const PER_PAGE = 10

type PageProps = {
  searchParams: Promise<{ status?: string; page?: string; q?: string }>
}

export default async function EditorialPage({ searchParams }: PageProps) {
  const { status: filterParam, page: pageParam, q: queryParam } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? '1', 10) || 1)
  const searchQuery = (queryParam ?? '').trim()

  const headersList = await headers()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers: headersList })
  if (!user) redirect('/editorial/login')

  const activeFilter = (['submitted', 'in_review', 'approved', 'rejected'] as const).includes(
    filterParam as WorkflowStatus
  )
    ? (filterParam as WorkflowStatus)
    : null

  logger.info('Rendering editorial dashboard', {
    filter: activeFilter,
    search: searchQuery,
    editor: user.email,
  })

  // Fetch counts for each status (unaffected by search — shows totals)
  const [submittedRes, inReviewRes, approvedRes, rejectedRes] = await Promise.all([
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
  ])

  const counts = {
    submitted: submittedRes.totalDocs,
    in_review: inReviewRes.totalDocs,
    approved: approvedRes.totalDocs,
    rejected: rejectedRes.totalDocs,
    total:
      submittedRes.totalDocs +
      inReviewRes.totalDocs +
      approvedRes.totalDocs +
      rejectedRes.totalDocs,
  }

  // Build the where clause — combines status filter + free-text search
  type WhereClause = Parameters<typeof payload.find>[0]['where']

  const searchWhere: WhereClause | undefined = searchQuery
    ? {
        or: [
          { title: { like: searchQuery } },
          { authorName: { like: searchQuery } },
          { authorEmail: { like: searchQuery } },
          { dek: { like: searchQuery } },
        ],
      }
    : undefined

  const statusWhere: WhereClause | undefined = activeFilter
    ? { workflowStatus: { equals: activeFilter } }
    : undefined

  const where: WhereClause | undefined =
    searchWhere && statusWhere ? { and: [statusWhere, searchWhere] } : (searchWhere ?? statusWhere)

  // Fetch paginated article list
  const articlesRes = await payload.find({
    collection: 'articles',
    ...(where ? { where } : {}),
    limit: PER_PAGE,
    page,
    sort: '-submittedAt',
    depth: 1,
    overrideAccess: true,
  })

  const articles = articlesRes.docs
  const totalPages = Math.ceil(articlesRes.totalDocs / PER_PAGE) || 1

  // Build a URL preserving status + search query, changing only page
  function pageHref(p: number) {
    const params = new URLSearchParams()
    if (activeFilter) params.set('status', activeFilter)
    if (searchQuery) params.set('q', searchQuery)
    if (p > 1) params.set('page', String(p))
    const qs = params.toString()
    return `/editorial${qs ? `?${qs}` : ''}`
  }

  // Build a tab href preserving the current search query, resetting page
  function tabHref(status: WorkflowStatus | null) {
    const params = new URLSearchParams()
    if (status) params.set('status', status)
    if (searchQuery) params.set('q', searchQuery)
    const qs = params.toString()
    return `/editorial${qs ? `?${qs}` : ''}`
  }

  return (
    <main style={{ padding: '40px 32px 80px', maxWidth: 1100, margin: '0 auto' }}>
      {/* ── Page header ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: 24,
          marginBottom: 40,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: "'Bodoni Moda', Georgia, serif",
              fontSize: 36,
              fontWeight: 500,
              letterSpacing: '0.02em',
              color: '#000',
              margin: 0,
              marginBottom: 8,
            }}
          >
            Submissions
          </h1>
          <p style={{ fontSize: 14, color: '#5d5f5f', margin: 0 }}>
            Review and action contributor article submissions.
          </p>
        </div>

        {/* Search bar — client component (needs useSearchParams) */}
        <Suspense
          fallback={
            <div
              style={{
                flex: 1,
                maxWidth: 420,
                height: 40,
                background: '#f5f5f5',
                borderRadius: 2,
                border: '1px solid #cfc4c5',
              }}
            />
          }
        >
          <EditorialSearch defaultValue={searchQuery} />
        </Suspense>
      </div>

      {/* ── Stats strip ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 16,
          marginBottom: 40,
        }}
      >
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
            <Link key={key} href={tabHref(key)} style={{ textDecoration: 'none' }}>
              <div
                style={{
                  background: '#fff',
                  borderTop: `3px solid ${m.dot}`,
                  borderRight: `1px solid ${activeFilter === key ? m.dot : '#cfc4c5'}`,
                  borderBottom: `1px solid ${activeFilter === key ? m.dot : '#cfc4c5'}`,
                  borderLeft: `1px solid ${activeFilter === key ? m.dot : '#cfc4c5'}`,
                  borderRadius: 4,
                  padding: '20px 24px',
                  cursor: 'pointer',
                  transition: 'border-color 0.15s',
                }}
              >
                <div
                  style={{
                    fontSize: 32,
                    fontWeight: 700,
                    fontFamily: "'Bodoni Moda', Georgia, serif",
                    color: m.color,
                    lineHeight: 1,
                    marginBottom: 6,
                  }}
                >
                  {counts[key]}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: '#5d5f5f',
                  }}
                >
                  {label}
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* ── Filter tabs ── */}
      <div
        style={{
          display: 'flex',
          gap: 0,
          borderBottom: '1px solid #cfc4c5',
          marginBottom: 0,
        }}
      >
        {[
          { key: null, label: `All (${counts.total})` },
          { key: 'submitted' as const, label: `Submitted (${counts.submitted})` },
          { key: 'in_review' as const, label: `In Review (${counts.in_review})` },
          { key: 'approved' as const, label: `Approved (${counts.approved})` },
          { key: 'rejected' as const, label: `Rejected (${counts.rejected})` },
        ].map(({ key, label }) => {
          const active = key === activeFilter
          return (
            <Link
              key={String(key)}
              href={tabHref(key)}
              style={{
                display: 'block',
                padding: '11px 20px',
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.13em',
                textTransform: 'uppercase',
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

        {/* Active search indicator */}
        {searchQuery && (
          <div
            style={{
              marginLeft: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '0 4px',
              fontSize: 11,
              color: '#5d5f5f',
            }}
          >
            <span style={{ fontStyle: 'italic' }}>
              Results for &ldquo;{searchQuery}&rdquo; · {articlesRes.totalDocs} found
            </span>
            <Link
              href={tabHref(activeFilter)}
              style={{
                fontSize: 12,
                color: '#aaa',
                textDecoration: 'none',
                fontWeight: 700,
                lineHeight: 1,
              }}
              title="Clear search"
            >
              ×
            </Link>
          </div>
        )}
      </div>

      {/* ── Article list ── */}
      {articles.length === 0 ? (
        <div
          style={{
            background: '#fff',
            borderRight: '1px solid #cfc4c5',
            borderBottom: '1px solid #cfc4c5',
            borderLeft: '1px solid #cfc4c5',
            padding: '64px 32px',
            textAlign: 'center',
          }}
        >
          <p style={{ fontSize: 14, color: '#5d5f5f', margin: 0 }}>
            {searchQuery
              ? `No results for "${searchQuery}"${activeFilter ? ` in ${STATUS_META[activeFilter].label}` : ''}.`
              : `No ${activeFilter ? STATUS_META[activeFilter].label.toLowerCase() + ' ' : ''}submissions yet.`}
          </p>
        </div>
      ) : (
        <div
          style={{
            background: '#fff',
            borderRight: '1px solid #cfc4c5',
            borderBottom: '1px solid #cfc4c5',
            borderLeft: '1px solid #cfc4c5',
          }}
        >
          {articles.map((article, i) => {
            const status = (article.workflowStatus as WorkflowStatus) ?? 'submitted'
            const m = STATUS_META[status]
            const category = article.category as { name?: string } | null
            const placementSlot = article.placement ? SLOT_BY_ID[article.placement as SlotId] : null
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
                <div style={{ background: m.dot }} />

                {/* Main content */}
                <div style={{ padding: '20px 24px', minWidth: 0 }}>
                  <div
                    style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 8 }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h2
                        style={{
                          fontFamily: "'Bodoni Moda', Georgia, serif",
                          fontSize: 18,
                          fontWeight: 500,
                          lineHeight: 1.3,
                          color: '#000',
                          margin: '0 0 4px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 1,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {article.title as string}
                      </h2>
                      {article.dek && (
                        <p
                          style={{
                            fontSize: 13,
                            color: '#5d5f5f',
                            margin: 0,
                            lineHeight: 1.4,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: 'vertical',
                          }}
                        >
                          {article.dek as string}
                        </p>
                      )}
                    </div>
                    <StatusBadge status={status} />
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '4px 20px',
                      fontSize: 11,
                      color: '#5d5f5f',
                      fontWeight: 500,
                      letterSpacing: '0.06em',
                    }}
                  >
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
                      {formatEditorialDate(article.submittedAt as string | null)}
                    </span>
                    {placementSlot && (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          padding: '2px 8px',
                          background: '#faf7f4',
                          border: '1px solid #cfc4c5',
                          borderRadius: 2,
                          fontSize: 9,
                          fontWeight: 700,
                          letterSpacing: '0.14em',
                          textTransform: 'uppercase',
                          color: '#5d5f5f',
                        }}
                      >
                        ◈ {placementSlot.page} — {placementSlot.label}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 24px',
                    gap: 8,
                    borderLeft: '1px solid #e8e3de',
                  }}
                >
                  <Link
                    href={`/editorial/${article.id}`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '9px 18px',
                      background: '#000',
                      color: '#fff',
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: '0.16em',
                      textTransform: 'uppercase',
                      textDecoration: 'none',
                      borderRadius: 2,
                      whiteSpace: 'nowrap',
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

      {/* ── Pagination ── */}
      <Pagination variant="numbered" page={page} totalPages={totalPages} buildHref={pageHref} />

      {/* Result count */}
      <p style={{ marginTop: 16, fontSize: 12, color: '#aaa', textAlign: 'center' }}>
        {articlesRes.totalDocs === 0
          ? 'No submissions found.'
          : `Showing ${(page - 1) * PER_PAGE + 1}–${Math.min(page * PER_PAGE, articlesRes.totalDocs)} of ${articlesRes.totalDocs}`}
      </p>
    </main>
  )
}
