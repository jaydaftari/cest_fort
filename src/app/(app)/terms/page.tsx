import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: "Terms of Use — C'est Fort",
}

export default function TermsPage() {
  return (
    <div className="prose-page">
      <div className="prose-shell">
        <Link className="cat-back" href="/">
          ← HOME
        </Link>

        <header className="prose-header">
          <p className="eyebrow">LEGAL</p>
          <h1 className="prose-title">Terms of Use</h1>
          <p className="prose-dek">Last updated: January 2025</p>
        </header>

        <hr className="prose-rule" />

        <div className="prose-body">
          <h2>Using This Site</h2>
          <p>
            By accessing C&apos;est Fort, you agree to these terms. We reserve the right to update
            them at any time. Continued use of the site constitutes acceptance of any changes.
          </p>

          <h2>Content Ownership</h2>
          <p>
            All editorial content published on C&apos;est Fort — text, photography, design — is the
            property of C&apos;est Fort or the respective contributor. You may not reproduce,
            republish, or distribute our content without written permission, except for brief
            quotations with attribution and a link to the original article.
          </p>

          <h2>Contributor Submissions</h2>
          <p>
            By submitting an article, you confirm that the work is original and that you hold the
            rights to it. You grant C&apos;est Fort a non-exclusive licence to publish, edit, and
            distribute the work. You retain authorship and ownership of your work.
          </p>
          <p>
            We reserve the right to decline any submission, or to request edits before publication,
            at our editorial discretion.
          </p>

          <h2>Prohibited Use</h2>
          <p>
            You may not use this site to distribute spam, malware, or illegal content. You may not
            attempt to circumvent any security measures or access systems you are not authorised to
            use.
          </p>

          <h2>Disclaimer</h2>
          <p>
            Articles and opinions published on C&apos;est Fort represent the views of individual
            contributors and do not constitute professional legal, financial, or medical advice.
          </p>

          <h2>Contact</h2>
          <p>
            Questions about these terms should be directed to{' '}
            <a href="mailto:legal@cestfort.com">legal@cestfort.com</a>.
          </p>
        </div>
      </div>
    </div>
  )
}
