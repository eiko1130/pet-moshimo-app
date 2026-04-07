'use client'
import { useState, useEffect, useRef } from 'react'
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

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土']

export default function HomePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [pets, setPets] = useState<Pet[]>([])
  const [randomImage, setRandomImage] = useState<string | null>(null)
  const [partnerName, setPartnerName] = useState<string | null>(null)

  // カード状態
  const [swipeY, setSwipeY] = useState(0)
  const [swiping, setSwiping] = useState(false)
  const [peeled, setPeeled] = useState(false)
  const [done, setDone] = useState(false)
  const startYRef = useRef<number | null>(null)

  const today = new Date()
  const dateLabel = `${today.getMonth() + 1}月${today.getDate()}日（${WEEKDAYS[today.getDay()]}）`

  useEffect(() => {
    if (!user) return
    const fetchData = async () => {
      const { data: petsData } = await supabase
        .from('my_pets')
        .select('id, name, image_url')
        .eq('user_id', user.id)
        .order('created_at')
      setPets(petsData ?? [])

      const todayStr = toLocalDateString()
      const { data: recordsData } = await supabase
        .from('pet_records')
        .select('image_url')
        .eq('user_id', user.id)
        .eq('date', todayStr)
      const images = (recordsData ?? []).map(r => r.image_url).filter(Boolean) as string[]
      if (images.length > 0) {
        setRandomImage(images[Math.floor(Math.random() * images.length)])
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
          setRandomImage(pastImages[Math.floor(Math.random() * pastImages.length)])
        }
      }

      const { data: moshimoData } = await supabase
        .from('moshimo_info')
        .select('proxy_user_id, proxy_approved_at, proxy_name')
        .eq('user_id', user.id)
        .single()
      if (moshimoData?.proxy_user_id && moshimoData?.proxy_approved_at) {
        setPartnerName(moshimoData.proxy_name ?? 'パートナー')
      }
    }
    fetchData()
  }, [user])

  const triggerCheckin = async () => {
    if (user) {
      await supabase
        .from('moshimo_info')
        .update({ last_checked_at: new Date().toISOString() })
        .eq('user_id', user.id)
    }
  }

  const handleSwipeEnd = () => {
    if (swipeY > 80) {
      setPeeled(true)
      triggerCheckin()
      setTimeout(() => {
        setDone(true)
        setPeeled(false)
        setSwipeY(0)
      }, 400)
    } else {
      setSwipeY(0)
    }
    setSwiping(false)
    startYRef.current = null
  }

  const onTouchStart = (e: React.TouchEvent) => {
    startYRef.current = e.touches[0].clientY
    setSwiping(true)
  }
  const onTouchMove = (e: React.TouchEvent) => {
    if (startYRef.current === null) return
    const diff = e.touches[0].clientY - startYRef.current
    if (diff > 0) setSwipeY(Math.min(diff, 300))
  }
  const onTouchEnd = () => handleSwipeEnd()

  const onMouseDown = (e: React.MouseEvent) => {
    startYRef.current = e.clientY
    setSwiping(true)
  }
  const onMouseMove = (e: React.MouseEvent) => {
    if (!swiping || startYRef.current === null) return
    const diff = e.clientY - startYRef.current
    if (diff > 0) setSwipeY(Math.min(diff, 300))
  }
  const onMouseUp = () => handleSwipeEnd()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/auth'
  }

  const cardTransform = peeled
    ? 'translateY(110%) rotate(4deg)'
    : `translateY(${swipeY}px) rotate(${swipeY * 0.015}deg)`
  const cardTransition = peeled
    ? 'transform 0.4s ease-in'
    : swiping ? 'none' : 'transform 0.3s ease-out'

  return (
    <div
      className="min-h-screen bg-[#FFFBFC] pb-24"
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
    >
      {/* ドロワーメニュー */}
      {menuOpen && (
        <div className="fixed inset-0 z-50" onClick={() => setMenuOpen(false)}>
          <div className="absolute top-0 left-0 w-64 h-full bg-white shadow-lg p-6 flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-8">
              <span className="font-bold text-gray-600">メニュー</span>
              <button onClick={() => setMenuOpen(false)} className="text-gray-400">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
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
              <Link href="/settings/record-items" onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 text-gray-500 text-sm w-full py-3 border-b border-gray-100">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                  <line x1="8" y1="6" x2="21" y2="6"/>
                  <line x1="8" y1="12" x2="21" y2="12"/>
                  <line x1="8" y1="18" x2="21" y2="18"/>
                  <line x1="3" y1="6" x2="3.01" y2="6" strokeWidth={3} strokeLinecap="round"/>
                  <line x1="3" y1="12" x2="3.01" y2="12" strokeWidth={3} strokeLinecap="round"/>
                  <line x1="3" y1="18" x2="3.01" y2="18" strokeWidth={3} strokeLinecap="round"/>
                </svg>
                日記の項目設定
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

      {/* カードエリア */}
      <div className="relative overflow-hidden">

        {/* 裏ページ（めくった後に見えるページ） */}
        <div className="bg-white min-h-screen">
          {/* ヘッダー */}
          <div className="bg-[#FFB7C5] px-5 pt-5 pb-4 flex items-center justify-between">
            <div className="w-6" />
            <Image src="/logo.webp" alt="うちの子バトン" width={160} height={54} className="object-contain" priority />
            <div className="w-6" />
          </div>
          <div className="flex flex-col items-center px-6 pt-6 gap-5">
            <p className="text-sm text-gray-400">{dateLabel}</p>
            <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-pink-100 shadow-md">
              {randomImage ? (
                <img src={randomImage} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-pink-50 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#FFB7C5" strokeWidth={1.5} className="w-16 h-16">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                </div>
              )}
            </div>
            <p className="text-lg font-bold text-gray-700">今日も記録ありがとう！</p>
            <button
              onClick={() => router.push('/record')}
              className="w-full bg-[#FFB7C5] text-white font-bold py-4 rounded-2xl text-sm"
            >
              ペットの記録もつける
            </button>
            <button
              onClick={() => setDone(false)}
              className="text-xs text-gray-400"
            >
              閉じる
            </button>
          </div>
        </div>

        {/* 表ページ（スワイプするカード） */}
        {!done && (
          <div
            className="absolute inset-0"
            style={{
              transform: cardTransform,
              transition: cardTransition,
              cursor: swiping ? 'grabbing' : 'grab',
            }}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            onMouseDown={onMouseDown}
          >
            {/* ヘッダー */}
            <div className="bg-[#FFB7C5] px-5 pt-5 pb-4 flex items-center justify-between">
              <button onClick={() => setMenuOpen(!menuOpen)} className="text-white">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-6 h-6">
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <line x1="3" y1="12" x2="21" y2="12"/>
                  <line x1="3" y1="18" x2="21" y2="18"/>
                </svg>
              </button>
              <Image src="/logo.webp" alt="うちの子バトン" width={160} height={54} className="object-contain" priority />
              <div className="w-6" />
            </div>

            {/* カード本体 */}
            <div className="bg-[#FFFBFC] min-h-screen">
              {/* 日付 */}
              <p className="text-center text-sm text-gray-400 pt-4">{dateLabel}</p>

              {/* メインイラスト */}
              <div className="px-6 pt-2">
                <div className="relative w-full rounded-3xl overflow-hidden">
                  <div className="relative w-full aspect-square">
                    <Image
                      src="/main.webp"
                      alt=""
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>
                </div>
              </div>

              {/* スワイプ誘導アニメーション */}
              <div className="flex flex-col items-center pt-4 gap-1">
                <p className="text-xs text-gray-400">下にスワイプして記録する</p>
                <div style={{ animation: 'swipe-down 1.5s ease-in-out infinite' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#FFB7C5" strokeWidth={2} className="w-6 h-6">
                    <polyline points="7 13 12 18 17 13"/>
                    <polyline points="7 6 12 11 17 6"/>
                  </svg>
                </div>
              </div>

              {/* パートナー招待バナー */}
              {!partnerName && (
                <div className="mx-6 mt-5 bg-white border border-pink-100 rounded-2xl p-4">
                  <p className="text-sm font-bold text-gray-700 mb-2">代理人とアプリで繋がろう</p>
                  <p className="text-xs text-gray-500 leading-relaxed mb-3">
                    もしもの時には代理人にメールが届きますが、相手もアプリをインストールしている場合はメール＋アプリ通知でWの安心。ペット日記を見せ合えたり、より詳細な引き継ぎデータをわかりやすく閲覧できます。
                  </p>
                  <Link
                    href="/settings/contacts"
                    className="block w-full bg-[#FFB7C5] text-white text-sm font-bold py-3 rounded-xl text-center"
                  >
                    パートナーを招待する
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes swipe-down {
          0%, 100% { transform: translateY(0); opacity: 1; }
          50% { transform: translateY(8px); opacity: 0.5; }
        }
      `}</style>

      <BottomNav />
    </div>
  )
}