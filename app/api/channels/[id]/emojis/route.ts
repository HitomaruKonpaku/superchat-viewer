import { NextRequest, NextResponse } from 'next/server'
import { getEmojis } from '../../../../../src/repository/emoji.repository'

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<any> },
) {
  const { id } = await params
  const res = await getEmojis([id])
  return NextResponse.json(res)
}
