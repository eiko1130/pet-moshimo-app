import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/components/AuthProvider'

export const metadata: Metadata = {
  title: 'ペットのもしも手帳',
  description: 'ペットの健康と緊急情報を管理する手帳',
  icons: {
    apple: '/icon.png',
    icon: '/icon.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <link rel="apple-touch-icon" href="/icon.png" />
      </head>
      <body className="bg-[#FFFBFC] max-w-md mx-auto overflow-x-hidden">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}