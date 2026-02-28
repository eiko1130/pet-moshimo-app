'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/AuthProvider'
import BottomNav from '@/components/BottomNav'

const DAILY_TIPS = [
  '今日は少し冷え込みますね。猫ちゃんの寝床を暖かくしてあげましょう。お水もしっかり替えてあげてください。',
  '猫は1日14〜16時間眠ります。たくさん寝ていても正常ですよ。',
  'ブラッシングは毛玉予防だけでなく、スキンシップにもなります。',
  '猫の水分補給は大切。ウェットフードも取り入れてみましょう。',
  '爪切りは2〜3週間に一度が目安です。嫌がる場合は少しずつ慣らしていきましょう。',
]

export default function HomePage() {
  const { user } = useAuth()
  const [petCount, setPetCount] = useState(0)
  const tip = DAILY_TIPS[new Date().getDate() % DAILY_TIPS.length]

  useEffect(() => {
    if (!user) return
    supabase
      .from('my_pets')
      .select('id', { count: 'exact', head: true })
      .then(({ count }) => setPetCount(count ?? 0))
  }, [user])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/auth'
  }

  return (
    <div className="min-h-screen bg-[#FFFBFC] pb-24">
      {/* ヘッダー */}
      <header className="flex items-center justify-between px-5 pt-5 pb-2">
        <button className="text-gray-400">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-6 h-6">
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
        <button onClick={handleSignOut} className="text-xs text-gray-400 border border-gray-200 rounded-lg px-3 py-1">
          ログアウト
        </button>
      </header>

      {/* ロゴ・メインビジュアル */}
      <div className="flex flex-col items-center py-4">
        <Image src="/logo.png" alt="もしも手帳" width={200} height={40} priority className="mb-4" />
        <Image src="/main.png" alt="猫" width={180} height={180} className="object-contain" />
      </div>

      {/* メインボタン */}
      <div className="px-5 space-y-3">
        <Link
          href="/record"
          className="flex items-center justify-center gap-2 w-full bg-[#FFB7C5] text-white font-bold py-4 rounded-2xl text-base shadow-sm"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-5 h-5">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
          きょうの健康記録
        </Link>

        <Link
          href="/settings/owner"
          className="flex items-center justify-between w-full bg-white border border-gray-100 py-4 px-5 rounded-2xl shadow-sm"
        >
          <div className="flex items-center gap-3">
            <span className="text-[#FFB7C5]">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </span>
            <span className="text-sm font-medium text-gray-700">飼い主情報の編集</span>
          </div>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 text-gray-300">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </Link>

        <Link
          href="/settings/contacts"
          className="flex items-center justify-between w-full bg-white border border-gray-100 py-4 px-5 rounded-2xl shadow-sm"
        >
          <div className="flex items-center gap-3">
            <span className="text-[#FFB7C5]">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                <line x1="8" y1="21" x2="16" y2="21"/>
                <line x1="12" y1="17" x2="12" y2="21"/>
              </svg>
            </span>
            <span className="text-sm font-medium text-gray-700">緊急連絡先の編集</span>
          </div>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 text-gray-300">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </Link>
      </div>

      {/* 今日のアドバイス */}
      <div className="mx-5 mt-5 bg-white border border-yellow-100 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-yellow-400">💡</span>
          <span className="text-sm font-bold text-gray-600">今日のアドバイス</span>
        </div>
        <p className="text-xs text-gray-500 leading-relaxed">{tip}</p>
      </div>

      <BottomNav />
    </div>
  )
}
