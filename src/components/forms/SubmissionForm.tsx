'use client'

import { useState, useTransition, useCallback, useRef, useEffect } from 'react'
import type { Editor } from '@tiptap/react'
import Link from 'next/link'
import { useEditor, EditorContent, BubbleMenu, FloatingMenu } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TiptapLink from '@tiptap/extension-link'
import TiptapImage from '@tiptap/extension-image'
import Youtube from '@tiptap/extension-youtube'
import Placeholder from '@tiptap/extension-placeholder'
import { submitArticle } from '@/actions/submitArticle'
import { createLogger } from '@/lib/logger'

const logger = createLogger('SubmissionForm')

type Props = {
  categories: { id: string; name: string; slug: string }[]
}

type FloatPanel = null | 'image' | 'video'

export default function SubmissionForm({ categories }: Props) {
  const [title, setTitle]               = useState('')
  const [dek, setDek]                   = useState('')
  const [authorName, setAuthorName]     = useState('')
  const [authorEmail, setAuthorEmail]   = useState('')
  const [authorUrl, setAuthorUrl]       = useState('')
  const [category, setCategory]         = useState('')
  const [heroImageUrl, setHeroImageUrl]       = useState('')
  const [heroImagePreview, setHeroImagePreview] = useState<string | null>(null)
  const [heroUploading, setHeroUploading]     = useState(false)
  const [error, setError]                     = useState<string | null>(null)
  const [submitted, setSubmitted]             = useState(false)
  const [isPending, startTransition]          = useTransition()
  const [uploading, setUploading]             = useState(false)

  const heroInputRef = useRef<HTMLInputElement>(null)

  // Floating menu state
  const [menuOpen, setMenuOpen]         = useState(false)
  const [activePanel, setActivePanel]   = useState<FloatPanel>(null)
  const [imageUrl, setImageUrl]         = useState('')
  const [videoUrl, setVideoUrl]         = useState('')

  const editorRef   = useRef<Editor | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ── Upload helper ─────────────────────────────────────────────────────────
  const uploadAndInsert = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/media/upload', { method: 'POST', body: fd })
      const json = await res.json() as { url?: string; error?: string }
      if (!res.ok || !json.url) throw new Error(json.error ?? 'Upload failed')
      editorRef.current?.chain().focus().setImage({ src: json.url }).createParagraphNear().focus().run()
      logger.info('Image uploaded and inserted', { url: json.url })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Upload failed'
      logger.error('Image upload error', { error: msg })
      setError(msg)
    } finally {
      setUploading(false)
    }
  }, [])

  // ── Hero image upload ─────────────────────────────────────────────────────
  const uploadHeroImage = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) return
    setHeroUploading(true)
    setError(null)
    // Show local preview immediately
    setHeroImagePreview(URL.createObjectURL(file))
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/media/upload', { method: 'POST', body: fd })
      const json = await res.json() as { url?: string; error?: string }
      if (!res.ok || !json.url) throw new Error(json.error ?? 'Upload failed')
      setHeroImageUrl(json.url)
      logger.info('Hero image uploaded', { url: json.url })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Upload failed'
      logger.error('Hero image upload error', { error: msg })
      setError(msg)
      setHeroImagePreview(null)
    } finally {
      setHeroUploading(false)
    }
  }, [])

  // Auto-grow textarea
  const autoResize = useCallback((el: HTMLTextAreaElement | null) => {
    if (!el) return
    el.style.height = 'auto'
    el.style.height = el.scrollHeight + 'px'
  }, [])

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      TiptapLink.configure({ openOnClick: false }),
      TiptapImage.configure({ inline: false, allowBase64: false }),
      Youtube.configure({ controls: true, nocookie: true }),
      Placeholder.configure({ placeholder: 'Tell your story…' }),
    ],
    editorProps: {
      attributes: { class: 'write-prose' },
      handlePaste: (_view, event) => {
        const items = Array.from(event.clipboardData?.items ?? [])
        const imageItem = items.find((item) => item.type.startsWith('image/'))
        if (!imageItem) return false
        const file = imageItem.getAsFile()
        if (file) { uploadAndInsert(file); return true }
        return false
      },
      handleDrop: (_view, event) => {
        const files = Array.from(event.dataTransfer?.files ?? [])
        const imageFile = files.find((f) => f.type.startsWith('image/'))
        if (!imageFile) return false
        uploadAndInsert(imageFile)
        return true
      },
    },
  })

  useEffect(() => { editorRef.current = editor }, [editor])

  // ── Float menu helpers ────────────────────────────────────────────────────
  const closeMenu = () => {
    setMenuOpen(false)
    setActivePanel(null)
    setImageUrl('')
    setVideoUrl('')
  }

  const toggleMenu = () => {
    if (menuOpen) { closeMenu() } else { setMenuOpen(true); setActivePanel(null) }
  }

  const openPanel = (panel: FloatPanel) => {
    setActivePanel(activePanel === panel ? null : panel)
  }

  const insertImageByUrl = () => {
    const url = imageUrl.trim()
    if (url) {
      editor?.chain().focus().setImage({ src: url }).createParagraphNear().focus().run()
      closeMenu()
    }
  }

  const insertVideo = () => {
    const url = videoUrl.trim()
    if (url) {
      editor?.chain().focus().setYoutubeVideo({ src: url }).createParagraphNear().focus().run()
      closeMenu()
    }
  }

  const insertCodeBlock = () => {
    editor?.chain().focus().toggleCodeBlock().createParagraphNear().run()
    closeMenu()
  }

  const insertBlockquote = () => {
    editor?.chain().focus().toggleBlockquote().run()
    closeMenu()
  }

  const insertDivider = () => {
    editor?.chain().focus().setHorizontalRule().createParagraphNear().focus().run()
    closeMenu()
  }

  // ── Submit / reset ────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const contentJson = JSON.stringify(editor?.getJSON() ?? { type: 'doc', content: [] })
    setError(null)
    startTransition(async () => {
      const result = await submitArticle({ title, dek, authorName, authorEmail, authorUrl, category, heroImageUrl, contentJson })
      if (result.success) {
        logger.info('Submission successful', { articleId: result.articleId })
        setSubmitted(true)
      } else {
        logger.warn('Submission error', { error: result.error })
        setError(result.error)
      }
    })
  }

  const handleReset = () => {
    setSubmitted(false)
    setTitle(''); setDek(''); setAuthorName(''); setAuthorEmail('')
    setCategory(''); setHeroImageUrl(''); setHeroImagePreview(null); setAuthorUrl(''); setError(null)
    closeMenu()
    editor?.commands.clearContent()
  }

  // ── Success ───────────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="write-success">
        <svg className="write-success-icon" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1">
          <circle cx="24" cy="24" r="22" />
          <path d="M14 24l7 7 13-13" strokeWidth="1.4" />
        </svg>
        <h2>Story received.</h2>
        <p>Our editorial team will review your submission and be in touch within 3–5 business days.</p>
        <button className="btn-ghost" onClick={handleReset}>SUBMIT ANOTHER STORY</button>
      </div>
    )
  }

  // ── Editor ────────────────────────────────────────────────────────────────
  return (
    <form className="write-form" onSubmit={handleSubmit}>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) uploadAndInsert(file)
          e.target.value = ''
          closeMenu()
        }}
      />

      {/* Sticky topbar */}
      <div className="write-topbar">
        <Link className="write-back" href="/">← HOME</Link>
        {uploading && <span className="write-uploading">Uploading…</span>}
        <button type="submit" className="write-publish-btn" disabled={isPending || uploading}>
          {isPending ? 'Submitting…' : 'Submit for Review'}
        </button>
      </div>

      {/* ── Author metadata — top ──────────────────────────────────────────── */}
      <div className="write-meta write-meta--top">
        <p className="write-meta-label">About you &amp; your story</p>
        <div className="write-meta-grid">
          <div className="field">
            <label className="field-label">Your name</label>
            <input value={authorName} onChange={(e) => setAuthorName(e.target.value)} placeholder="Full name" required />
          </div>
          <div className="field">
            <label className="field-label">Email address</label>
            <input type="email" value={authorEmail} onChange={(e) => setAuthorEmail(e.target.value)} placeholder="you@example.com" required />
          </div>
          <div className="field field--full">
            <label className="field-label">Your website or LinkedIn</label>
            <input type="url" value={authorUrl} onChange={(e) => setAuthorUrl(e.target.value)} placeholder="https://linkedin.com/in/yourname or https://yoursite.com" required />
          </div>
          <div className="field">
            <label className="field-label">Section</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} required>
              <option value="">Select a section…</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="field">
            <label className="field-label">Cover image</label>
            <input
              ref={heroInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) uploadHeroImage(file)
                e.target.value = ''
              }}
            />
            {heroImagePreview ? (
              <div style={{ position: 'relative', marginTop: 4 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={heroImagePreview}
                  alt="Cover preview"
                  style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', borderRadius: 3, display: 'block' }}
                />
                {heroUploading && (
                  <div style={{
                    position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: 3,
                  }}>
                    <span style={{ color: '#fff', fontSize: 13, fontWeight: 500, letterSpacing: '0.08em' }}>Uploading…</span>
                  </div>
                )}
                {!heroUploading && (
                  <button
                    type="button"
                    onClick={() => heroInputRef.current?.click()}
                    style={{
                      position: 'absolute', bottom: 10, right: 10,
                      background: 'rgba(0,0,0,0.6)', color: '#fff',
                      border: 'none', borderRadius: 2, padding: '6px 12px',
                      fontSize: 11, fontWeight: 600, letterSpacing: '0.1em',
                      textTransform: 'uppercase', cursor: 'pointer',
                    }}
                  >
                    Change
                  </button>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => heroInputRef.current?.click()}
                disabled={heroUploading}
                style={{
                  width: '100%', marginTop: 4,
                  border: '1px dashed #cfc4c5', borderRadius: 3,
                  background: 'transparent', padding: '28px 16px',
                  cursor: heroUploading ? 'not-allowed' : 'pointer',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', gap: 8,
                  transition: 'border-color 0.2s, background 0.2s',
                }}
                onMouseOver={(e) => { e.currentTarget.style.borderColor = '#1a1c1c'; e.currentTarget.style.background = '#f5f5f5' }}
                onMouseOut={(e) => { e.currentTarget.style.borderColor = '#cfc4c5'; e.currentTarget.style.background = 'transparent' }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#5d5f5f" strokeWidth="1.5">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                <span style={{ fontSize: 12, color: '#5d5f5f', fontWeight: 500, letterSpacing: '0.06em' }}>
                  {heroUploading ? 'Uploading…' : 'Click to upload cover image'}
                </span>
                <span style={{ fontSize: 11, color: '#9a9a9a' }}>JPG, PNG, WebP — max 10 MB</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Writing area ──────────────────────────────────────────────────── */}
      <div className="write-area">
        <textarea
          className="write-title"
          placeholder="Title"
          value={title}
          rows={1}
          maxLength={200}
          required
          autoFocus
          onChange={(e) => { setTitle(e.target.value); autoResize(e.target) }}
          ref={autoResize}
        />
        <textarea
          className="write-subtitle"
          placeholder="Add a subtitle… (optional)"
          value={dek}
          rows={1}
          maxLength={300}
          onChange={(e) => { setDek(e.target.value); autoResize(e.target) }}
          ref={autoResize}
        />
        <div className="write-divider" />

        {/* Bubble formatting toolbar */}
        {editor && (
          <BubbleMenu editor={editor} tippyOptions={{ duration: 80, placement: 'top' }}>
            <div className="write-bubble">
              <button type="button" className={`write-bubble-btn${editor.isActive('bold') ? ' is-active' : ''}`} onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleBold().run() }}><b>B</b></button>
              <button type="button" className={`write-bubble-btn${editor.isActive('italic') ? ' is-active' : ''}`} onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleItalic().run() }}><i>I</i></button>
              <div className="write-bubble-sep" />
              <button type="button" className={`write-bubble-btn${editor.isActive('heading', { level: 2 }) ? ' is-active' : ''}`} onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleHeading({ level: 2 }).run() }}>H2</button>
              <button type="button" className={`write-bubble-btn${editor.isActive('heading', { level: 3 }) ? ' is-active' : ''}`} onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleHeading({ level: 3 }).run() }}>H3</button>
              <div className="write-bubble-sep" />
              <button type="button" className={`write-bubble-btn${editor.isActive('blockquote') ? ' is-active' : ''}`} onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleBlockquote().run() }} title="Blockquote">&#8220;</button>
              <button type="button" className={`write-bubble-btn${editor.isActive('bulletList') ? ' is-active' : ''}`} onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleBulletList().run() }} title="Bullet list">&#8226;&#8201;&#8213;</button>
            </div>
          </BubbleMenu>
        )}

        {/* Floating "+" on empty lines — Medium-style circular action buttons */}
        {editor && (
          <FloatingMenu editor={editor} tippyOptions={{ duration: 80, placement: 'left', offset: [-4, 16] }}>
            <div className="float-wrap">

              {/* Toggle + / × */}
              <button
                type="button"
                className={`float-plus${menuOpen ? ' is-open' : ''}`}
                onClick={toggleMenu}
                title={menuOpen ? 'Close' : 'Add content'}
              >+</button>

              {/* Action row — slides in when open */}
              {menuOpen && (
                <div className="float-actions">

                  {/* 1 — Image (upload + URL) */}
                  <button
                    type="button"
                    className={`float-action${activePanel === 'image' ? ' is-active' : ''}`}
                    title="Insert image"
                    onClick={() => openPanel('image')}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                      <rect x="3" y="3" width="18" height="18" rx="2"/>
                      <path d="M3 15l5-5 4 4 3-3 6 6"/>
                      <circle cx="8.5" cy="8.5" r="1.5"/>
                    </svg>
                  </button>

                  {/* 2 — Direct upload shortcut */}
                  <button
                    type="button"
                    className="float-action"
                    title="Upload file"
                    onClick={() => { fileInputRef.current?.click() }}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                      <rect x="4" y="4" width="16" height="16" rx="2"/>
                      <path d="M9 12h6M12 9v6"/>
                    </svg>
                  </button>

                  {/* 3 — Video / YouTube embed */}
                  <button
                    type="button"
                    className={`float-action${activePanel === 'video' ? ' is-active' : ''}`}
                    title="Embed video"
                    onClick={() => openPanel('video')}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                      <rect x="2" y="5" width="20" height="14" rx="2"/>
                      <polygon points="10 9 16 12 10 15" fill="currentColor" stroke="none"/>
                    </svg>
                  </button>

                  {/* 4 — Code block < > */}
                  <button
                    type="button"
                    className={`float-action${editor.isActive('codeBlock') ? ' is-active' : ''}`}
                    title="Code block"
                    onClick={insertCodeBlock}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                      <polyline points="8 6 2 12 8 18"/>
                      <polyline points="16 6 22 12 16 18"/>
                    </svg>
                  </button>

                  {/* 5 — Blockquote { } */}
                  <button
                    type="button"
                    className={`float-action${editor.isActive('blockquote') ? ' is-active' : ''}`}
                    title="Pull quote"
                    onClick={insertBlockquote}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                      <path d="M8 3H7a2 2 0 00-2 2v4a2 2 0 002 2h1v2a2 2 0 01-2 2H4"/>
                      <path d="M16 3h-1a2 2 0 00-2 2v4a2 2 0 002 2h1v2a2 2 0 01-2 2h-1"/>
                    </svg>
                  </button>

                  {/* 6 — Divider ··· */}
                  <button
                    type="button"
                    className="float-action"
                    title="Insert divider"
                    onClick={insertDivider}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                      <circle cx="5"  cy="12" r="1.2" fill="currentColor"/>
                      <circle cx="12" cy="12" r="1.2" fill="currentColor"/>
                      <circle cx="19" cy="12" r="1.2" fill="currentColor"/>
                    </svg>
                  </button>

                </div>
              )}

              {/* ── Image sub-panel ── */}
              {menuOpen && activePanel === 'image' && (
                <div className="float-image-sub">
                  <button type="button" className="float-image-upload" onClick={() => { fileInputRef.current?.click() }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                      <polyline points="17 8 12 3 7 8"/>
                      <line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                    Upload
                  </button>
                  <div className="float-image-divider" />
                  <div className="float-url-row">
                    <input
                      autoFocus
                      type="url"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="Paste image URL…"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') { e.preventDefault(); insertImageByUrl() }
                        if (e.key === 'Escape') closeMenu()
                      }}
                    />
                    <button type="button" className="float-url-go" onClick={insertImageByUrl}>↵</button>
                    <button type="button" className="float-url-close" onClick={closeMenu}>✕</button>
                  </div>
                </div>
              )}

              {/* ── Video sub-panel ── */}
              {menuOpen && activePanel === 'video' && (
                <div className="float-image-sub">
                  <div className="float-url-row float-url-row--wide">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" style={{ flexShrink: 0, color: 'var(--muted)' }}>
                      <rect x="2" y="5" width="20" height="14" rx="2"/>
                      <polygon points="10 9 16 12 10 15" fill="currentColor" stroke="none"/>
                    </svg>
                    <input
                      autoFocus
                      type="url"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      placeholder="YouTube or Vimeo URL…"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') { e.preventDefault(); insertVideo() }
                        if (e.key === 'Escape') closeMenu()
                      }}
                    />
                    <button type="button" className="float-url-go" onClick={insertVideo}>↵</button>
                    <button type="button" className="float-url-close" onClick={closeMenu}>✕</button>
                  </div>
                </div>
              )}

            </div>
          </FloatingMenu>
        )}

        <EditorContent editor={editor} className="write-body" />
      </div>

      {/* ── Submit footer ─────────────────────────────────────────────────── */}
      <div className="write-footer">
        {error && <p className="field-error" style={{ marginBottom: 16 }}>{error}</p>}
        <div className="write-submit-row">
          <button type="submit" className="btn-ghost" disabled={isPending || uploading}>
            {isPending ? 'SUBMITTING…' : 'SUBMIT FOR REVIEW'}
          </button>
          <p className="write-note">All submissions are reviewed by our editorial team before publishing.</p>
        </div>
      </div>

    </form>
  )
}
