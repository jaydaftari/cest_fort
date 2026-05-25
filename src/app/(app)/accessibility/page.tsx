import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: "Accessibility — C'est Fort",
}

export default function AccessibilityPage() {
  return (
    <div className="prose-page">
      <div className="prose-shell">
        <Link className="cat-back" href="/">
          ← HOME
        </Link>

        <header className="prose-header">
          <p className="eyebrow">LEGAL</p>
          <h1 className="prose-title">Accessibility</h1>
          <p className="prose-dek">Our commitment to an inclusive reading experience.</p>
        </header>

        <hr className="prose-rule" />

        <div className="prose-body">
          <h2>Our Commitment</h2>
          <p>
            C&apos;est Fort is committed to making our content accessible to everyone, including
            people with disabilities. We aim to meet WCAG 2.1 Level AA guidelines and continuously
            improve the accessibility of our site.
          </p>

          <h2>What We Do</h2>
          <p>
            All images include descriptive alt text. Our site can be navigated using a keyboard
            alone. We use semantic HTML so that screen readers can accurately convey the structure
            of our content. Colour contrast ratios meet or exceed WCAG AA requirements.
          </p>
          <p>
            Our typography is set at readable sizes with generous line spacing. Content can be
            resized up to 200% without loss of functionality.
          </p>

          <h2>Known Limitations</h2>
          <p>
            Some third-party embedded content — such as video players — may not fully meet our
            accessibility standards. We are working to address these gaps.
          </p>
          <p>
            The rich text editor used in our article submission form may not be fully accessible to
            all screen readers. Contributors who require an alternative submission method are
            welcome to contact us directly.
          </p>

          <h2>Feedback</h2>
          <p>
            If you encounter any accessibility barriers on this site, please tell us. Your feedback
            helps us improve. Write to{' '}
            <a href="mailto:accessibility@cestfort.com">accessibility@cestfort.com</a> and we will
            respond within five business days.
          </p>

          <h2>Further Resources</h2>
          <p>
            For general guidance on web accessibility, visit the{' '}
            <a href="https://www.w3.org/WAI/" target="_blank" rel="noopener noreferrer">
              Web Accessibility Initiative (W3C WAI)
            </a>
            .
          </p>

          <p style={{ marginTop: 40 }}>
            <Link href="/">← Return to C&apos;est Fort</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
