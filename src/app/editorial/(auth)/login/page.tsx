'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function EditorialLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      })
      const data = (await res.json()) as { errors?: { message: string }[] }
      if (!res.ok) throw new Error(data.errors?.[0]?.message ?? 'Invalid credentials.')
      router.push('/editorial')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,wght@0,400..900;1,400..900&family=Hanken+Grotesk:ital,wght@0,100..900;1,100..900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #f9f9f9; color: #1a1c1c; font-family: 'Hanken Grotesk', sans-serif; }
        .cf-input {
          width: 100%;
          background: transparent;
          border: none;
          border-bottom: 1px solid #cfc4c5;
          padding: 12px 0;
          font-family: 'Hanken Grotesk', sans-serif;
          font-size: 16px;
          color: #1a1c1c;
          transition: border-color 0.2s;
          outline: none;
        }
        .cf-input:focus { border-bottom: 2px solid #000; }
        .cf-input::placeholder { color: #cfc4c5; }
      `}</style>

      <div
        style={{
          minHeight: '100dvh',
          display: 'flex',
          flexDirection: 'column',
          background: '#f9f9f9',
        }}
      >
        {/* ── Top bar ── */}
        <header
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'sticky',
            top: 0,
            zIndex: 50,
            height: 80,
            padding: '0 24px',
            background: '#f9f9f9',
            borderBottom: '1px solid #cfc4c5',
          }}
        >
          <h1
            style={{
              fontFamily: "'Bodoni Moda', Georgia, serif",
              fontSize: 28,
              fontWeight: 700,
              letterSpacing: '0.16em',
              color: '#000',
              textTransform: 'uppercase',
              userSelect: 'none',
            }}
          >
            C&apos;EST FORT
          </h1>
        </header>

        {/* ── Form ── */}
        <main
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '64px 24px 96px',
          }}
        >
          <div style={{ width: '100%', maxWidth: 440 }}>
            <section style={{ marginBottom: 48 }}>
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  color: '#5d5f5f',
                  marginBottom: 12,
                }}
              >
                Editorial
              </p>
              <h2
                style={{
                  fontFamily: "'Bodoni Moda', Georgia, serif",
                  fontSize: 32,
                  fontWeight: 500,
                  color: '#000',
                  marginBottom: 12,
                }}
              >
                Welcome back.
              </h2>
              <p style={{ fontSize: 16, color: '#5d5f5f', lineHeight: 1.5 }}>
                Sign in to the editorial dashboard.
              </p>
            </section>

            <form
              onSubmit={handleSubmit}
              style={{ display: 'flex', flexDirection: 'column', gap: 40 }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label
                  style={{
                    fontSize: 11,
                    letterSpacing: '0.15em',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    color: '#000',
                  }}
                >
                  EMAIL
                </label>
                <input
                  className="cf-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  autoFocus
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label
                  style={{
                    fontSize: 11,
                    letterSpacing: '0.15em',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    color: '#000',
                  }}
                >
                  PASSWORD
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    className="cf-input"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    style={{ paddingRight: 40 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    style={{
                      position: 'absolute',
                      right: 4,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 4,
                      color: '#5d5f5f',
                      lineHeight: 0,
                    }}
                  >
                    {showPassword ? (
                      /* Eye-off: crossed-out eye */
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      /* Eye: visible */
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {error && <p style={{ fontSize: 13, color: '#ba1a1a', marginTop: -16 }}>{error}</p>}

              <div style={{ paddingTop: 16 }}>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    background: loading ? '#5d5f5f' : '#000',
                    color: '#fff',
                    border: 'none',
                    padding: '20px 0',
                    fontFamily: "'Hanken Grotesk', sans-serif",
                    fontSize: 12,
                    fontWeight: 600,
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'opacity 0.2s',
                  }}
                  onMouseOver={(e) => {
                    if (!loading) e.currentTarget.style.opacity = '0.88'
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.opacity = '1'
                  }}
                >
                  {loading ? 'SIGNING IN…' : 'SIGN IN'}
                </button>
              </div>
            </form>
          </div>
        </main>

        {/* ── Footer ── */}
        <footer
          style={{
            borderTop: '1px solid #cfc4c5',
            padding: '28px 24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12,
            textAlign: 'center',
          }}
        >
          <p
            style={{
              fontSize: 11,
              letterSpacing: '0.12em',
              color: '#5d5f5f',
              textTransform: 'uppercase',
            }}
          >
            © {new Date().getFullYear()} C&apos;EST FORT PUBLICATIONS. ALL RIGHTS RESERVED.
          </p>
        </footer>
      </div>
    </>
  )
}
