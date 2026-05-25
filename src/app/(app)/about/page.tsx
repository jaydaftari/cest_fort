import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: "About — C'est Fort",
  description:
    "C'est Fort is an independent magazine at the intersection of technology, culture, and refined living.",
}

export default function AboutPage() {
  return (
    <div className="prose-page">
      <div className="prose-shell">
        <Link className="cat-back" href="/">
          ← HOME
        </Link>

        <header className="prose-header">
          <p className="eyebrow">THE MAGAZINE</p>
          <h1 className="prose-title">About C&apos;est Fort</h1>
          <p className="prose-dek">
            An independent voice at the intersection of technology, culture, and the new luxury.
          </p>
        </header>

        <hr className="prose-rule" />

        <div className="prose-body">
          <h2>Our Mission</h2>
          <p>
            C&apos;est Fort was founded on a simple conviction: that the most interesting ideas
            exist at the crossroads of disciplines. We publish writing about technology and its
            cultural consequences, about fashion as a lens on society, about the founders and
            executives remaking the world — and about the refined life that surrounds all of it.
          </p>
          <p>
            We believe great journalism demands great design. Every story we publish is given the
            space and craft it deserves. We do not chase clicks. We pursue understanding.
          </p>

          <h2>What We Cover</h2>
          <p>
            <strong>Tech</strong> — Not gadgets for their own sake, but technology as a force that
            reshapes how we work, communicate, and create meaning. AI, infrastructure, product
            culture, the ethics of innovation.
          </p>
          <p>
            <strong>Culture</strong> — Art, film, music, architecture, and the ideas that animate
            them. We are particularly interested in where culture and technology collide.
          </p>
          <p>
            <strong>Fashion</strong> — Clothing as communication. The aesthetic decisions of
            designers, the business of luxury houses, and the way what we wear reflects who we are
            becoming.
          </p>
          <p>
            <strong>Show-Business</strong> — Entertainment in its broadest sense: cinema,
            television, performance, and the machinery that produces it.
          </p>
          <p>
            <strong>Leaders Stories</strong> — Founders, executives, and the rare individuals who
            build organisations worth examining. First-person perspectives and in-depth profiles.
          </p>

          <h2>Submissions</h2>
          <p>
            C&apos;est Fort is open to contributors. If you have a story that fits our editorial
            scope, we would like to read it. All submissions are reviewed by our editorial team
            before publication. There is no fee to submit, and we will respond to every pitch.
          </p>
          <p>
            <Link href="/submit">Submit a story →</Link>
          </p>

          <h2>Contact</h2>
          <p>
            For editorial inquiries, partnership proposals, or press matters, reach us at{' '}
            <a href="mailto:editorial@cestfort.com">editorial@cestfort.com</a>.
          </p>
        </div>
      </div>
    </div>
  )
}
