'use client'

import { useState, useTransition } from 'react'
import { saveSponsorBand } from '@/actions/sponsorBandActions'

type SponsorData = {
  enabled: boolean
  imageUrl: string | null
  eyebrow: string | null
  brand: string
  tagline: string | null
  linkUrl: string | null
  linkLabel: string | null
}

const FIELD_STYLE: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  fontSize: 14,
  fontFamily: "'Hanken Grotesk', sans-serif",
  color: '#1a1c1c',
  background: '#fff',
  border: '1px solid #cfc4c5',
  borderRadius: 3,
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.15s',
}

const LABEL_STYLE: React.CSSProperties = {
  display: 'block',
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: '0.16em',
  textTransform: 'uppercase' as const,
  color: '#5d5f5f',
  marginBottom: 6,
}

const HINT_STYLE: React.CSSProperties = {
  fontSize: 11,
  color: '#aaa',
  marginTop: 5,
  lineHeight: 1.4,
}

export default function SponsorBandForm({ initial }: { initial: SponsorData }) {
  const [values, setValues] = useState<SponsorData>(initial)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function set(field: keyof SponsorData, value: string | boolean | null) {
    setSaved(false)
    setValues((prev) => ({ ...prev, [field]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSaved(false)
    startTransition(async () => {
      const result = await saveSponsorBand(values)
      if (result.success) {
        setSaved(true)
      } else {
        setError(result.error ?? 'Failed to save')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Enabled toggle */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 24px',
          background: '#fff',
          border: '1px solid #cfc4c5',
          borderRadius: 4,
          marginBottom: 24,
          cursor: 'pointer',
        }}
        onClick={() => set('enabled', !values.enabled)}
      >
        <div>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#1a1c1c' }}>
            Show Sponsor Band
          </p>
          <p style={{ margin: '4px 0 0', fontSize: 12, color: '#5d5f5f' }}>
            Display the sponsor strip on the homepage
          </p>
        </div>
        {/* Toggle switch */}
        <div
          style={{
            position: 'relative',
            width: 44,
            height: 24,
            background: values.enabled ? '#1a1c1c' : '#cfc4c5',
            borderRadius: 12,
            transition: 'background 0.2s',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 3,
              left: values.enabled ? 23 : 3,
              width: 18,
              height: 18,
              background: '#fff',
              borderRadius: '50%',
              transition: 'left 0.2s',
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            }}
          />
        </div>
      </div>

      {/* Two-column grid for the fields */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        <div>
          <label style={LABEL_STYLE}>Brand Name *</label>
          <input
            style={FIELD_STYLE}
            value={values.brand}
            onChange={(e) => set('brand', e.target.value)}
            placeholder="MAISON VERMEIL"
            required
          />
          <p style={HINT_STYLE}>The sponsor&apos;s name, shown prominently in the band.</p>
        </div>

        <div>
          <label style={LABEL_STYLE}>Eyebrow Label</label>
          <input
            style={FIELD_STYLE}
            value={values.eyebrow ?? ''}
            onChange={(e) => set('eyebrow', e.target.value || null)}
            placeholder="PRESENTED BY"
          />
          <p style={HINT_STYLE}>Small text above the brand name (e.g. &quot;PRESENTED BY&quot;).</p>
        </div>

        <div style={{ gridColumn: '1 / -1' }}>
          <label style={LABEL_STYLE}>Tagline</label>
          <input
            style={FIELD_STYLE}
            value={values.tagline ?? ''}
            onChange={(e) => set('tagline', e.target.value || null)}
            placeholder="The art of fragrance, reimagined for the modern connoisseur"
          />
          <p style={HINT_STYLE}>Short line beneath the brand name.</p>
        </div>

        <div style={{ gridColumn: '1 / -1' }}>
          <label style={LABEL_STYLE}>Background Image URL</label>
          <input
            style={FIELD_STYLE}
            type="url"
            value={values.imageUrl ?? ''}
            onChange={(e) => set('imageUrl', e.target.value || null)}
            placeholder="https://example.com/image.jpg"
          />
          <p style={HINT_STYLE}>
            External image URL for the band background. To use an uploaded media file, set it in the
            Payload admin under Globals → Sponsor Band.
          </p>
        </div>

        <div>
          <label style={LABEL_STYLE}>Button Link URL</label>
          <input
            style={FIELD_STYLE}
            type="url"
            value={values.linkUrl ?? ''}
            onChange={(e) => set('linkUrl', e.target.value || null)}
            placeholder="https://sponsor.com"
          />
          <p style={HINT_STYLE}>Leave blank to hide the CTA button.</p>
        </div>

        <div>
          <label style={LABEL_STYLE}>Button Label</label>
          <input
            style={FIELD_STYLE}
            value={values.linkLabel ?? ''}
            onChange={(e) => set('linkLabel', e.target.value || null)}
            placeholder="EXPLORE"
          />
          <p style={HINT_STYLE}>Text on the call-to-action button.</p>
        </div>
      </div>

      {/* Preview strip */}
      <div
        style={{
          marginBottom: 28,
          border: '1px solid #cfc4c5',
          borderRadius: 4,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '8px 16px',
            background: '#f5f5f5',
            borderBottom: '1px solid #cfc4c5',
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: '#5d5f5f',
          }}
        >
          Preview
        </div>
        <div
          style={{
            position: 'relative',
            background: values.imageUrl
              ? `url(${values.imageUrl}) center/cover`
              : 'linear-gradient(135deg, #1a1c1c 0%, #3a3c3c 100%)',
            padding: '40px 48px',
            textAlign: 'center',
            minHeight: 160,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(10,10,10,0.5)',
            }}
          />
          <div style={{ position: 'relative', zIndex: 1 }}>
            {values.eyebrow && (
              <p
                style={{
                  margin: '0 0 8px',
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.6)',
                }}
              >
                {values.eyebrow}
              </p>
            )}
            <p
              style={{
                margin: '0 0 8px',
                fontFamily: "'Bodoni Moda', Georgia, serif",
                fontSize: 28,
                fontWeight: 500,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: '#fff',
              }}
            >
              {values.brand || 'BRAND NAME'}
            </p>
            {values.tagline && (
              <p
                style={{
                  margin: '0 0 16px',
                  fontSize: 12,
                  color: 'rgba(255,255,255,0.7)',
                  letterSpacing: '0.04em',
                }}
              >
                {values.tagline}
              </p>
            )}
            {values.linkUrl && (
              <span
                style={{
                  display: 'inline-block',
                  padding: '8px 20px',
                  border: '1px solid rgba(255,255,255,0.6)',
                  color: '#fff',
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                }}
              >
                {values.linkLabel || 'EXPLORE'}
              </span>
            )}
            {!values.enabled && (
              <div
                style={{
                  marginTop: 12,
                  padding: '4px 12px',
                  background: 'rgba(255,80,80,0.25)',
                  border: '1px solid rgba(255,80,80,0.5)',
                  borderRadius: 2,
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: '#ff8080',
                }}
              >
                Hidden — band is disabled
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Save button + feedback */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button
          type="submit"
          disabled={isPending}
          style={{
            padding: '12px 32px',
            background: isPending ? '#5d5f5f' : '#1a1c1c',
            color: '#fff',
            border: 'none',
            borderRadius: 3,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            cursor: isPending ? 'not-allowed' : 'pointer',
            transition: 'background 0.15s',
          }}
        >
          {isPending ? 'Saving…' : 'Save Changes'}
        </button>

        {saved && (
          <span style={{ fontSize: 13, color: '#2e7d32', fontWeight: 500 }}>
            ✓ Saved — homepage will update shortly
          </span>
        )}
        {error && (
          <span style={{ fontSize: 13, color: '#c62828', fontWeight: 500 }}>✗ {error}</span>
        )}
      </div>
    </form>
  )
}
