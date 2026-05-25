'use server'

import { getPayloadClient } from '@/lib/payload'
import { slugify } from '@/lib/utils'
import { createLogger } from '@/lib/logger'
import { sendSubmissionAlert } from '@/lib/email'

const logger = createLogger('Action:SubmitArticle')

// ── Tiptap JSON → Lexical JSON ──────────────────────────────────────────────
type TiptapNode = {
  type: string
  attrs?: Record<string, unknown>
  content?: TiptapNode[]
  text?: string
  marks?: { type: string; attrs?: Record<string, unknown> }[]
}

function convertInlines(nodes: TiptapNode[]): object[] {
  return nodes.map((node) => {
    if (node.type === 'hardBreak') return { type: 'linebreak', version: 1 }

    let format = 0
    let linkHref: string | null = null
    for (const mark of node.marks ?? []) {
      if (mark.type === 'bold') format |= 1
      if (mark.type === 'italic') format |= 2
      if (mark.type === 'strike') format |= 4
      if (mark.type === 'underline') format |= 8
      if (mark.type === 'code') format |= 16
      if (mark.type === 'link') linkHref = (mark.attrs?.href as string) ?? null
    }

    const textNode = {
      type: 'text',
      text: node.text ?? '',
      format,
      mode: 'normal',
      style: '',
      version: 1,
    }

    if (linkHref) {
      return {
        type: 'link',
        url: linkHref,
        fields: { url: linkHref },
        rel: null,
        title: null,
        children: [textNode],
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
      }
    }
    return textNode
  })
}

function convertBlock(node: TiptapNode): object | null {
  switch (node.type) {
    case 'paragraph':
      return {
        type: 'paragraph',
        format: '',
        indent: 0,
        version: 1,
        children: convertInlines(node.content ?? []),
      }
    case 'heading':
      return {
        type: 'heading',
        tag: `h${node.attrs?.level ?? 2}`,
        format: '',
        indent: 0,
        version: 1,
        direction: 'ltr',
        children: convertInlines(node.content ?? []),
      }
    case 'bulletList':
      return {
        type: 'list',
        listType: 'bullet',
        tag: 'ul',
        format: '',
        indent: 0,
        version: 1,
        start: 1,
        children: (node.content ?? []).map(convertListItem),
      }
    case 'orderedList':
      return {
        type: 'list',
        listType: 'number',
        tag: 'ol',
        format: '',
        indent: 0,
        version: 1,
        start: Number(node.attrs?.start ?? 1),
        children: (node.content ?? []).map(convertListItem),
      }
    case 'blockquote':
      return {
        type: 'quote',
        format: '',
        indent: 0,
        version: 1,
        children: (node.content ?? []).flatMap((n) =>
          n.type === 'paragraph' ? convertInlines(n.content ?? []) : []
        ),
      }
    case 'horizontalRule':
      return { type: 'horizontalrule', version: 1 }
    case 'image':
      return {
        type: 'image',
        src: (node.attrs?.src as string) ?? '',
        alt: (node.attrs?.alt as string) ?? '',
        version: 1,
      }
    default:
      return null
  }
}

function convertListItem(node: TiptapNode): object {
  const children = (node.content ?? []).flatMap((n) =>
    n.type === 'paragraph' ? convertInlines(n.content ?? []) : []
  )
  return { type: 'listitem', format: '', indent: 0, version: 1, value: 1, checked: false, children }
}

function tiptapToLexical(doc: TiptapNode) {
  return {
    root: {
      type: 'root',
      format: '',
      indent: 0,
      version: 1,
      direction: 'ltr',
      children: (doc.content ?? []).map(convertBlock).filter(Boolean),
    },
  }
}

function isDocEmpty(doc: TiptapNode): boolean {
  if (!doc.content?.length) return true
  return doc.content.every((block) => !block.content?.some((inline) => inline.text?.trim()))
}

// ── Server action ───────────────────────────────────────────────────────────
type SubmissionInput = {
  authorName: string
  authorEmail: string
  authorUrl?: string
  title: string
  dek: string
  contentJson: string // Tiptap doc JSON — serialized to string on client
  category: string
  heroMediaId: number
}

type SubmissionResult = { success: true; articleId: string } | { success: false; error: string }

export async function submitArticle(input: SubmissionInput): Promise<SubmissionResult> {
  logger.info('New article submission received', {
    authorEmail: input.authorEmail,
    title: input.title,
    category: input.category,
  })

  if (!input.title?.trim()) return { success: false, error: 'Title is required.' }
  let parsedContent: TiptapNode
  try {
    const raw =
      typeof input.contentJson === 'string' ? input.contentJson : JSON.stringify(input.contentJson)
    parsedContent = JSON.parse(raw) as TiptapNode
  } catch (parseErr) {
    logger.error('contentJson parse failed', {
      type: typeof input.contentJson,
      preview: String(input.contentJson).slice(0, 120),
      err: String(parseErr),
    })
    return { success: false, error: 'Article content is invalid.' }
  }
  if (isDocEmpty(parsedContent)) return { success: false, error: 'Article body is required.' }
  if (!input.authorName?.trim()) return { success: false, error: 'Author name is required.' }
  if (!input.authorEmail?.trim() || !input.authorEmail.includes('@'))
    return { success: false, error: 'A valid email address is required.' }
  if (!input.authorUrl?.trim())
    return { success: false, error: 'A personal website or LinkedIn URL is required.' }
  if (!input.heroMediaId) return { success: false, error: 'Please upload a cover image.' }
  if (!input.category) return { success: false, error: 'Please select a section for your article.' }

  try {
    const payload = await getPayloadClient()
    const lexicalContent = tiptapToLexical(parsedContent)

    // Generate a unique slug — append a short random suffix if base slug is taken
    const baseSlug = slugify(input.title)
    let slug = baseSlug
    const existing = await payload.find({
      collection: 'articles',
      where: { slug: { like: baseSlug } },
      limit: 10,
    })
    if (existing.docs.some((d) => d.slug === baseSlug)) {
      slug = `${baseSlug}-${Math.random().toString(36).slice(2, 7)}`
    }

    logger.debug('Creating article with slug', { slug })

    const article = await payload.create({
      collection: 'articles',
      data: {
        title: input.title.trim(),
        slug,
        dek: input.dek?.trim() || undefined,
        content: lexicalContent,
        authorName: input.authorName.trim(),
        authorEmail: input.authorEmail.trim(),
        authorUrl: input.authorUrl?.trim() || undefined,
        category: Number(input.category),
        heroImage: input.heroMediaId,
        workflowStatus: 'submitted',
        submittedAt: new Date().toISOString(),
        _status: 'draft',
      },
    })

    logger.info('Article submission created successfully', { id: article.id, slug: article.slug })

    // Resolve category name for the email (best-effort)
    let categoryName: string | undefined
    try {
      const payload2 = await getPayloadClient()
      const cat = await payload2.findByID({ collection: 'categories', id: Number(input.category) })
      categoryName = cat?.name
    } catch {
      /* ignore */
    }

    // Fire-and-forget — email failure must never block the submission response
    void sendSubmissionAlert({
      articleId: String(article.id),
      title: input.title.trim(),
      authorName: input.authorName.trim(),
      authorEmail: input.authorEmail.trim(),
      categoryName,
      dek: input.dek?.trim(),
    })

    return { success: true, articleId: String(article.id) }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    logger.error('Article submission failed', { error: message, title: input.title })
    return { success: false, error: 'Submission failed. Please try again.' }
  }
}
