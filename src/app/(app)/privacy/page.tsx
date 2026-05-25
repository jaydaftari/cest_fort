import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: "Privacy Policy — C'est Fort",
}

export default function PrivacyPage() {
  return (
    <div className="prose-page">
      <div className="prose-shell">
        <Link className="cat-back" href="/">
          ← HOME
        </Link>

        <header className="prose-header">
          <p className="eyebrow">LEGAL</p>
          <h1 className="prose-title">Privacy Policy</h1>
          <p className="prose-dek">Last updated: January 2025</p>
        </header>

        <hr className="prose-rule" />

        <div className="prose-body">
          <h2>What We Collect</h2>
          <p>
            When you subscribe to our newsletter, we collect your email address. When you submit an
            article, we collect your name, email address, and the content you provide. We do not
            sell or share this data with third parties for marketing purposes.
          </p>

          <h2>How We Use Your Data</h2>
          <p>
            Newsletter subscribers receive our weekly editorial digest. You may unsubscribe at any
            time via the link in every email. Article submission data is used solely to communicate
            with contributors about their work.
          </p>
          <p>
            We use analytics to understand how our content is read. This data is aggregated and
            anonymised; we do not track individuals across the web.
          </p>

          <h2>Cookies</h2>
          <p>
            We use essential cookies to operate the site. We do not use advertising trackers or
            cross-site tracking cookies. For more detail, see our{' '}
            <Link href="/cookies">Cookie Policy</Link>.
          </p>

          <h2>Data Retention</h2>
          <p>
            Newsletter subscriber data is retained for as long as your subscription is active. You
            may request deletion of your data at any time by writing to us at{' '}
            <a href="mailto:privacy@cestfort.com">privacy@cestfort.com</a>.
          </p>

          <h2>Your Rights</h2>
          <p>
            You have the right to access, correct, or delete your personal data. You also have the
            right to object to or restrict our processing of your data. To exercise any of these
            rights, contact us at <a href="mailto:privacy@cestfort.com">privacy@cestfort.com</a>.
          </p>

          <h2>Contact</h2>
          <p>
            For any privacy-related questions, write to{' '}
            <a href="mailto:privacy@cestfort.com">privacy@cestfort.com</a>.
          </p>
        </div>
      </div>
    </div>
  )
}
