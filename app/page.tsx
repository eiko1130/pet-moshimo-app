'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/AuthProvider'
import BottomNav from '@/components/BottomNav'

type Pet = {
  id: string
  name: string
  image_url: string | null
}

const toLocalDateString = () => {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export default function HomePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [pets, setPets] = useState<Pet[]>([])
  const [randomImage, setRandomImage] = useState<string | null>(null)
  const [popupOpen, setPopupOpen] = useState(false)

  useEffect(() => {
    if (!user) return

    const fetchData = async () => {
      const { data: petsData } = await supabase
        .from('my_pets')
        .select('id, name, image_url')
        .eq('user_id', user.id)
        .order('created_at')

      const petList = petsData ?? []
      setPets(petList)
      petList.forEach(pet => {
        if (pet.image_url) {
          const link = document.createElement('link')
          link.rel = 'preload'
          link.as = 'image'
          link.href = pet.image_url
          document.head.appendChild(link)
        }
      })

      const today = toLocalDateString()
      const { data: recordsData } = await supabase
        .from('pet_records')
        .select('pet_id, image_url')
        .eq('user_id', user.id)
        .eq('date', today)

      const records = recordsData ?? []
      const images = records.map(r => r.image_url).filter(Boolean) as string[]
      if (images.length > 0) {
        const chosen = images[Math.floor(Math.random() * images.length)]
        setRandomImage(chosen)
        const link = document.createElement('link')
        link.rel = 'preload'
        link.as = 'image'
        link.href = chosen
        document.head.appendChild(link)
      } else {
        const { data: pastRecords } = await supabase
          .from('pet_records')
          .select('image_url')
          .eq('user_id', user.id)
          .not('image_url', 'is', null)
          .order('created_at', { ascending: false })
          .limit(20)
        const pastImages = (pastRecords ?? []).map(r => r.image_url).filter(Boolean) as string[]
        if (pastImages.length > 0) {
          const chosen = pastImages[Math.floor(Math.random() * pastImages.length)]
          setRandomImage(chosen)
          const link = document.createElement('link')
          link.rel = 'preload'
          link.as = 'image'
          link.href = chosen
          document.head.appendChild(link)
        }
      }
    }

    fetchData()
  }, [user])

  const handleCheckIn = async () => {
    if (user) {
      await supabase
        .from('moshimo_info')
        .update({ last_checked_at: new Date().toISOString() })
        .eq('user_id', user.id)
    }
    setPopupOpen(true)
  }

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
          <div className="absolute top-0 left-0 w-64 h-full bg-white shadow-lg p-6 flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-8">
              <span className="font-bold text-gray-600">メニュー</span>
              <button onClick={() => setMenuOpen(false)} className="text-gray-400">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className="flex flex-col gap-1">
              <Link href="/onboarding?mode=tutorial" onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 text-gray-500 text-sm w-full py-3 border-b border-gray-100">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                このアプリについて
              </Link>
              <Link href="/pets" onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 text-gray-500 text-sm w-full py-3 border-b border-gray-100">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
                ペット情報
              </Link>
              <Link href="/settings/owner" onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 text-gray-500 text-sm w-full py-3 border-b border-gray-100">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                オーナー情報
              </Link>
              <button onClick={handleSignOut}
                className="flex items-center gap-3 text-gray-500 text-sm w-full py-3 border-t border-gray-100 mt-4">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                ログアウト
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ロゴ */}
      <div className="flex justify-center pt-4 pb-2">
        <Image src="/logo.webp" alt="もしも手帳" width={240} height={80} className="object-contain" priority />
      </div>

      {/* メイン画像ボタン */}
      <div className="px-10">
        <button
          onClick={handleCheckIn}
          className="relative w-full rounded-3xl overflow-hidden"
        >
          <div className="relative w-full aspect-square">
            <Image
              src="/main.webp"
              alt="今日も元気！"
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center justify-end pb-4 gap-0.5"
            style={{ height: '80px', background: 'linear-gradient(to top, rgba(255,183,197,1) 0%, rgba(255,183,197,0.8) 50%, rgba(255,183,197,0) 100%)' }}>
            <div className="flex items-center gap-1.5">
              <svg viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth={1.5} className="w-4 h-4">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              <span className="text-sm font-bold text-white drop-shadow">今日も元気！</span>
            </div>
            <span className="text-white/80 text-xs">タップして今日の元気を記録</span>
          </div>
        </button>
      </div>

      {/* ショートカット */}
      <div className="flex justify-around px-10 pt-5">
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

      {/* このアプリについて */}
      <div className="mx-10 mt-6 bg-white border border-pink-50 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <svg viewBox="0 0 24 24" fill="none" stroke="#FFB7C5" strokeWidth={2} className="w-4 h-4">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span className="text-sm font-bold text-gray-500">このアプリについて</span>
        </div>
        <p className="text-xs text-gray-400 leading-relaxed">
          飼い主に万が一のことがあった際、登録した代理人へペットの情報が共有される仕組みです。毎日の記録が、大切なペットを守ります。
        </p>
      </div>

      {/* ポップアップ（中央モーダル） */}
      {popupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-8">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden">
            {/* 写真エリア */}
            <div className="relative">
              {randomImage ? (
                <div className="relative w-full aspect-square">
                  <img src={randomImage} alt="今日のうちの子" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-full aspect-square bg-pink-50 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#FFB7C5" strokeWidth={1.5} className="w-16 h-16">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                </div>
              )}
              {/* ×ボタン */}
              <button
                onClick={() => { setPopupOpen(false); router.push('/record') }}
                className="absolute top-3 right-3 bg-black/40 rounded-full p-1.5"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5} className="w-4 h-4">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            {/* テキストエリア */}
            <div className="px-5 py-4">
              <p className="text-center text-base font-bold text-gray-700 mb-1">今日も元気を確認しました！</p>
              <p className="text-center text-xs text-gray-400">今日のうちの子：オキ家のしらすちゃん</p>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  )
}