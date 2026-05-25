'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createLogger } from '@/lib/logger'

const logger = createLogger('Header')

const NAV_LINKS = [
  { label: 'TECH', href: '/tech' },
  { label: 'CULTURE', href: '/culture' },
  { label: 'FASHION', href: '/fashion' },
  { label: 'SHOW-BUSINESS', href: '/showbusiness' },
  { label: 'LEADERS STORIES', href: '/leaders' },
]

export default function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Focus search input when overlay opens
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50)
    }
  }, [searchOpen])

  // Lock body scroll when drawer or search is open
  useEffect(() => {
    document.body.style.overflow = drawerOpen || searchOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [drawerOpen, searchOpen])

  const openDrawer = () => {
    logger.debug('Opening mobile drawer')
    setDrawerOpen(true)
  }
  const closeDrawer = () => {
    logger.debug('Closing mobile drawer')
    setDrawerOpen(false)
  }
  const openSearch = () => {
    logger.debug('Opening search overlay')
    setSearchOpen(true)
  }
  const closeSearch = () => {
    logger.debug('Closing search overlay')
    setSearchOpen(false)
    setSearchQuery('')
  }

  const handleSearchSubmit = () => {
    const q = searchQuery.trim()
    if (!q) return
    closeSearch()
    router.push(`/search?q=${encodeURIComponent(q)}`)
  }

  return (
    <>
      <header className="site-header" id="siteHeader">
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <div className="header-row">
          <button className="icon-btn menu-btn" aria-label="Open menu" onClick={openDrawer}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
              <line x1="3" y1="7" x2="21" y2="7" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="17" x2="21" y2="17" />
            </svg>
          </button>

          <Link href="/" className="brand-mark">
            C&apos;EST FORT
          </Link>

          <div className="header-actions">
            <button className="icon-btn" aria-label="Search" onClick={openSearch}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                <circle cx="11" cy="11" r="7" />
                <line x1="21" y1="21" x2="16.5" y2="16.5" />
              </svg>
            </button>
            <Link href="/editorial" className="icon-btn" aria-label="Account">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
              </svg>
            </Link>
          </div>
        </div>

        <nav className="primary-nav" aria-label="Primary">
          <ul>
            {NAV_LINKS.map(({ label, href }) => (
              <li key={href}>
                <Link
                  href={href}
                  className={
                    pathname === href || pathname.startsWith(`${href}/`) ? 'is-active' : ''
                  }
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      {/* ── Mobile drawer ─────────────────────────────────── */}
      <div
        className={`drawer${drawerOpen ? ' is-open' : ''}`}
        aria-hidden={!drawerOpen}
        onClick={(e) => {
          if (e.target === e.currentTarget) closeDrawer()
        }}
      >
        <div className="drawer-panel">
          <button className="icon-btn drawer-close" aria-label="Close menu" onClick={closeDrawer}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
              <line x1="6" y1="6" x2="18" y2="18" />
              <line x1="18" y1="6" x2="6" y2="18" />
            </svg>
          </button>

          <p className="drawer-eyebrow">SECTIONS</p>
          <ul className="drawer-nav">
            {NAV_LINKS.map(({ label, href }) => (
              <li key={href}>
                <Link href={href} onClick={closeDrawer}>
                  {label}
                </Link>
              </li>
            ))}
          </ul>

          <p className="drawer-eyebrow">THE MAGAZINE</p>
          <ul className="drawer-nav drawer-nav--small">
            <li>
              <Link href="/submit" onClick={closeDrawer}>
                Submit a Story
              </Link>
            </li>
            <li>
              <Link href="/about" onClick={closeDrawer}>
                About
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* ── Search overlay ────────────────────────────────── */}
      <div
        className={`search-overlay${searchOpen ? ' is-open' : ''}`}
        aria-hidden={!searchOpen}
        onClick={(e) => {
          if (e.target === e.currentTarget) closeSearch()
        }}
      >
        <button className="icon-btn search-close" aria-label="Close search" onClick={closeSearch}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
            <line x1="6" y1="6" x2="18" y2="18" />
            <line x1="18" y1="6" x2="6" y2="18" />
          </svg>
        </button>
        <div className="search-inner">
          <p className="search-eyebrow">SEARCH THE ARCHIVE</p>
          <div className="search-field">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.5" y2="16.5" />
            </svg>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Stories, contributors, topics…"
              autoComplete="off"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') closeSearch()
                if (e.key === 'Enter') handleSearchSubmit()
              }}
            />
          </div>
          <p className="search-hint">
            Try{' '}
            <Link href="/tech" onClick={closeSearch}>
              tech
            </Link>
            ,{' '}
            <Link href="/culture" onClick={closeSearch}>
              culture
            </Link>
            , or{' '}
            <Link href="/leaders" onClick={closeSearch}>
              leaders stories
            </Link>
          </p>
        </div>
      </div>
    </>
  )
}
