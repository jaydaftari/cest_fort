import type { ReactNode } from 'react'
import Image from 'next/image'
import { createLogger } from '@/lib/logger'

const logger = createLogger('RichTextRenderer')

// Lightweight Lexical JSON → JSX renderer.
// Handles the node types Payload's Lexical editor produces for editorial content.

type TextFormat = number // Lexical bitmask: 1=bold 2=italic 4=strikethrough 8=underline 16=code 32=sub 64=sup

type LexicalNode = {
  type: string
  version?: number
  // Text node
  text?: string
  format?: TextFormat
  // Element node
  children?: LexicalNode[]
  // Heading node
  tag?: string
  // List node
  listType?: 'bullet' | 'number'
  // Link node
  url?: string
  newTab?: boolean
  // Image node
  src?: string
  alt?: string
  // Block quote
  [key: string]: unknown
}

type LexicalContent = {
  root: {
    children: LexicalNode[]
    [key: string]: unknown
  }
}

const applyTextFormat = (text: string, format: TextFormat): ReactNode => {
  let node: ReactNode = text
  if (format & 1) node = <strong>{node}</strong>     // bold
  if (format & 2) node = <em>{node}</em>              // italic
  if (format & 8) node = <u>{node}</u>               // underline
  if (format & 4) node = <s>{node}</s>               // strikethrough
  if (format & 16) node = <code>{node}</code>        // inline code
  if (format & 32) node = <sub>{node}</sub>          // subscript
  if (format & 64) node = <sup>{node}</sup>          // superscript
  return node
}

const renderChildren = (children: LexicalNode[], parentKey: string): ReactNode[] =>
  children.map((child, i) => renderNode(child, `${parentKey}-${i}`))

const renderNode = (node: LexicalNode, key: string): ReactNode => {
  switch (node.type) {
    case 'text': {
      if (!node.text) return null
      const format = node.format ?? 0
      return (
        <span key={key}>
          {format ? applyTextFormat(node.text, format) : node.text}
        </span>
      )
    }

    case 'paragraph': {
      const children = node.children ? renderChildren(node.children, key) : null
      return <p key={key}>{children}</p>
    }

    case 'heading': {
      const tag = (node.tag ?? 'h2') as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
      const Tag = tag
      return <Tag key={key}>{node.children ? renderChildren(node.children, key) : null}</Tag>
    }

    case 'list': {
      const children = node.children ? renderChildren(node.children, key) : null
      return node.listType === 'number'
        ? <ol key={key}>{children}</ol>
        : <ul key={key}>{children}</ul>
    }

    case 'listitem': {
      return (
        <li key={key}>
          {node.children ? renderChildren(node.children, key) : null}
        </li>
      )
    }

    case 'quote': {
      return (
        <blockquote key={key}>
          {node.children ? renderChildren(node.children, key) : null}
        </blockquote>
      )
    }

    case 'link': {
      const href = (node.url as string | undefined) ?? '#'
      const isExternal = href.startsWith('http')
      return (
        <a
          key={key}
          href={href}
          {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        >
          {node.children ? renderChildren(node.children, key) : null}
        </a>
      )
    }

    case 'linebreak': {
      return <br key={key} />
    }

    case 'image': {
      const src = node.src as string | undefined
      if (!src) return null
      return (
        <figure key={key} className="article-image">
          <Image
            src={src}
            alt={(node.alt as string) || ''}
            width={1200}
            height={675}
            style={{ width: '100%', height: 'auto', objectFit: 'cover' }}
          />
        </figure>
      )
    }

    default: {
      logger.debug('Unknown Lexical node type — skipping', { type: node.type })
      // Attempt to render children of unknown block nodes
      if (node.children) {
        return <>{renderChildren(node.children, key)}</>
      }
      return null
    }
  }
}

type Props = {
  content: LexicalContent | null | undefined
}

export default function RichTextRenderer({ content }: Props) {
  if (!content?.root?.children) {
    logger.warn('RichTextRenderer received empty content')
    return null
  }

  logger.debug('Rendering Lexical content', { nodeCount: content.root.children.length })

  return (
    <div className="article-body">
      {content.root.children.map((node, i) => renderNode(node, `root-${i}`))}
    </div>
  )
}
