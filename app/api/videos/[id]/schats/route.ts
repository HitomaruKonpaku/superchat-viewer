import { NextRequest, NextResponse } from 'next/server'
import { getVideoSuperChats } from '../../../../../src/repository/video.repository'
import { RequestUtil } from '../../../../../src/util/request.util'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<any> },
) {
  const { id } = await params
  const { searchParams } = request.nextUrl
  const res = await getVideoSuperChats(id, {
    ...RequestUtil.parsePaginationParams(searchParams),
    types: RequestUtil.parseChatActionTypes(searchParams),
  })
  return NextResponse.json(res)
}
