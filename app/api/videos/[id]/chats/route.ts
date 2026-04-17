import { NextRequest, NextResponse } from 'next/server'
import { getVideoBaseChats } from '../../../../../src/repository/video.repository'
import { RequestUtil } from '../../../../../src/util/request.util'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<any> },
) {
  const { id } = await params
  const { searchParams } = request.nextUrl
  const res = await getVideoBaseChats(id, {
    ...RequestUtil.parsePaginationParams(searchParams),
  })
  return NextResponse.json(res)
}
