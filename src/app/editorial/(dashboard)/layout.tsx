import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { createLogger } from '@/lib/logger'
import Link from 'next/link'
import LogoutButton from './LogoutButton'

const logger = createLogger('EditorialLayout')

export const metadata = {
  title: "Editorial — C'est Fort",
  robots: { index: false },
}

export default async function EditorialLayout({ children }: { children: ReactNode }) {
  const headersList = await headers()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers: headersList })

  if (!user) {
    logger.warn('Unauthenticated access to editorial — redirecting to login')
    redirect('/editorial/login')
  }

  logger.debug('Editorial access granted', { email: user.email, role: user.role })

  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,wght@0,400..900;1,400..900&family=Hanken+Grotesk:ital,wght@0,100..900;1,100..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        style={{
          margin: 0,
          background: '#f9f9f9',
          color: '#1a1c1c',
          fontFamily: "'Hanken Grotesk', sans-serif",
        }}
      >
        {/* ── Top navigation bar ── */}
        <header
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: 64,
            padding: '0 32px',
            background: '#fff',
            borderBottom: '1px solid #cfc4c5',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <span
                style={{
                  fontFamily: "'Bodoni Moda', Georgia, serif",
                  fontSize: 20,
                  fontWeight: 700,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: '#000',
                }}
              >
                C&apos;est Fort
              </span>
            </Link>
            <span style={{ color: '#cfc4c5' }}>|</span>
            <Link href="/editorial" style={{ textDecoration: 'none' }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  color: '#5d5f5f',
                }}
              >
                Editorial
              </span>
            </Link>
            <span style={{ color: '#cfc4c5', fontSize: 16 }}>·</span>
            <Link
              href="/editorial/sponsor"
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: '#5d5f5f',
                textDecoration: 'none',
              }}
            >
              Sponsor Band
            </Link>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontSize: 13, color: '#5d5f5f' }}>
              {(user as { name?: string; email: string }).name ?? user.email}
            </span>
            <LogoutButton />
          </div>
        </header>

        {children}
      </body>
    </html>
  )
}
