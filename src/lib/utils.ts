import { createLogger } from './logger'

const logger = createLogger('Utils')

const formatDate = (dateString: string | Date): string => {
  const date = new Date(dateString)
  const formatted = date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  logger.debug('Formatted date', { input: dateString, output: formatted })
  return formatted
}

const formatDateShort = (dateString: string | Date): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).toUpperCase()
}

const slugify = (text: string): string => {
  const slug = text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
  logger.debug('Slugified text', { input: text, output: slug })
  return slug
}

// Rough word-count read time estimate (200 wpm)
const estimateReadTime = (text: string): number => {
  const wordCount = text.trim().split(/\s+/).length
  return Math.max(1, Math.ceil(wordCount / 200))
}

const truncate = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength).trimEnd()}…`
}

// Extract plain text from Lexical JSON for read-time estimation
const lexicalToPlainText = (content: unknown): string => {
  if (!content || typeof content !== 'object') return ''

  const node = content as Record<string, unknown>

  if (node.type === 'text' && typeof node.text === 'string') {
    return node.text
  }

  if (Array.isArray(node.children)) {
    return (node.children as unknown[]).map(lexicalToPlainText).join(' ')
  }

  if (node.root) {
    return lexicalToPlainText(node.root)
  }

  return ''
}

const CATEGORIES = ['tech', 'culture', 'fashion', 'showbusiness', 'leaders-stories'] as const
type CategorySlug = typeof CATEGORIES[number]

const isCategorySlug = (slug: string): slug is CategorySlug =>
  CATEGORIES.includes(slug as CategorySlug)

const categoryLabel = (slug: string): string => {
  const labels: Record<string, string> = {
    tech: 'Tech',
    culture: 'Culture',
    fashion: 'Fashion',
    showbusiness: 'Show-Business',
    'leaders-stories': 'Leaders Stories',
  }
  return labels[slug] ?? slug
}

export {
  formatDate,
  formatDateShort,
  slugify,
  estimateReadTime,
  truncate,
  lexicalToPlainText,
  isCategorySlug,
  categoryLabel,
  CATEGORIES,
}
export type { CategorySlug }
