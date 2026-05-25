'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
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
      router.push('/admin')
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
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400&family=Syne:wght@400;500;600;700;800&display=swap');

        *, *::before, *::after {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        html, body {
          height: 100%;
          background: #0d0b09;
        }

        .login-root {
          min-height: 100dvh;
          display: grid;
          grid-template-columns: 1fr 480px;
          font-family: 'Syne', system-ui, sans-serif;
          -webkit-font-smoothing: antialiased;
        }

        /* ── Left panel ── */
        .login-cover {
          position: relative;
          background: #0d0b09;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          justify-content: flex-end;
          padding: 64px;
          overflow: hidden;
        }

        .login-cover::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 80% 60% at 30% 70%, rgba(184,144,46,0.08) 0%, transparent 70%),
            radial-gradient(ellipse 60% 80% at 70% 20%, rgba(255,253,248,0.03) 0%, transparent 60%);
          pointer-events: none;
        }

        /* Grain texture */
        .login-cover::after {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.035'/%3E%3C/svg%3E");
          background-size: 200px 200px;
          opacity: 0.4;
          pointer-events: none;
        }

        .cover-wordmark {
          position: relative;
          z-index: 1;
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: clamp(64px, 8vw, 112px);
          font-weight: 300;
          letter-spacing: 0.14em;
          line-height: 0.9;
          color: #fffdf8;
          text-transform: uppercase;
          margin-bottom: 32px;
        }

        .cover-wordmark em {
          display: block;
          font-style: italic;
          font-weight: 300;
          color: rgba(255,253,248,0.55);
          font-size: 0.52em;
          letter-spacing: 0.22em;
          margin-bottom: 8px;
        }

        .cover-rule {
          position: relative;
          z-index: 1;
          width: 48px;
          height: 1px;
          background: #b8902e;
          margin-bottom: 24px;
        }

        .cover-tagline {
          position: relative;
          z-index: 1;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: rgba(255,253,248,0.3);
        }

        /* Issue marker top-right */
        .cover-issue {
          position: absolute;
          top: 48px;
          right: 48px;
          z-index: 1;
          text-align: right;
        }
        .cover-issue span {
          display: block;
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 13px;
          font-style: italic;
          color: rgba(255,253,248,0.22);
          line-height: 1.6;
        }

        /* ── Right panel ── */
        .login-panel {
          background: #fffdf8;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 64px 56px;
          position: relative;
        }

        .login-panel::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 1px;
          height: 100%;
          background: linear-gradient(
            to bottom,
            transparent,
            rgba(184,144,46,0.4) 30%,
            rgba(184,144,46,0.4) 70%,
            transparent
          );
        }

        .login-eyebrow {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: #b8902e;
          margin-bottom: 20px;
        }

        .login-heading {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 38px;
          font-weight: 400;
          color: #0d0b09;
          line-height: 1.1;
          margin-bottom: 10px;
          letter-spacing: 0.01em;
        }

        .login-sub {
          font-size: 13px;
          color: #8c8778;
          line-height: 1.5;
          margin-bottom: 48px;
          font-weight: 400;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .login-field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .login-label {
          font-size: 9.5px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #0d0b09;
        }

        .login-input {
          width: 100%;
          background: transparent;
          border: none;
          border-bottom: 1px solid #ddd8ce;
          padding: 12px 0;
          font-family: 'Syne', system-ui, sans-serif;
          font-size: 15px;
          font-weight: 400;
          color: #0d0b09;
          transition: border-color 0.2s;
          outline: none;
        }
        .login-input:focus { border-bottom-color: #0d0b09; }
        .login-input::placeholder { color: #c8c2b8; }

        .login-pw-wrap {
          position: relative;
        }
        .login-pw-wrap .login-input {
          padding-right: 36px;
        }
        .login-pw-toggle {
          position: absolute;
          right: 0;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
          color: #8c8778;
          line-height: 0;
          transition: color 0.15s;
        }
        .login-pw-toggle:hover { color: #0d0b09; }

        .login-error {
          font-size: 12px;
          color: #b41c1c;
          margin-top: -16px;
          font-weight: 500;
        }

        .login-btn {
          width: 100%;
          background: #0d0b09;
          color: #fffdf8;
          border: none;
          padding: 18px 0;
          font-family: 'Syne', system-ui, sans-serif;
          font-size: 10.5px;
          font-weight: 700;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          cursor: pointer;
          transition: background 0.2s, transform 0.1s;
          margin-top: 8px;
          position: relative;
          overflow: hidden;
        }
        .login-btn::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(184,144,46,0.15), transparent 60%);
          opacity: 0;
          transition: opacity 0.3s;
        }
        .login-btn:hover:not(:disabled)::after { opacity: 1; }
        .login-btn:hover:not(:disabled) { background: #1e1b17; }
        .login-btn:active:not(:disabled) { transform: translateY(1px); }
        .login-btn:disabled { opacity: 0.55; cursor: not-allowed; }

        .login-footer {
          position: absolute;
          bottom: 36px;
          left: 56px;
          right: 56px;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .login-footer-rule {
          flex: 1;
          height: 1px;
          background: #eae6de;
        }
        .login-footer-text {
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #c8c2b8;
          white-space: nowrap;
        }

        /* ── Responsive ── */
        @media (max-width: 800px) {
          .login-root { grid-template-columns: 1fr; }
          .login-cover { display: none; }
          .login-panel {
            padding: 56px 32px;
            min-height: 100dvh;
            justify-content: center;
          }
          .login-panel::before { display: none; }
          .login-footer { left: 32px; right: 32px; }
        }
      `}</style>

      <div className="login-root">
        {/* ── Left: editorial cover ── */}
        <div className="login-cover">
          <div className="cover-issue">
            <span>Editorial CMS</span>
            <span>Private Access</span>
          </div>

          <div className="cover-wordmark">
            <em>C&apos;est</em>
            Fort
          </div>
          <div className="cover-rule" />
          <p className="cover-tagline">The Magazine — Paris</p>
        </div>

        {/* ── Right: login form ── */}
        <div className="login-panel">
          <p className="login-eyebrow">Editorial Access</p>
          <h1 className="login-heading">
            Welcome
            <br />
            back.
          </h1>
          <p className="login-sub">Sign in to the content studio.</p>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="login-field">
              <label className="login-label">Email</label>
              <input
                className="login-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                autoFocus
                placeholder="you@cestfort.com"
              />
            </div>

            <div className="login-field">
              <label className="login-label">Password</label>
              <div className="login-pw-wrap">
                <input
                  className="login-input"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="login-pw-toggle"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
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

            {error && <p className="login-error">{error}</p>}

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? 'Signing in…' : 'Enter the studio'}
            </button>
          </form>

          <div className="login-footer">
            <div className="login-footer-rule" />
            <span className="login-footer-text">
              © {new Date().getFullYear()} C&apos;est Fort Publications
            </span>
            <div className="login-footer-rule" />
          </div>
        </div>
      </div>
    </>
  )
}
