import Link from 'next/link'

const SECTIONS = [
  { label: 'Tech', href: '/tech' },
  { label: 'Culture', href: '/culture' },
  { label: 'Fashion', href: '/fashion' },
  { label: 'Show-Business', href: '/showbusiness' },
  { label: 'Leaders Stories', href: '/leaders' },
]

const LEGAL = [
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Use', href: '/terms' },
  { label: 'Cookie Policy', href: '/cookies' },
  { label: 'Accessibility', href: '/accessibility' },
]

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div>
          <p className="brand-mark--footer">C&apos;EST FORT</p>
          <p className="footer-tagline">Tech, Culture &amp; The New Luxury</p>
        </div>

        <div>
          <p className="footer-heading">SECTIONS</p>
          <ul className="footer-list">
            {SECTIONS.map(({ label, href }) => (
              <li key={href}>
                <Link href={href}>{label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="footer-heading">LEGAL</p>
          <ul className="footer-list">
            {LEGAL.map(({ label, href }) => (
              <li key={href}>
                <Link href={href}>{label}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <hr className="footer-rule" />
      <p className="copyright">© {year} C&apos;est Fort Magazine. All rights reserved.</p>
    </footer>
  )
}
