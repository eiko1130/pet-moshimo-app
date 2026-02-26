// @ts-nocheck
import './globals.css'
import BottomNavigation from '@/components/BottomNavigation'
import { Zen_Kaku_Gothic_New } from 'next/font/google';

// フォントの設定
const notoCity = Zen_Kaku_Gothic_New({
  weight: ['400', '700', '900'],
  subsets: ['latin'],
  display: 'swap',
});

// アプリの情報設定
export const metadata = {
  title: 'もしも手帳 - ペット見守りアプリ',
  description: 'ペットの健康記録と緊急連絡先管理',
}

// 画面の外枠（レイアウト）の設定
export default function RootLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return (
    <html lang="ja" className={notoCity.className}>
      <body className="bg-gray-50 min-h-screen">
        {/* スマホサイズに制限して、中央に寄せる設定 */}
        <div className="max-w-md mx-auto bg-white min-h-screen relative pb-20">
          {children}
          <BottomNavigation />
        </div>
      </body>
    </html>
  )
}