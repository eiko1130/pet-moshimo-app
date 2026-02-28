'use client'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/AuthProvider'
import BottomNav from '@/components/BottomNav'

export default function HomePage() {
  const { user } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/auth'
  }

  return (
    <div className="min-h-screen bg-[#FFFBFC] pb-24">
      {/* ヘッダー */}
      <header className="flex items-center justify-between px-5 pt-5 pb-2">
        <button onClick={() => setMenuOpen(!menuOpen)} className="text-gray-400">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-6 h-6">
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
      </header>

      {/* ドロワーメニュー */}
      {menuOpen && (
        <div className="fixed inset-0 z-50" onClick={() => setMenuOpen(false)}>
          <div className="absolute top-0 left-0 w-64 h-full bg-white shadow-lg p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-8">
              <span className="font-bold text-gray-600">メニュー</span>
              <button onClick={() => setMenuOpen(false)} className="text-gray-400">✕</button>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 text-gray-500 text-sm w-full py-3 border-t border-gray-100"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              ログアウト
            </button>
          </div>
        </div>
      )}

      {/* ロゴ・メインビジュアル */}
      <div className="flex flex-col items-center py-4">
        <Image src="/logo.png" alt="もしも手帳" width={240} height={48} priority className="mb-4" />
        <Image src="/main.png" alt="猫" width={220} height={220} className="object-contain" />
      </div>

      {/* メインボタン */}
      <div className="px-10 space-y-3">
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

      {/* このアプリについて */}
      <div className="mx-10 mt-6 bg-white border border-pink-50 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-pink-300">🐾</span>
          <span className="text-sm font-bold text-gray-500">このアプリについて</span>
        </div>
        <p className="text-xs text-gray-400 leading-relaxed">
          飼い主に万が一のことがあった際、登録した代理人へペットの情報が共有される仕組みです。毎日の記録が、大切なペットを守ります。
        </p>
      </div>

      <BottomNav />
    </div>
  )
}