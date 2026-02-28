'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/AuthProvider'
import BottomNav from '@/components/BottomNav'

const DAILY_TIPS = [
  '今日は少し冷え込みますね。猫ちゃんの寝床を暖かくしてあげましょう。お水もしっかり替えてあげてください。',
]

export default function HomePage() {
  const { user } = useAuth()

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

        {/* 3つの丸形ボタン */}
        <div className="flex justify-around pt-2">
          <Link href="/pets" className="flex flex-col items-center gap-2">
            <div className="w-16 h-16 rounded-full bg-pink-50 border-2 border-pink-100 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="#FFB7C5" strokeWidth={2} className="w-7 h-7">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </div>
            <span className="text-xs text-gray-500 font-medium">ペット情報</span>
          </Link>

          <Link href="/settings/owner" className="flex flex-col items-center gap-2">
            <div className="w-16 h-16 rounded-full bg-pink-50 border-2 border-pink-100 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="#FFB7C5" strokeWidth={2} className="w-7 h-7">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <span className="text-xs text-gray-500 font-medium">飼い主情報</span>
          </Link>

          <Link href="/settings/contacts" className="flex flex-col items-center gap-2">
            <div className="w-16 h-16 rounded-full bg-pink-50 border-2 border-pink-100 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="#FFB7C5" strokeWidth={2} className="w-7 h-7">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.99 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.92 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
            </div>
            <span className="text-xs text-gray-500 font-medium">緊急連絡先</span>
          </Link>
        </div>
      </div>

      {/* アプリ説明 */}
      <div className="mx-5 mt-6 bg-white border border-pink-50 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-pink-300">🐾</span>
          <span className="text-sm font-bold text-gray-500">このアプリについて</span>
        </div>
        <p className="text-xs text-gray-400 leading-relaxed">
          このアプリは、飼い主に万が一のことがあった際にペットを守るための備えです。日々の健康記録を続けることで、もしも24時間以内に生存確認が取れなかった場合、あらかじめ登録した代理人へ自動的に情報が共有される仕組みを目指しています。大切なペットのために、今日から記録を始めましょう。
        </p>
      </div>

      <BottomNav />
    </div>
  )
}
