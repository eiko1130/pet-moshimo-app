import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  // すべてのアクセスをそのまま通す（リダイレクトを停止）
  return NextResponse.next()
}

export const config = {
  // 何も制限しない
  matcher: [],
}