'use client'

import { createLogger } from '@/lib/logger'

const logger = createLogger('NewsletterForm')

export function NewsletterForm() {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const email = (e.currentTarget.elements.namedItem('email') as HTMLInputElement).value
    logger.info('Newsletter signup submitted', { email })
    // TODO: wire up to email service (Resend, Mailchimp, etc.)
    alert('Thank you for subscribing!')
  }

  return (
    <form className="newsletter-form" onSubmit={handleSubmit}>
      <input
        type="email"
        name="email"
        placeholder="Your email address"
        aria-label="Email address"
        required
      />
      <button type="submit">SUBSCRIBE</button>
    </form>
  )
}
