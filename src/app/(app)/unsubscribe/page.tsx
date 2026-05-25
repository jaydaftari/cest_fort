import type { Metadata } from 'next'
import Link from 'next/link'
import { getPayloadClient } from '@/lib/payload'
import { createLogger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: "Unsubscribe — C'est Fort",
}

const logger = createLogger('Page:Unsubscribe')

type PageProps = {
  searchParams: Promise<{ token?: string }>
}

export default async function UnsubscribePage({ searchParams }: PageProps) {
  const { token } = await searchParams

  let status: 'success' | 'already' | 'invalid' | 'no-token' = 'no-token'

  if (token) {
    try {
      const payload = await getPayloadClient()
      const result = await payload.find({
        collection: 'subscribers',
        where: { unsubscribeToken: { equals: token } },
        limit: 1,
        overrideAccess: true,
      })

      if (result.totalDocs === 0) {
        status = 'invalid'
      } else {
        const sub = result.docs[0]
        if (!sub.active) {
          status = 'already'
        } else {
          await payload.update({
            collection: 'subscribers',
            id: sub.id,
            data: { active: false },
            overrideAccess: true,
          })
          logger.info('Unsubscribed', { email: sub.email })
          status = 'success'
        }
      }
    } catch (err) {
      logger.error('Unsubscribe error', { error: String(err), token })
      status = 'invalid'
    }
  }

  const messages = {
    'no-token': {
      heading: 'Missing unsubscribe link',
      body: 'This link appears to be incomplete. Please use the unsubscribe link from one of our emails.',
    },
    invalid: {
      heading: 'Link not recognised',
      body: 'This unsubscribe link is invalid or has expired. If you continue to receive emails, please contact us.',
    },
    already: {
      heading: 'Already unsubscribed',
      body: 'This address has already been removed from our list. You will not receive any further emails from us.',
    },
    success: {
      heading: 'Successfully unsubscribed',
      body: "You've been removed from the C'est Fort mailing list. We're sorry to see you go.",
    },
  }

  const { heading, body } = messages[status]
  const isOk = status === 'success' || status === 'already'

  return (
    <div className="prose-page">
      <div className="prose-shell" style={{ textAlign: 'center', paddingTop: 80 }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: isOk ? '#F0FDF4' : '#FEF2F2',
            border: `1px solid ${isOk ? '#86EFAC' : '#FECACA'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 28px',
          }}
        >
          {isOk ? (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke={isOk ? '#16A34A' : '#DC2626'}
              strokeWidth="1.6"
              width="22"
              height="22"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="#DC2626"
              strokeWidth="1.6"
              width="22"
              height="22"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          )}
        </div>

        <h1
          className="prose-title"
          style={{ textAlign: 'center', fontSize: 'clamp(24px, 4vw, 36px)' }}
        >
          {heading}
        </h1>
        <p
          style={{
            fontFamily: 'var(--sans)',
            fontSize: 16,
            color: 'var(--muted)',
            lineHeight: 1.65,
            maxWidth: 440,
            margin: '16px auto 40px',
          }}
        >
          {body}
        </p>

        <Link href="/" className="btn-ghost" style={{ display: 'inline-block' }}>
          RETURN TO C&apos;EST FORT
        </Link>
      </div>
    </div>
  )
}
