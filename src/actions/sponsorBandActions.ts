'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { createLogger } from '@/lib/logger'

const logger = createLogger('Action:SponsorBand')

type SponsorBandData = {
  enabled: boolean
  imageUrl?: string | null
  eyebrow?: string | null
  brand: string
  tagline?: string | null
  linkUrl?: string | null
  linkLabel?: string | null
}

type ActionResult = { success: boolean; error?: string }

export async function saveSponsorBand(data: SponsorBandData): Promise<ActionResult> {
  try {
    const headersList = await headers()
    const payload = await getPayload({ config: configPromise })
    const { user } = await payload.auth({ headers: headersList })
    if (!user) return { success: false, error: 'Unauthorized' }

    if (!data.brand?.trim()) {
      return { success: false, error: 'Brand name is required' }
    }

    logger.info('Saving sponsor band', { editor: user.email, brand: data.brand })

    await payload.updateGlobal({
      slug: 'sponsor-band',
      data: {
        enabled: data.enabled,
        imageUrl: data.imageUrl ?? null,
        eyebrow: data.eyebrow ?? null,
        brand: data.brand.trim(),
        tagline: data.tagline ?? null,
        linkUrl: data.linkUrl ?? null,
        linkLabel: data.linkLabel ?? null,
      },
    })

    revalidatePath('/')
    logger.info('Sponsor band saved successfully', { brand: data.brand })

    return { success: true }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to save sponsor band'
    logger.error('saveSponsorBand failed', { error: msg })
    return { success: false, error: msg }
  }
}
