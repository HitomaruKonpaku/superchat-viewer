import { NextRequest, NextResponse } from 'next/server'
import { getChannels } from '../../../src/repository/channel.repository'
import { RequestUtil } from '../../../src/util/request.util'

export async function GET(
  request: NextRequest,
) {
  const { searchParams } = request.nextUrl
  const res = await getChannels(RequestUtil.parsePaginationParams(searchParams))
  return NextResponse.json(res)
}
