import { NextRequest, NextResponse } from 'next/server'
import { getAuthorSuperChatTypes } from '../../../../../../src/repository/author.repository'

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<any> },
) {
  const { id } = await params
  const res = await getAuthorSuperChatTypes(id)
  return NextResponse.json(res)
}
