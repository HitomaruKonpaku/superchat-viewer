import { Metadata, Viewport } from 'next'
import { env } from 'next-runtime-env'
import Head from 'next/head'
import { fetchWithTimeout } from '../../../src/util/fetch.util'
import AuthorPage from './page'

export function generateViewport(): Viewport {
  return {
    themeColor: '#ff0000',
  }
}

export async function generateMetadata(
  { params }: { params: Promise<any> },
): Promise<Metadata> {
  const appUrl = env('APP_URL')
  const apiUrl = env('API_URL')
  const { id } = await params

  try {
    const author = await fetchWithTimeout(`${apiUrl}/authors/${id}`)
      .then((v) => v.json())

    return {
      title: author.name,
      description: author.description,
      openGraph: {
        title: author.name,
        description: author.description,
        url: `${appUrl}/author/${id}`
      },
      twitter: {
        title: author.name,
        description: author.description,
        site: `${appUrl}/author/${id}`
      },
    }
  } catch (error) {
    console.warn('generateMetadata', error)
  }

  return {}
}

export default async function Layout(
  { params }: { params: Promise<any> },
) {
  const appUrl = env('APP_URL')
  const apiUrl = env('API_URL')
  const { id } = await params

  try {
    const author = await fetchWithTimeout(`${apiUrl}/authors/${id}`)
      .then((v) => v.json())

    return (
      <>
        <Head>
          <link rel="image_src" href={author.photo} />
          <meta property="og:url" content={`${appUrl}/author/${id}`} />
          <meta property="og:title" content={author.name} />
          <meta property="og:image" content={author.photo} />
          <meta property="twitter:url" content={`${appUrl}/author/${id}`} />
          <meta property="twitter:title" content={author.name} />
          <meta property="twitter:image" content={author.photo} />
        </Head>

        <AuthorPage />
      </>
    )
  } catch (error) {
    console.warn('Layout', error)
  }

  return (
    <>
      <AuthorPage />
    </>
  )
}
