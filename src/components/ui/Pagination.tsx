import Link from 'next/link'

type Props = {
  page: number
  totalPages: number
  buildHref: (page: number) => string
  variant?: 'simple' | 'numbered'
  style?: React.CSSProperties
}

export function Pagination({ page, totalPages, buildHref, variant = 'simple', style }: Props) {
  if (totalPages <= 1) return null

  if (variant === 'numbered') {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          marginTop: 32,
          ...style,
        }}
      >
        {page > 1 && (
          <Link
            href={buildHref(page - 1)}
            style={{
              padding: '8px 18px',
              border: '1px solid #cfc4c5',
              borderRadius: 2,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              textDecoration: 'none',
              color: '#1a1c1c',
              background: '#fff',
            }}
          >
            ← Prev
          </Link>
        )}

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
          const isActive = p === page
          const showPage = p === 1 || p === totalPages || Math.abs(p - page) <= 1
          if (!showPage) {
            const showEllipsis = p === 2 || p === totalPages - 1
            return showEllipsis ? (
              <span key={p} style={{ fontSize: 12, color: '#aaa', padding: '0 4px' }}>
                …
              </span>
            ) : null
          }
          return (
            <Link
              key={p}
              href={buildHref(p)}
              style={{
                minWidth: 36,
                padding: '8px 4px',
                border: `1px solid ${isActive ? '#1a1c1c' : '#cfc4c5'}`,
                borderRadius: 2,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.08em',
                textDecoration: 'none',
                textAlign: 'center',
                color: isActive ? '#fff' : '#5d5f5f',
                background: isActive ? '#1a1c1c' : '#fff',
              }}
            >
              {p}
            </Link>
          )
        })}

        {page < totalPages && (
          <Link
            href={buildHref(page + 1)}
            style={{
              padding: '8px 18px',
              border: '1px solid #cfc4c5',
              borderRadius: 2,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              textDecoration: 'none',
              color: '#1a1c1c',
              background: '#fff',
            }}
          >
            Next →
          </Link>
        )}
      </div>
    )
  }

  return (
    <nav className="pagination" style={style}>
      {page > 1 && (
        <Link className="page-btn" href={buildHref(page - 1)}>
          ← Prev
        </Link>
      )}
      <span className="page-info">
        Page {page} of {totalPages}
      </span>
      {page < totalPages && (
        <Link className="page-btn" href={buildHref(page + 1)}>
          Next →
        </Link>
      )}
    </nav>
  )
}
