import { NextRequest, NextResponse } from 'next/server'
import { getAuthorChats } from '../../../../../src/repository/author.repository'
import { RequestUtil } from '../../../../../src/util/request.util'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<any> },
) {
  const { id } = await params
  const { searchParams } = request.nextUrl
  const res = await getAuthorChats(id, {
    ...RequestUtil.parsePaginationParams(searchParams),
    types: RequestUtil.parseChatActionTypes(searchParams),
  })
  return NextResponse.json(res)
}
