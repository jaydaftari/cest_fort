import type { Metadata } from 'next'
import { getPayloadClient } from '@/lib/payload'
import SubmissionForm from '@/components/forms/SubmissionForm'
import { createLogger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

const logger = createLogger('Page:Submit')

export const metadata: Metadata = {
  title: "Submit a Story — C'est Fort",
  description:
    "Share your perspective with C'est Fort's readership. All submissions are reviewed by our editorial team.",
}

export default async function SubmitPage() {
  logger.info('Rendering submission page')

  const payload = await getPayloadClient()
  const categoriesResult = await payload.find({ collection: 'categories', limit: 20, sort: 'name' })

  const categories = categoriesResult.docs.map((cat) => ({
    id: String(cat.id),
    name: cat.name as string,
    slug: cat.slug as string,
  }))

  logger.debug('Categories loaded', { count: categories.length })

  return <SubmissionForm categories={categories} />
}
