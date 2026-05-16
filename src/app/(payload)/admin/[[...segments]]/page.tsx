import { RootPage, generatePageMetadata } from '@payloadcms/next/views'
import configPromise from '@payload-config'
import { importMap } from '../../importMap'

type PageProps = {
  params: Promise<{ segments: string[] }>
  searchParams: Promise<Record<string, string | string[]>>
}

export const generateMetadata = ({ params, searchParams }: PageProps) =>
  generatePageMetadata({ config: configPromise, params, searchParams })

export default function AdminPage({ params, searchParams }: PageProps) {
  return RootPage({ config: configPromise, importMap, params, searchParams })
}
