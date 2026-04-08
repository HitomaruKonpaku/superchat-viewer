import axios from 'axios'
import { env } from 'next-runtime-env'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
) {
  const baseURL = env('INTERNAL_API_URL')
  if (!baseURL) {
    return NextResponse.json(
      { message: 'INTERNAL_API_URL_NOT_FOUND' },
      { status: 500 },
    )
  }

  const body = await request.json()
  const { data, status, statusText, headers } = await axios.post(
    '/queue/video',
    body,
    {
      baseURL,
      headers: request.headers as any,
      validateStatus: () => true,
    },
  )
  return NextResponse.json(data, { status, statusText, headers: headers as any })
}

export async function OPTIONS() {
  const response = new NextResponse(null, { status: 200 })
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  return response
}
