// @ts-nocheck
'use client'
import React, { useEffect } from 'react'
import './globals.css'
import BottomNavigation from '@/components/BottomNavigation'
import { AuthProvider } from '@/components/AuthProvider'
import { Zen_Kaku_Gothic_New } from 'next/font/google'
import { useRouter, usePathname } from 'next/navigation' // 💡 追加
import { supabase } from '@/lib/supabase' // 💡 追加

const notoCity = Zen_Kaku_Gothic_New({
  weight: ['400', '700', '900'],
  subsets: ['latin'],
  display: 'swap',
});

export default function RootLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    async function checkAuth() {
      // 1. ログイン画面(/auth)にいる時はチェックしない（無限ループ防止）
      if (pathname === '/auth') return

      // 2. 現在のユーザー情報を取得
      const { data: { user } } = await supabase.auth.getUser()
      
      // 3. ログインしていなければ、強制的にログイン画面へ
      if (!user) {
        router.push('/auth')
      }
    }
    checkAuth()
  }, [pathname]) // 💡 ページが変わるたびに「門番」がチェックします

  return (
    <html lang="ja" className={notoCity.className}>
      <body className="bg-gray-50 min-h-screen">
        <AuthProvider>
          <div className="max-w-md mx-auto bg-white min-h-screen relative pb-20">
            {children}
            <BottomNavigation />
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}