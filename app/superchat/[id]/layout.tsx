import { Metadata, Viewport } from 'next'
import { env } from 'next-runtime-env'
import { permanentRedirect } from 'next/navigation'
import { LayoutProps } from '../../../src/interface/layout.interface'
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
  const { id } = await params
  const appUrl = env('APP_URL')
  const apiUrl = env('API_URL')

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

export default async function Layout({ params }: LayoutProps) {
  const { id } = await params
  permanentRedirect(`/video/${id}`)
}
