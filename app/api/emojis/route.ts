import { NextRequest, NextResponse } from 'next/server'
import { getEmojis } from '../../../src/repository/emoji.repository'

export async function GET(
  request: NextRequest,
) {
  const { searchParams } = request.nextUrl
  const channelIds = (searchParams.get('channel_id') || '')
    .split(',')
    .filter(v => v)
  const res = await getEmojis(channelIds)
  return NextResponse.json(res)
}
