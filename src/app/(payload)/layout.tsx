import type { ReactNode } from 'react'
import { RootLayout } from '@payloadcms/next/layouts'
import configPromise from '@payload-config'
import { importMap } from './importMap'
import { serverFunction } from './serverFunction'
import { createLogger } from '@/lib/logger'
import '@/styles/admin.css'

const logger = createLogger('AdminLayout')

type Props = {
  children: ReactNode
}

export default async function AdminLayout({ children }: Props) {
  logger.debug('Rendering Payload admin layout')
  return RootLayout({
    children,
    config: configPromise,
    importMap,
    serverFunction,
  })
}
