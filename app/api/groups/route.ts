import { NextRequest, NextResponse } from 'next/server'
import { getGroups } from '../../../src/repository/group.repository'
import { RequestUtil } from '../../../src/util/request.util'

export async function GET(
  request: NextRequest,
) {
  const { searchParams } = request.nextUrl
  const res = await getGroups(RequestUtil.parsePaginationParams(searchParams))
  return NextResponse.json(res)
}
