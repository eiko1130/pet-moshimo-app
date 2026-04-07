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
  const [popupOpen, setPopupOpen] = useState(false)
  const [partnerName, setPartnerName] = useState<string | null>(null)

  // スワイプ用
  const [swiping, setSwiping] = useState(false)
  const [swipeY, setSwipeY] = useState(0)
  const [peeled, setPeeled] = useState(false)
  const startYRef = useRef<number | null>(null)
  const cardRef = useRef<HTMLDivElement>(null)

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

      const petList = petsData ?? []
      setPets(petList)

      const todayStr = toLocalDateString()
      const { data: recordsData } = await supabase
        .from('pet_records')
        .select('pet_id, image_url')
        .eq('user_id', user.id)
        .eq('date', todayStr)

      const records = recordsData ?? []
      const images = records.map(r => r.image_url).filter(Boolean) as string[]
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

  const handleCheckIn = async () => {
    if (user) {
      await supabase
        .from('moshimo_info')
        .update({ last_checked_at: new Date().toISOString() })
        .eq('user_id', user.id)
    }
    setPopupOpen(true)
  }

  // タッチ開始
  const onTouchStart = (e: React.TouchEvent) => {
    startYRef.current = e.touches[0].clientY
    setSwiping(true)
  }

  // タッチ移動
  const onTouchMove = (e: React.TouchEvent) => {
    if (startYRef.current === null) return
    const diff = e.touches[0].clientY - startYRef.current
    if (diff > 0) setSwipeY(Math.min(diff, 200))
  }

  // タッチ終了
  const onTouchEnd = () => {
    if (swipeY > 80) {
      // 十分スワイプしたらめくる
      setPeeled(true)
      setTimeout(() => {
        handleCheckIn()
        setTimeout(() => {
          setPeeled(false)
          setSwipeY(0)
        }, 500)
      }, 300)
    } else {
      setSwipeY(0)
    }
    setSwiping(false)
    startYRef.current = null
  }

  // マウス操作（PC用）
  const onMouseDown = (e: React.MouseEvent) => {
    startYRef.current = e.clientY
    setSwiping(true)
  }

  const onMouseMove = (e: React.MouseEvent) => {
    if (!swiping || startYRef.current === null) return
    const diff = e.clientY - startYRef.current
    if (diff > 0) setSwipeY(Math.min(diff, 200))
  }

  const onMouseUp = () => {
    if (swipeY > 80) {
      setPeeled(true)
      setTimeout(() => {
        handleCheckIn()
        setTimeout(() => {
          setPeeled(false)
          setSwipeY(0)
        }, 500)
      }, 300)
    } else {
      setSwipeY(0)
    }
    setSwiping(false)
    startYRef.current = null
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/auth'
  }

  const cardStyle = {
    transform: peeled
      ? 'translateY(100%) rotate(3deg)'
      : `translateY(${swipeY}px) rotate(${swipeY * 0.02}deg)`,
    transition: peeled ? 'transform 0.3s ease-in' : swiping ? 'none' : 'transform 0.3s ease-out',
    cursor: 'grab',
  }

  return (
    <div className="min-h-screen bg-[#FFFBFC] pb-24" onMouseMove={onMouseMove} onMouseUp={onMouseUp}>
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

      {/* ロゴ */}
      <div className="flex justify-center pt-2 pb-4">
        <Image src="/logo.webp" alt="うちの子バトン" width={200} height={67} className="object-contain" priority />
      </div>

      {/* 日めくりカレンダー風カード */}
      <div className="px-6 mb-5 overflow-hidden">
        {/* 背面（めくれた後に見える） */}
        <div className="bg-pink-100 rounded-3xl mx-2 h-8 -mb-4" />
        <div className="bg-pink-200 rounded-3xl mx-4 h-8 -mb-4" />

        {/* メインカード */}
        <div
          ref={cardRef}
          style={cardStyle}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onMouseDown={onMouseDown}
          className="bg-white rounded-3xl shadow-lg border border-pink-100 overflow-hidden select-none"
        >
          {/* カレンダー上部（日付バー） */}
          <div className="bg-[#FFB7C5] px-5 py-3 flex items-center justify-between">
            <div className="flex gap-1">
              {['月', '火', '水', '木', '金', '土', '日'].map((d, i) => (
                <div key={d} className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  d === WEEKDAYS[today.getDay()] ? 'bg-white text-[#FFB7C5]' : 'text-white/60'
                }`}>{d}</div>
              ))}
            </div>
          </div>

          {/* カード本文 */}
          <div className="px-6 py-5 flex flex-col items-center gap-4">
            {/* 日付 */}
            <p className="text-2xl font-bold text-gray-700">{dateLabel}</p>

            {/* ペット写真 */}
            <div className="flex gap-4 justify-center">
              {pets.length === 0 ? (
                <div className="w-16 h-16 rounded-full bg-pink-50 border-2 border-pink-100 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#FFB7C5" strokeWidth={1.5} className="w-8 h-8">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                </div>
              ) : (
                pets.map(pet => (
                  <div key={pet.id} className="w-16 h-16 rounded-full overflow-hidden border-2 border-pink-100 shadow-sm">
                    {pet.image_url ? (
                      <img src={pet.image_url} alt={pet.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-pink-50 flex items-center justify-center">
                        <svg viewBox="0 0 24 24" fill="none" stroke="#FFB7C5" strokeWidth={1.5} className="w-8 h-8">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                        </svg>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* テキスト */}
            <div className="flex flex-col items-center gap-1">
              <p className="text-base font-bold text-gray-700">今日もそばにいるよ</p>
              <div className="flex items-center gap-1 text-gray-400">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                  <polyline points="7 13 12 18 17 13"/>
                  <polyline points="7 6 12 11 17 6"/>
                </svg>
                <span className="text-xs">下にスワイプして記録する</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* パートナー招待バナー */}
      {!partnerName && (
        <div className="mx-6 bg-white border border-pink-100 rounded-2xl p-4">
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

      {/* ポップアップ */}
      {popupOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-8"
          onClick={() => { setPopupOpen(false); router.push('/record') }}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-sm overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-center pt-6 pb-2">
              <div className="relative w-44 h-44">
                <svg viewBox="0 0 24 24" className="absolute -top-3 -left-1 w-8 h-8" fill="#FFB7C5">
                  <circle cx="12" cy="12" r="6"/><circle cx="12" cy="3" r="2.5"/><circle cx="12" cy="21" r="2.5"/>
                  <circle cx="3" cy="12" r="2.5"/><circle cx="21" cy="12" r="2.5"/>
                  <circle cx="5.5" cy="5.5" r="2"/><circle cx="18.5" cy="5.5" r="2"/>
                  <circle cx="5.5" cy="18.5" r="2"/><circle cx="18.5" cy="18.5" r="2"/>
                </svg>
                <svg viewBox="0 0 24 24" className="absolute -top-2 -right-2 w-7 h-7" fill="#FBBF24">
                  <circle cx="12" cy="12" r="6"/><circle cx="12" cy="3" r="2.5"/><circle cx="12" cy="21" r="2.5"/>
                  <circle cx="3" cy="12" r="2.5"/><circle cx="21" cy="12" r="2.5"/>
                  <circle cx="5.5" cy="5.5" r="2"/><circle cx="18.5" cy="5.5" r="2"/>
                  <circle cx="5.5" cy="18.5" r="2"/><circle cx="18.5" cy="18.5" r="2"/>
                </svg>
                <svg viewBox="0 0 24 24" className="absolute -bottom-2 -left-2 w-7 h-7" fill="#86EFAC">
                  <circle cx="12" cy="12" r="6"/><circle cx="12" cy="3" r="2.5"/><circle cx="12" cy="21" r="2.5"/>
                  <circle cx="3" cy="12" r="2.5"/><circle cx="21" cy="12" r="2.5"/>
                  <circle cx="5.5" cy="5.5" r="2"/><circle cx="18.5" cy="5.5" r="2"/>
                  <circle cx="5.5" cy="18.5" r="2"/><circle cx="18.5" cy="18.5" r="2"/>
                </svg>
                <svg viewBox="0 0 24 24" className="absolute -bottom-3 -right-1 w-8 h-8" fill="#FFB7C5">
                  <circle cx="12" cy="12" r="6"/><circle cx="12" cy="3" r="2.5"/><circle cx="12" cy="21" r="2.5"/>
                  <circle cx="3" cy="12" r="2.5"/><circle cx="21" cy="12" r="2.5"/>
                  <circle cx="5.5" cy="5.5" r="2"/><circle cx="18.5" cy="5.5" r="2"/>
                  <circle cx="5.5" cy="18.5" r="2"/><circle cx="18.5" cy="18.5" r="2"/>
                </svg>
                <svg viewBox="0 0 10 10" className="absolute top-0 right-4 w-4 h-4" fill="none" stroke="#FFB7C5" strokeWidth={1.5}>
                  <line x1="5" y1="0" x2="5" y2="10"/><line x1="0" y1="5" x2="10" y2="5"/>
                  <line x1="1" y1="1" x2="9" y2="9"/><line x1="9" y1="1" x2="1" y2="9"/>
                </svg>
                <svg viewBox="0 0 10 10" className="absolute bottom-2 left-4 w-3 h-3" fill="none" stroke="#FBBF24" strokeWidth={1.5}>
                  <line x1="5" y1="0" x2="5" y2="10"/><line x1="0" y1="5" x2="10" y2="5"/>
                  <line x1="1" y1="1" x2="9" y2="9"/><line x1="9" y1="1" x2="1" y2="9"/>
                </svg>
                <div className="absolute top-2 left-0 w-2 h-2 rounded-full bg-[#86EFAC]"/>
                <div className="absolute top-1 right-6 w-1.5 h-1.5 rounded-full bg-pink-300"/>
                <div className="absolute bottom-1 right-3 w-2 h-2 rounded-full bg-yellow-300"/>
                <div className="w-44 h-44 rounded-full overflow-hidden border-4 border-white shadow-md">
                  {randomImage ? (
                    <img src={randomImage} alt="今日のうちの子" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-pink-50 flex items-center justify-center">
                      <svg viewBox="0 0 24 24" fill="none" stroke="#FFB7C5" strokeWidth={1.5} className="w-16 h-16">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="px-5 pt-2 pb-6 flex flex-col items-center gap-3">
              <p className="text-center text-base font-bold text-gray-700">今日も一緒にいるね！</p>
              <div className="relative flex items-center justify-center">
                <div style={{ width: 0, height: 0, borderTop: '14px solid transparent', borderBottom: '14px solid transparent', borderRight: '12px solid #FFB7C5' }} />
                <div className="bg-[#FFB7C5] px-4 py-1">
                  <span className="text-white text-xs font-medium">今日のうちの子：オキ家のおこめちゃん</span>
                </div>
                <div style={{ width: 0, height: 0, borderTop: '14px solid transparent', borderBottom: '14px solid transparent', borderLeft: '12px solid #FFB7C5' }} />
              </div>
              <button
                onClick={() => { setPopupOpen(false); router.push('/record') }}
                className="text-xs text-[#FFB7C5] border border-pink-200 rounded-full px-5 py-2"
              >
                ペットの記録もつける
              </button>
              <button
                onClick={() => setPopupOpen(false)}
                className="text-xs text-gray-400"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  )
}