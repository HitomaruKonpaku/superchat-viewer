import { Metadata, Viewport } from 'next'
import { env } from 'next-runtime-env'
import Head from 'next/head'
import { fetchWithTimeout } from '../../../src/util/fetch.util'
import { VideoUtil } from '../../../src/util/video.util'

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
    const video = await fetchWithTimeout(`${apiUrl}/videos/${id}`)
      .then((v) => v.json())

    return {
      title: video.title,
      description: video.description,
      openGraph: {
        title: video.title,
        description: video.description,
        url: `${appUrl}/video/${id}`,
        images: [
          { url: VideoUtil.toThumbnailMaxRes(id) },
        ],
      },
      twitter: {
        title: video.title,
        description: video.description,
        site: `${appUrl}/video/${id}`,
        images: [
          { url: VideoUtil.toThumbnailMaxRes(id) },
        ],
      },
    }
  } catch (error) {
    console.warn('generateMetadata', error)
  }

  return {}
}

export default async function Layout(
  {
    params,
    children,
  }: {
    params: Promise<any>
    children: React.ReactNode
  },
) {
  const appUrl = env('APP_URL')
  const apiUrl = env('API_URL')
  const { id } = await params

  try {
    const video = await fetchWithTimeout(`${apiUrl}/videos/${id}`)
      .then((v) => v.json())
    const oembedHref = `${appUrl}/oembed/videos/${id}`

    return (
      <>
        <Head>
          <link rel='alternate' type='application/json+oembed' href={oembedHref} />
          <link rel='image_src' href={VideoUtil.toThumbnailMaxRes(id)} />
          <meta property='og:url' content={`${appUrl}/video/${id}`} />
          <meta property='og:title' content={video.title} />
          <meta property='og:image' content={VideoUtil.toThumbnailMaxRes(id)} />
          <meta property='twitter:url' content={`${appUrl}/video/${id}`} />
          <meta property='twitter:title' content={video.title} />
          <meta property='twitter:image' content={VideoUtil.toThumbnailMaxRes(id)} />
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
