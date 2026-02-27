// middleware.ts の中身をこれだけに書き換えて保存してください
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  // 全てのチェックをスルーして、どこへでもアクセスできるようにします
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|logo.png|main.png).*)'],
}
