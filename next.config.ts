import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
]

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Cloudflare R2 storage (S3-compatible endpoint)
      { protocol: 'https', hostname: '*.r2.cloudflarestorage.com' },
      // Cloudflare R2 public bucket URLs
      { protocol: 'https', hostname: '*.r2.dev' },
      // Unsplash (mock/placeholder images)
      { protocol: 'https', hostname: 'images.unsplash.com' },
      // Allow local dev
      { protocol: 'http', hostname: 'localhost' },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
}

export default withPayload(nextConfig)
