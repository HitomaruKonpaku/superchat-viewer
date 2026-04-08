import { NextRequest, NextResponse } from 'next/server'
import { getChannelById } from '../../../../src/repository/channel.repository'
import { getVideoById } from '../../../../src/repository/video.repository'

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<any> },
) {
  const { id } = await params
  const video = await getVideoById(id)
  const channel = await getChannelById(video.channel_id)

  return NextResponse.json({
    version: '1.0',
    type: 'video',
    provider_name: 'YouTube',
    provider_url: 'https://www.youtube.com/',
    width: 200,
    height: 150,
    title: video.title,
    author_name: channel.name,
    author_url: `${process.env.APP_URL}/channel/${video.channel_id}`,
    thumbnail_url: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
    thumbnail_width: 480,
    thumbnail_height: 360,
  })
}
