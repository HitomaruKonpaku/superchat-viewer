import { NextRequest, NextResponse } from 'next/server'
import { getSuperChatTypesByVideoId } from '../../../../../../src/repository/superchat.repository'

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<any> },
) {
  const { id } = await params
  const res = await getSuperChatTypesByVideoId(id)
  return NextResponse.json(res)
}
