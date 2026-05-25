'use client'

export default function EditorialError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div
      style={{
        minHeight: '70vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 32px',
        fontFamily: "'Hanken Grotesk', sans-serif",
      }}
    >
      <div style={{ textAlign: 'center', maxWidth: 480 }}>
        <p
          style={{
            fontSize: 'clamp(60px, 12vw, 120px)',
            fontFamily: "'Bodoni Moda', Georgia, serif",
            fontWeight: 700,
            lineHeight: 1,
            color: '#efefef',
            letterSpacing: '-0.02em',
            marginBottom: 0,
            userSelect: 'none',
          }}
        >
          500
        </p>

        <p
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.24em',
            textTransform: 'uppercase',
            color: '#9a9a9a',
            marginBottom: 16,
            marginTop: -4,
          }}
        >
          Editorial Error
        </p>

        <p
          style={{
            fontSize: 20,
            fontFamily: "'Bodoni Moda', Georgia, serif",
            fontWeight: 400,
            color: '#1a1c1c',
            marginBottom: 12,
            lineHeight: 1.3,
          }}
        >
          Something went wrong.
        </p>

        <p
          style={{
            fontSize: 14,
            color: '#5d5f5f',
            lineHeight: 1.6,
            marginBottom: 32,
          }}
        >
          {error.message || 'An unexpected error occurred in the editorial dashboard.'}
        </p>

        <button
          onClick={reset}
          style={{
            padding: '10px 24px',
            background: '#0d0b09',
            color: '#fff',
            border: 'none',
            borderRadius: 2,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            cursor: 'pointer',
          }}
        >
          Try Again
        </button>
      </div>
    </div>
  )
}
