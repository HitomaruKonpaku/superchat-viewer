import { NextRequest, NextResponse } from 'next/server'
import { getVideoSuperChatColors } from '../../../../../../src/repository/video.repository'

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<any> },
) {
  const { id } = await params
  const res = await getVideoSuperChatColors(id)
  return NextResponse.json(res)
}
