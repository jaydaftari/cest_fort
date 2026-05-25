import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: "Cookie Policy — C'est Fort",
}

export default function CookiesPage() {
  return (
    <div className="prose-page">
      <div className="prose-shell">
        <Link className="cat-back" href="/">
          ← HOME
        </Link>

        <header className="prose-header">
          <p className="eyebrow">LEGAL</p>
          <h1 className="prose-title">Cookie Policy</h1>
          <p className="prose-dek">Last updated: January 2025</p>
        </header>

        <hr className="prose-rule" />

        <div className="prose-body">
          <h2>What Are Cookies</h2>
          <p>
            Cookies are small text files stored on your device when you visit a website. They help
            the site remember your preferences and understand how you interact with its content.
          </p>

          <h2>Cookies We Use</h2>
          <p>
            <strong>Essential cookies</strong> — These are required for the site to function. They
            include session identifiers for authenticated editors and security tokens. You cannot
            opt out of essential cookies while using the site.
          </p>
          <p>
            <strong>Analytics cookies</strong> — We use aggregated, anonymised analytics to
            understand which content resonates with our readers. No individual is tracked. No data
            is shared with advertising networks.
          </p>

          <h2>What We Do Not Use</h2>
          <p>
            We do not use advertising cookies, retargeting pixels, or any cross-site tracking
            technologies. We do not build profiles of individual users for commercial purposes.
          </p>

          <h2>Managing Cookies</h2>
          <p>
            You can control cookies through your browser settings. Note that disabling essential
            cookies will prevent some site features (such as editorial login) from working
            correctly.
          </p>
          <p>
            For more information about managing cookies, visit{' '}
            <a href="https://www.allaboutcookies.org" target="_blank" rel="noopener noreferrer">
              allaboutcookies.org
            </a>
            .
          </p>

          <h2>Contact</h2>
          <p>
            Cookie-related questions: <a href="mailto:privacy@cestfort.com">privacy@cestfort.com</a>
            . Also see our <Link href="/privacy">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  )
}
