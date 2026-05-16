import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { Cormorant_Garamond, Inter } from 'next/font/google'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import '../globals.css'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
  title: {
    default: "C'est Fort — Tech, Culture & The New Luxury",
    template: "%s — C'est Fort",
  },
  description:
    "Curated insights on technology, culture, and refined living. The magazine for discerning readers.",
  openGraph: {
    type: 'website',
    siteName: "C'est Fort",
  },
  twitter: {
    card: 'summary_large_image',
  },
}

type Props = {
  children: ReactNode
}

export default function AppLayout({ children }: Props) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${inter.variable}`}
    >
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
