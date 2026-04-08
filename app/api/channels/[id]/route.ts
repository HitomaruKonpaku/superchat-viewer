import { NextRequest, NextResponse } from 'next/server'
import { getChannelById } from '../../../../src/repository/channel.repository'

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<any> },
) {
  const { id } = await params
  const res = await getChannelById(id)
  return NextResponse.json(res)
}
