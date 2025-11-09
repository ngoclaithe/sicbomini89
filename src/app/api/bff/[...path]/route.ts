import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001'
const API_PREFIX = '/api/v1'

async function proxy(req: NextRequest, { params }: { params: { path: string[] } }) {
  const urlPath = `/${(params.path || []).join('/')}`
  const targetUrl = `${BACKEND_URL}${API_PREFIX}${urlPath}${req.nextUrl.search}`

  const headers = new Headers(req.headers)
  headers.delete('host')
  headers.delete('accept-encoding')

  const init: RequestInit = {
    method: req.method,
    headers,
    cache: 'no-store',
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    const body = await req.text()
    init.body = body
  }

  try {
    const res = await fetch(targetUrl, init)

    const resHeaders = new Headers(res.headers)
    resHeaders.delete('content-encoding')
    resHeaders.delete('transfer-encoding')
    resHeaders.set('cache-control', 'no-store')

    const data = await res.arrayBuffer()

    return new NextResponse(data, {
      status: res.status,
      statusText: res.statusText,
      headers: resHeaders,
    })
  } catch (err: any) {
    return NextResponse.json(
      { message: 'BFF proxy error', error: err?.message || 'Unknown error' },
      { status: 502 }
    )
  }
}

export async function GET(req: NextRequest, ctx: { params: { path: string[] } }) {
  return proxy(req, ctx)
}
export async function POST(req: NextRequest, ctx: { params: { path: string[] } }) {
  return proxy(req, ctx)
}
export async function PUT(req: NextRequest, ctx: { params: { path: string[] } }) {
  return proxy(req, ctx)
}
export async function DELETE(req: NextRequest, ctx: { params: { path: string[] } }) {
  return proxy(req, ctx)
}
export async function PATCH(req: NextRequest, ctx: { params: { path: string[] } }) {
  return proxy(req, ctx)
}
