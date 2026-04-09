import { NextRequest, NextResponse } from 'next/server'
import { getSuperChatTypesByAuthorId } from '../../../../../../src/repository/author.repository'

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<any> },
) {
  const { id } = await params
  const res = await getSuperChatTypesByAuthorId(id)
  return NextResponse.json(res)
}
