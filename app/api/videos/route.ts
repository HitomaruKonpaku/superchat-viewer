import { NextRequest, NextResponse } from 'next/server'
import { getVideos } from '../../../src/repository/video.repository'
import { RequestUtil } from '../../../src/util/request.util'

export async function GET(
  request: NextRequest,
) {
  const { searchParams } = request.nextUrl
  const channelId = searchParams.get('channel_id') as string
  const res = await getVideos({
    ...RequestUtil.parsePaginationParams(searchParams),
    channelId,
  })
  return NextResponse.json(res)
}
