import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { createLogger } from '@/lib/logger'
import SponsorBandForm from './SponsorBandForm'

export const dynamic = 'force-dynamic'

const logger = createLogger('Page:SponsorBand')

export default async function SponsorBandPage() {
  const headersList = await headers()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers: headersList })
  if (!user) redirect('/editorial/login')

  logger.info('Rendering sponsor band settings', { editor: user.email })

  // Fetch the current global value (may be null if never saved)
  const raw = await payload.findGlobal({ slug: 'sponsor-band' }).catch(() => null)

  const g = raw as {
    enabled?: boolean
    imageUrl?: string | null
    eyebrow?: string | null
    brand?: string | null
    tagline?: string | null
    linkUrl?: string | null
    linkLabel?: string | null
  } | null

  // Merge with defaults so the form is pre-filled meaningfully
  const initial = {
    enabled: g?.enabled ?? true,
    imageUrl: g?.imageUrl ?? null,
    eyebrow: g?.eyebrow ?? 'PRESENTED BY',
    brand: g?.brand ?? 'MAISON VERMEIL',
    tagline: g?.tagline ?? 'The art of fragrance, reimagined for the modern connoisseur',
    linkUrl: g?.linkUrl ?? null,
    linkLabel: g?.linkLabel ?? 'EXPLORE',
  }

  return (
    <main style={{ padding: '40px 32px 80px', maxWidth: 860, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 40 }}>
        <p
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: '#aaa',
            margin: '0 0 10px',
          }}
        >
          Site Settings
        </p>
        <h1
          style={{
            fontFamily: "'Bodoni Moda', Georgia, serif",
            fontSize: 36,
            fontWeight: 500,
            letterSpacing: '0.02em',
            color: '#000',
            margin: '0 0 8px',
          }}
        >
          Sponsor Band
        </h1>
        <p style={{ fontSize: 14, color: '#5d5f5f', margin: 0 }}>
          Configure the full-width sponsor strip shown on the homepage.
        </p>
      </div>

      <SponsorBandForm initial={initial} />
    </main>
  )
}
