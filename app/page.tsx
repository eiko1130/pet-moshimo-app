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
  const [partnerName, setPartnerName] = useState<string | null>(null)

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
      <div className="flex justify-center pt-2 pb-2">
        <Image src="/logo.webp" alt="うちの子バトン" width={200} height={67} className="object-contain" priority />
      </div>

      {/* メインイラスト（飾り） */}
      <div className="px-10 mb-4">
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

      {/* チェックインボタン */}
      <div className="px-6 mb-5">
        <button
          onClick={handleCheckIn}
          className="relative w-full bg-[#FFB7C5] rounded-3xl py-6 flex flex-col items-center gap-3 shadow-md active:scale-95 transition-transform"
        >
          {/* 吹き出し */}
          <div className="relative flex justify-center mb-1">
            <div className="bg-white rounded-2xl px-5 py-2 shadow-sm relative">
              <span className="text-[#FFB7C5] text-base font-bold">今日もそばにいるよ</span>
              {/* 吹き出しの三角 */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0"
                style={{ borderLeft: '8px solid transparent', borderRight: '8px solid transparent', borderTop: '10px solid white' }}
              />
            </div>
          </div>

          {/* ペットアイコン横並び（名前なし） */}
          <div className="flex gap-3 justify-center mt-2">
            {pets.length === 0 ? (
              <div className="w-14 h-14 rounded-full bg-white/40 flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="white" className="w-7 h-7">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              </div>
            ) : (
              pets.map(pet => (
                <div key={pet.id} className="w-14 h-14 rounded-full overflow-hidden border-2 border-white/60 bg-white/30">
                  {pet.image_url ? (
                    <img src={pet.image_url} alt={pet.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg viewBox="0 0 24 24" fill="white" className="w-7 h-7">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                      </svg>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* サブテキスト */}
          <span className="text-white/80 text-xs mt-2">タップして今日の記録を残す</span>

          {/* 指先アニメーション */}
          <div
            className="absolute bottom-3 right-5"
            style={{ animation: 'bounce-finger 1.5s ease-in-out infinite' }}
          >
            <svg viewBox="0 0 24 24" fill="white" className="w-7 h-7 opacity-80">
              <path d="M9 11.24V7.5C9 6.12 10.12 5 11.5 5S14 6.12 14 7.5v3.74c1.21-.81 2-2.18 2-3.74C16 5.01 13.99 3 11.5 3S7 5.01 7 7.5c0 1.56.79 2.93 2 3.74zm9.84 4.63l-4.54-2.26c-.17-.07-.35-.11-.54-.11H13v-6c0-.83-.67-1.5-1.5-1.5S10 6.67 10 7.5v10.74l-3.43-.72c-.08-.01-.15-.03-.24-.03-.31 0-.59.13-.79.33l-.79.8 4.94 4.94c.27.27.65.44 1.06.44h6.79c.75 0 1.33-.55 1.44-1.28l.75-5.27c.01-.07.02-.14.02-.2 0-.62-.38-1.16-.91-1.38z"/>
            </svg>
          </div>
        </button>
      </div>

      {/* パートナー招待バナー（未設定の場合のみ） */}
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

      {/* アニメーション定義 */}
      <style jsx>{`
        @keyframes bounce-finger {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
      `}</style>

      <BottomNav />
    </div>
  )
}