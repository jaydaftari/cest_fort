import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: "404 — Page Not Found — C'est Fort",
}

const NAV_LINKS = [
  { label: 'Tech', href: '/tech' },
  { label: 'Culture', href: '/culture' },
  { label: 'Fashion', href: '/fashion' },
  { label: 'Show-Business', href: '/showbusiness' },
  { label: 'Leaders Stories', href: '/leaders' },
]

export default function NotFound() {
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
          404
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
          Page Not Found
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
          The story you&apos;re looking for has moved on.
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
          It may have been unpublished, renamed, or it never existed. Try one of our sections, or
          return to the front page.
        </p>

        <Link href="/" className="btn-ghost" style={{ display: 'inline-block', marginBottom: 40 }}>
          RETURN HOME
        </Link>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '0 24px',
            borderTop: '1px solid var(--line)',
            paddingTop: 28,
          }}
        >
          {NAV_LINKS.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              style={{
                fontFamily: 'var(--sans)',
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'var(--muted)',
                textDecoration: 'none',
                padding: '6px 0',
              }}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
