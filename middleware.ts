import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  // すべてのクッキーの中から 'auth-token' を含むものを探す（より柔軟な判定）
  const allCookies = req.cookies.getAll()
  const hasAuthToken = allCookies.some(cookie => cookie.name.includes('auth-token'))
  
  const isAuthPage = req.nextUrl.pathname === '/auth'

  // トークンがない ＆ 認証ページ以外にいる ➔ 認証ページへ
  if (!hasAuthToken && !isAuthPage) {
    return NextResponse.redirect(new URL('/auth', req.url))
  }

  // トークンがある ＆ 認証ページにいる ➔ トップページへ
  if (hasAuthToken && isAuthPage) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|logo.png|main.png).*)'],
}