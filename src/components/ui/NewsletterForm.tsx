'use client'

import { useState, useTransition } from 'react'
import { subscribeNewsletter } from '@/actions/subscribeNewsletter'
import { createLogger } from '@/lib/logger'

const logger = createLogger('NewsletterForm')

export function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<'idle' | 'success' | 'duplicate' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!email.trim()) return

    logger.info('Newsletter signup submitted', { email })
    setErrorMsg('')
    setState('idle')

    startTransition(async () => {
      const result = await subscribeNewsletter(email)
      if (result.success) {
        setState(result.alreadySubscribed ? 'duplicate' : 'success')
        setEmail('')
      } else {
        setState('error')
        setErrorMsg(result.error)
      }
    })
  }

  if (state === 'success') {
    return (
      <div role="status" aria-live="polite" aria-atomic="true" className="newsletter-success">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          width="24"
          height="24"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
        <p>You&apos;re in. Welcome to the circle.</p>
        <p className="newsletter-success-sub">Check your inbox for a welcome note from us.</p>
      </div>
    )
  }

  return (
    <form className="newsletter-form" onSubmit={handleSubmit}>
      <input
        type="email"
        name="email"
        placeholder="Your email address"
        aria-label="Email address"
        required
        value={email}
        onChange={(e) => {
          setEmail(e.target.value)
          setState('idle')
        }}
        disabled={isPending}
      />
      <button type="submit" disabled={isPending || !email.trim()}>
        {isPending ? '…' : 'SUBSCRIBE'}
      </button>

      <div role="status" aria-live="polite" aria-atomic="true">
        {state === 'duplicate' && (
          <p className="newsletter-hint newsletter-hint--ok">
            You&apos;re already subscribed — we&apos;ll keep the issues coming.
          </p>
        )}
        {state === 'error' && <p className="newsletter-hint newsletter-hint--err">{errorMsg}</p>}
      </div>
    </form>
  )
}
