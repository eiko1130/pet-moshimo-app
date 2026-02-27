import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const token = req.cookies.get('sb-nukpisixfolbnzkvorym-auth-token')?.value
  const isAuthPage = req.nextUrl.pathname === '/auth'

  if (!token && !isAuthPage) {
    return NextResponse.redirect(new URL('/auth', req.url))
  }

  if (token && isAuthPage) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|logo.png|main.png).*)'],
}