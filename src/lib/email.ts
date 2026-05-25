import { Resend } from 'resend'
import { createLogger } from './logger'

const logger = createLogger('Email')

// Lazily initialised so the module doesn't blow up when RESEND_API_KEY is absent
let _resend: Resend | null = null
function getResend(): Resend {
  if (!_resend) {
    const key = process.env.RESEND_API_KEY
    if (!key) throw new Error('RESEND_API_KEY is not set in environment variables.')
    _resend = new Resend(key)
  }
  return _resend
}

const EDITORIAL_EMAIL = process.env.EDITORIAL_EMAIL ?? 'editorial@cestfort.com'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
const FROM_ADDRESS = process.env.EMAIL_FROM ?? "C'est Fort <noreply@cestfort.com>"

// ── New submission alert ─────────────────────────────────────────────────────
type SubmissionAlertProps = {
  articleId: string
  title: string
  authorName: string
  authorEmail: string
  categoryName?: string
  dek?: string
}

export async function sendSubmissionAlert(props: SubmissionAlertProps): Promise<void> {
  const { articleId, title, authorName, authorEmail, categoryName, dek } = props
  const adminUrl = `${APP_URL}/admin/collections/articles/${articleId}`

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New submission — C'est Fort</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #f5f2ee; font-family: Georgia, 'Times New Roman', serif; color: #1a1814; }
    .wrap { max-width: 580px; margin: 40px auto; background: #fffdf9; border: 1px solid #e0dbd3; }
    .masthead { background: #1a1814; padding: 28px 40px; text-align: center; }
    .masthead-name { font-size: 28px; letter-spacing: 0.1em; color: #fffdf9; font-weight: 500; }
    .masthead-rule { width: 40px; height: 1px; background: #b8975a; margin: 10px auto 6px; }
    .masthead-sub { font-size: 10px; letter-spacing: 0.2em; color: #a09b93; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; text-transform: uppercase; }
    .body { padding: 36px 40px; }
    .label { font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; color: #a09b93; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin-bottom: 6px; }
    .headline { font-size: 26px; font-weight: 700; line-height: 1.2; margin-bottom: 10px; }
    .dek { font-size: 16px; color: #5a5650; line-height: 1.5; margin-bottom: 28px; font-style: italic; }
    .rule { border: none; border-top: 1px solid #e0dbd3; margin: 24px 0; }
    .meta-row { display: flex; gap: 8px; margin-bottom: 12px; align-items: baseline; }
    .meta-key { font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: #a09b93; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; min-width: 80px; }
    .meta-val { font-size: 15px; color: #1a1814; }
    .cta { margin-top: 32px; text-align: center; }
    .cta a { display: inline-block; background: #1a1814; color: #fffdf9 !important; text-decoration: none; padding: 14px 32px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; }
    .footer { padding: 20px 40px; border-top: 1px solid #e0dbd3; text-align: center; }
    .footer p { font-size: 12px; color: #a09b93; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="masthead">
      <div class="masthead-name">C'EST FORT</div>
      <div class="masthead-rule"></div>
      <div class="masthead-sub">Editorial Notification</div>
    </div>

    <div class="body">
      <p class="label">New story submission</p>
      <h1 class="headline">${escapeHtml(title)}</h1>
      ${dek ? `<p class="dek">${escapeHtml(dek)}</p>` : ''}

      <hr class="rule" />

      <div class="meta-row">
        <span class="meta-key">Author</span>
        <span class="meta-val">${escapeHtml(authorName)}</span>
      </div>
      <div class="meta-row">
        <span class="meta-key">Email</span>
        <span class="meta-val">${escapeHtml(authorEmail)}</span>
      </div>
      ${
        categoryName
          ? `
      <div class="meta-row">
        <span class="meta-key">Section</span>
        <span class="meta-val">${escapeHtml(categoryName)}</span>
      </div>`
          : ''
      }
      <div class="meta-row">
        <span class="meta-key">Status</span>
        <span class="meta-val">Awaiting review</span>
      </div>

      <div class="cta">
        <a href="${adminUrl}">Review in Admin Panel</a>
      </div>
    </div>

    <div class="footer">
      <p>This is an automated notification from C'est Fort Magazine.<br />
      Review, edit, and publish submissions at <a href="${APP_URL}/admin">${APP_URL}/admin</a></p>
    </div>
  </div>
</body>
</html>
`

  try {
    const resend = getResend()
    const { data, error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: EDITORIAL_EMAIL,
      subject: `New submission: "${title}" — ${authorName}`,
      html,
      replyTo: authorEmail,
    })

    if (error) {
      logger.error('Resend error sending submission alert', { error })
    } else {
      logger.info('Submission alert sent', { emailId: data?.id, to: EDITORIAL_EMAIL })
    }
  } catch (err) {
    // Email failure must never break the submission itself
    logger.error('Failed to send submission alert', {
      error: err instanceof Error ? err.message : String(err),
    })
  }
}

// ── Newsletter welcome email ─────────────────────────────────────────────────
type WelcomeEmailProps = {
  email: string
  unsubscribeToken: string
}

export async function sendWelcomeEmail(props: WelcomeEmailProps): Promise<void> {
  const { email, unsubscribeToken } = props
  const unsubscribeUrl = `${APP_URL}/unsubscribe?token=${encodeURIComponent(unsubscribeToken)}`

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to C'est Fort</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #f5f2ee; font-family: Georgia, 'Times New Roman', serif; color: #1a1814; }
    .wrap { max-width: 580px; margin: 40px auto; background: #fffdf9; border: 1px solid #e0dbd3; }
    .masthead { background: #1a1814; padding: 32px 40px; text-align: center; }
    .masthead-name { font-size: 30px; letter-spacing: 0.1em; color: #fffdf9; font-weight: 500; }
    .masthead-rule { width: 40px; height: 1px; background: #b8975a; margin: 12px auto 8px; }
    .masthead-sub { font-size: 10px; letter-spacing: 0.22em; color: #a09b93; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; text-transform: uppercase; }
    .body { padding: 40px 40px 32px; }
    .greeting { font-size: 26px; font-weight: 500; line-height: 1.25; margin-bottom: 20px; }
    .copy { font-size: 16px; color: #5a5650; line-height: 1.7; margin-bottom: 16px; }
    .rule { border: none; border-top: 1px solid #e0dbd3; margin: 28px 0; }
    .section-label { font-size: 9px; letter-spacing: 0.24em; text-transform: uppercase; color: #a09b93; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin-bottom: 12px; }
    .pill-row { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 28px; }
    .pill { display: inline-block; padding: 5px 12px; border: 1px solid #e0dbd3; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase; color: #5a5650; text-decoration: none; }
    .cta { text-align: center; margin: 8px 0 8px; }
    .cta a { display: inline-block; background: #1a1814; color: #fffdf9 !important; text-decoration: none; padding: 14px 36px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; }
    .footer { padding: 20px 40px 24px; border-top: 1px solid #e0dbd3; text-align: center; }
    .footer p { font-size: 11px; color: #a09b93; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.7; }
    .footer a { color: #a09b93; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="masthead">
      <div class="masthead-name">C'EST FORT</div>
      <div class="masthead-rule"></div>
      <div class="masthead-sub">Tech, Culture &amp; The New Luxury</div>
    </div>

    <div class="body">
      <p class="greeting">Welcome to the circle.</p>
      <p class="copy">
        You are now among the most discerning readers on the internet. Each week
        we deliver curated insights on technology, culture, fashion, and refined living —
        written with precision and presented with care.
      </p>
      <p class="copy">
        Here is what awaits you.
      </p>

      <hr class="rule" />

      <p class="section-label">Our sections</p>
      <div class="pill-row">
        <a class="pill" href="${APP_URL}/tech">Tech</a>
        <a class="pill" href="${APP_URL}/culture">Culture</a>
        <a class="pill" href="${APP_URL}/fashion">Fashion</a>
        <a class="pill" href="${APP_URL}/showbusiness">Show-Business</a>
        <a class="pill" href="${APP_URL}/leaders">Leaders Stories</a>
      </div>

      <div class="cta">
        <a href="${APP_URL}">Read the latest issue</a>
      </div>
    </div>

    <div class="footer">
      <p>You are subscribed as ${escapeHtml(email)}<br />
      C'est Fort Magazine · <a href="${APP_URL}">cestfort.com</a><br /><br />
      <a href="${unsubscribeUrl}">Unsubscribe</a></p>
    </div>
  </div>
</body>
</html>
`

  try {
    const resend = getResend()
    const { data, error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: email,
      subject: "Welcome to C'est Fort — you're in.",
      html,
    })
    if (error) {
      logger.error('Resend error sending welcome email', { error })
    } else {
      logger.info('Welcome email sent', { emailId: data?.id, to: email })
    }
  } catch (err) {
    logger.error('Failed to send welcome email', {
      error: err instanceof Error ? err.message : String(err),
    })
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
