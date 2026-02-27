// @ts-nocheck
import React from 'react'
import './globals.css'
import BottomNavigation from '@/components/BottomNavigation'
import { AuthProvider } from '@/components/AuthProvider'
import { Zen_Kaku_Gothic_New } from 'next/font/google';

const notoCity = Zen_Kaku_Gothic_New({
  weight: ['400', '700', '900'],
  subsets: ['latin'],
  display: 'swap',
});

export const metadata = {
  title: 'もしも手帳 - ペット見守りアプリ',
  description: 'ペットの健康記録と緊急連絡先管理',
}

export default function RootLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
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