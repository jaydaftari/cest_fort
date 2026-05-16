import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { createLogger } from '@/lib/logger'

const logger = createLogger('AdminDashboard')

export default async function Dashboard() {
  let stats = { total: 0, submitted: 0, inReview: 0, approved: 0, rejected: 0 }

  try {
    const payload = await getPayload({ config: configPromise })
    const [all, submitted, inReview, approved, rejected] = await Promise.all([
      payload.find({ collection: 'articles', limit: 0, overrideAccess: true }),
      payload.find({ collection: 'articles', where: { workflowStatus: { equals: 'submitted' } }, limit: 0, overrideAccess: true }),
      payload.find({ collection: 'articles', where: { workflowStatus: { equals: 'in_review' } }, limit: 0, overrideAccess: true }),
      payload.find({ collection: 'articles', where: { workflowStatus: { equals: 'approved' } }, limit: 0, overrideAccess: true }),
      payload.find({ collection: 'articles', where: { workflowStatus: { equals: 'rejected' } }, limit: 0, overrideAccess: true }),
    ])
    stats = {
      total: all.totalDocs,
      submitted: submitted.totalDocs,
      inReview: inReview.totalDocs,
      approved: approved.totalDocs,
      rejected: rejected.totalDocs,
    }
    logger.debug('Dashboard stats loaded', stats)
  } catch (err) {
    logger.warn('Could not load dashboard stats', { error: String(err) })
  }

  const cards = [
    { label: 'Total Articles',  value: stats.total,    color: '#0d0b09' },
    { label: 'Awaiting Review', value: stats.submitted, color: '#7a5c14' },
    { label: 'In Review',       value: stats.inReview,  color: '#1a3a5c' },
    { label: 'Published',       value: stats.approved,  color: '#1a3a1a' },
  ]

  return (
    <div style={{
      padding: '0 0 48px',
      fontFamily: "'Syne', system-ui, sans-serif",
      WebkitFontSmoothing: 'antialiased',
    }}>

      {/* ── Masthead banner ── */}
      <div style={{
        background: '#0d0b09',
        padding: '48px 48px 40px',
        marginBottom: 40,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Gold accent line */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          height: 2, background: 'linear-gradient(90deg, #b8902e, #d4aa50 40%, transparent)',
        }} />

        <p style={{
          fontSize: 9, fontWeight: 700, letterSpacing: '0.3em',
          textTransform: 'uppercase', color: 'rgba(255,253,248,0.35)',
          marginBottom: 16,
        }}>
          Editorial Studio
        </p>
        <h1 style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: 52, fontWeight: 300, letterSpacing: '0.12em',
          textTransform: 'uppercase', color: '#fffdf8',
          lineHeight: 1, marginBottom: 20,
        }}>
          C&apos;est Fort
        </h1>
        <div style={{ width: 40, height: 1, background: '#b8902e', marginBottom: 16 }} />
        <p style={{
          fontSize: 12, color: 'rgba(255,253,248,0.4)',
          fontWeight: 400, letterSpacing: '0.08em',
        }}>
          Content Management System — Paris
        </p>
      </div>

      {/* ── Stats strip ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 16,
        padding: '0 48px',
        marginBottom: 48,
      }}>
        {cards.map(({ label, value, color }) => (
          <div key={label} style={{
            background: '#fffdf8',
            border: '1px solid #eae6de',
            borderRadius: 3,
            padding: '24px 24px 20px',
            borderTop: `3px solid ${color}`,
          }}>
            <p style={{
              fontSize: 8.5, fontWeight: 700, letterSpacing: '0.22em',
              textTransform: 'uppercase', color: '#8c8778',
              marginBottom: 12,
            }}>
              {label}
            </p>
            <p style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 44, fontWeight: 400, color: '#0d0b09',
              lineHeight: 1,
            }}>
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* ── Quick links ── */}
      <div style={{ padding: '0 48px' }}>
        <p style={{
          fontSize: 9, fontWeight: 700, letterSpacing: '0.24em',
          textTransform: 'uppercase', color: '#8c8778',
          marginBottom: 16,
        }}>
          Quick Access
        </p>
        <div style={{ display: 'flex', gap: 12 }}>
          {[
            { label: 'All Articles', href: '/admin/collections/articles' },
            { label: 'Media Library', href: '/admin/collections/media' },
            { label: 'Categories', href: '/admin/collections/categories' },
            { label: 'Editorial Dashboard', href: '/editorial' },
          ].map(({ label, href }) => (
            <a key={href} href={href} style={{
              display: 'inline-block',
              padding: '9px 18px',
              background: 'transparent',
              border: '1px solid #ddd8ce',
              borderRadius: 2,
              fontSize: 10.5, fontWeight: 700,
              letterSpacing: '0.1em', textTransform: 'uppercase',
              color: '#0d0b09', textDecoration: 'none',
              transition: 'background 0.15s, border-color 0.15s',
              fontFamily: "'Syne', system-ui, sans-serif",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = '#0d0b09'
              e.currentTarget.style.color = '#fffdf8'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = '#0d0b09'
            }}
            >
              {label}
            </a>
          ))}
        </div>
      </div>

    </div>
  )
}
