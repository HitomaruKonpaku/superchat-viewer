import { Metadata, Viewport } from 'next'
import { env } from 'next-runtime-env'
import Head from 'next/head'
import { LayoutProps } from '../../../src/interface/layout.interface'
import { fetchWithTimeout } from '../../../src/util/fetch.util'

export function generateViewport(): Viewport {
  return {
    themeColor: '#ff0000',
  }
}

export async function generateMetadata(
  { params }: { params: Promise<any> },
): Promise<Metadata> {
  const { id } = await params
  const appUrl = env('APP_URL')
  const apiUrl = env('API_URL')

  try {
    const channel = await fetchWithTimeout(`${apiUrl}/channels/${id}`)
      .then((v) => v.json())

    return {
      title: channel.name,
      description: channel.description,
      openGraph: {
        title: channel.name,
        description: channel.description,
        url: `${appUrl}/channel/${id}`,
      },
      twitter: {
        title: channel.name,
        description: channel.description,
        site: `${appUrl}/channel/${id}`,
      },
    }
  } catch (error) {
    console.warn('generateMetadata', error)
  }

  return {}
}

export default async function Layout({ params, children }: LayoutProps) {
  const { id } = await params
  const appUrl = env('APP_URL')
  const apiUrl = env('API_URL')

  try {
    const channel = await fetchWithTimeout(`${apiUrl}/channels/${id}`)
      .then((v) => v.json())

    return (
      <>
        <Head>
          <meta property='og:url' content={`${appUrl}/channel/${id}`} />
          <meta property='og:title' content={channel.name} />
          <meta property='og:description' content={channel.description} />
          <meta property='og:image' content={channel.thumbnail_url} />
          <meta property='twitter:url' content={`${appUrl}/channel/${id}`} />
          <meta property='twitter:title' content={channel.name} />
          <meta property='twitter:description' content={channel.description} />
          <meta property='twitter:image' content={channel.thumbnail_url} />
        </Head>

        {children}
      </>
    )
  } catch (error) {
    console.warn('Layout', error)
  }

  return (
    <>
      {children}
    </>
  )
}
