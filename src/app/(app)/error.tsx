'use client'

import Link from 'next/link'

export default function AppError({
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
        padding: '80px var(--gutter)',
        background: '#fff',
      }}
    >
      <div style={{ textAlign: 'center', maxWidth: 560 }}>
        <p
          style={{
            fontFamily: 'var(--serif)',
            fontSize: 'clamp(80px, 15vw, 160px)',
            fontWeight: 500,
            lineHeight: 1,
            color: '#f0ebe4',
            letterSpacing: '-0.03em',
            marginBottom: 0,
            userSelect: 'none',
          }}
        >
          500
        </p>

        <p
          style={{
            fontFamily: 'var(--sans)',
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.28em',
            textTransform: 'uppercase',
            color: 'var(--muted)',
            marginBottom: 20,
            marginTop: -8,
          }}
        >
          Something Went Wrong
        </p>

        <h1
          style={{
            fontFamily: 'var(--serif)',
            fontSize: 'clamp(22px, 4vw, 34px)',
            fontWeight: 500,
            lineHeight: 1.2,
            color: 'var(--ink)',
            marginBottom: 16,
          }}
        >
          An unexpected error occurred.
        </h1>

        <p
          style={{
            fontFamily: 'var(--sans)',
            fontSize: 15,
            color: 'var(--muted)',
            lineHeight: 1.65,
            marginBottom: 40,
          }}
        >
          {error.message || 'Please try again, or return to the front page.'}
        </p>

        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={reset} className="btn-ghost" style={{ display: 'inline-block' }}>
            TRY AGAIN
          </button>
          <Link href="/" className="btn-ghost" style={{ display: 'inline-block' }}>
            RETURN HOME
          </Link>
        </div>
      </div>
    </div>
  )
}
