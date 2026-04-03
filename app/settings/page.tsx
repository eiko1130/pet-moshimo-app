'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/AuthProvider'
import BottomNav from '@/components/BottomNav'

type SettingItem = {
  href?: string
  label: string
  description: string
  icon: React.ReactNode
  onClick?: () => void
}

export default function SettingsPage() {
  const { user } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/auth'
  }

  const sections: { title: string; items: SettingItem[] }[] = [
    {
      title: 'ペット・飼い主情報',
      items: [
        {
          href: '/pets',
          label: 'ペット情報',
          description: '登録しているペットの情報を管理',
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          ),
        },
        {
          href: '/settings/owner',
          label: 'オーナー情報',
          description: '飼い主の氏名・住所・緊急メッセージ',
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          ),
        },
        {
          href: '/settings/contacts',
          label: '緊急連絡先・代理人',
          description: 'もしもの時に通知する相手を登録',
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.99 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.92 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
          ),
        },
      ],
    },
    {
      title: 'アラート設定',
      items: [
        {
          href: '/settings/alert',
          label: 'アラート設定',
          description: '記録が途絶えたら緊急連絡先へ自動通知',
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
          ),
        },
      ],
    },
    {
      title: '記録の設定',
      items: [
        {
          href: '/settings/record-items',
          label: '日記の項目設定',
          description: '毎日の記録でつける項目をカスタマイズ',
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
              <line x1="8" y1="6" x2="21" y2="6"/>
              <line x1="8" y1="12" x2="21" y2="12"/>
              <line x1="8" y1="18" x2="21" y2="18"/>
              <line x1="3" y1="6" x2="3.01" y2="6" strokeWidth={3} strokeLinecap="round"/>
              <line x1="3" y1="12" x2="3.01" y2="12" strokeWidth={3} strokeLinecap="round"/>
              <line x1="3" y1="18" x2="3.01" y2="18" strokeWidth={3} strokeLinecap="round"/>
            </svg>
          ),
        },
      ],
    },
    {
      title: 'その他',
      items: [
        {
          href: '/onboarding?mode=tutorial',
          label: 'このアプリについて',
          description: 'アプリの使い方・仕組みを確認',
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          ),
        },
        {
          label: 'ログアウト',
          description: 'アカウントからサインアウト',
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          ),
          onClick: handleSignOut,
        },
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-[#FFFBFC] pb-24">
      <header className="bg-[#FFB7C5] text-white text-center py-4 text-lg font-bold">
        設定
      </header>

      <div className="px-4 py-5 space-y-6">
        {sections.map(section => (
          <div key={section.title}>
            <h2 className="text-xs font-bold text-gray-400 mb-2 px-1">{section.title}</h2>
            <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50 overflow-hidden">
              {section.items.map(item => {
                const inner = (
                  <div className="flex items-center gap-3 px-4 py-3.5">
                    <div className="w-9 h-9 rounded-xl bg-pink-50 flex items-center justify-center text-[#FFB7C5] shrink-0">
                      {item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-700">{item.label}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{item.description}</p>
                    </div>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 text-gray-300 shrink-0">
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  </div>
                )

                if (item.onClick) {
                  return (
                    <button key={item.label} onClick={item.onClick} className="w-full text-left">
                      {inner}
                    </button>
                  )
                }
                return (
                  <Link key={item.label} href={item.href!}>
                    {inner}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <BottomNav />
    </div>
  )
}