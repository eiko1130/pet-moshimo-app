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

type PopupState = 'unchecked' | 'partial' | 'complete'

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
  const [recordedPetIds, setRecordedPetIds] = useState<string[]>([])
  const [randomImage, setRandomImage] = useState<string | null>(null)
  const [popupOpen, setPopupOpen] = useState(false)
  const [popupState, setPopupState] = useState<PopupState>('unchecked')

  useEffect(() => {
    if (!user) return
    const today = toLocalDateString()

    const fetchData = async () => {
      const { data: petsData } = await supabase
        .from('my_pets')
        .select('id, name, image_url')
        .eq('user_id', user.id)
        .order('created_at')

      const petList = petsData ?? []
      setPets(petList)

      const { data: recordsData } = await supabase
        .from('pet_records')
        .select('pet_id, image_url')
        .eq('user_id', user.id)
        .eq('date', today)

      const records = recordsData ?? []
      const recorded = records.map(r => r.pet_id)
      setRecordedPetIds(recorded)

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
    }

    fetchData()
  }, [user])

  const handleCheckIn = () => {
    if (pets.length === 0) {
      setPopupState('unchecked')
      setPopupOpen(true)
      return
    }
    const unrecorded = pets.filter(p => !recordedPetIds.includes(p.id))
    if (recordedPetIds.length === 0) {
      setPopupState('unchecked')
    } else if (unrecorded.length > 0) {
      setPopupState('partial')
    } else {
      setPopupState('complete')
    }
    setPopupOpen(true)
  }

  const unrecordedPets = pets.filter(p => !recordedPetIds.includes(p.id))
  const today = toLocalDateString()

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
        <Image src="/logo.webp" alt="もしも手帳" width={240} height={48} priority />
      </div>

    {/* メイン画像ボタン */}
    <div className="px-10">
        <button
          onClick={handleCheckIn}
          className="relative w-full rounded-3xl overflow-hidden"
        >
          <Image
            src="/main.webp"
            alt="今日も元気！"
            width={400}
            height={400}
            className="w-full object-cover"
          />
          {/* 丸ボタン（中央に配置） */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
            <div className="w-16 h-16 rounded-full bg-[#FFB7C5] flex items-center justify-center shadow-md">
              <svg viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth={1.5} className="w-7 h-7">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </div>
            <span className="text-xs font-medium text-white drop-shadow">今日も元気！</span>
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

      {/* ポップアップ */}
      {popupOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={() => setPopupOpen(false)}>
          <div className="w-full max-w-md bg-white rounded-t-3xl p-6 pb-10" onClick={e => e.stopPropagation()}>

            {popupState === 'unchecked' && (
              <>
                {randomImage && (
                  <div className="w-full h-48 rounded-2xl overflow-hidden mb-4">
                    <img src={randomImage} alt="うちの子" className="w-full h-full object-cover" />
                  </div>
                )}
                <p className="text-center text-lg font-bold text-gray-700 mb-1">今日も元気を確認しました！</p>
                <p className="text-center text-sm text-gray-400 mb-5">ペットの記録もつけてみませんか？</p>
                {unrecordedPets.length > 0 && (
                  <div className="flex gap-3 justify-center flex-wrap mb-5">
                    {unrecordedPets.map(pet => (
                      <button key={pet.id} onClick={() => { setPopupOpen(false); router.push(`/record?petId=${pet.id}`) }} className="flex flex-col items-center gap-1">
                        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-pink-200">
                          {pet.image_url ? (
                            <img src={pet.image_url} alt={pet.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-pink-50 flex items-center justify-center">
                              <svg viewBox="0 0 24 24" fill="none" stroke="#FFB7C5" strokeWidth={2} className="w-7 h-7">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                              </svg>
                            </div>
                          )}
                        </div>
                        <span className="text-xs text-gray-500 font-medium">{pet.name}</span>
                      </button>
                    ))}
                  </div>
                )}
                <button onClick={() => setPopupOpen(false)} className="w-full py-3 rounded-2xl border border-gray-200 text-sm text-gray-400">
                  あとで
                </button>
              </>
            )}

            {popupState === 'partial' && (
              <>
                <p className="text-center text-lg font-bold text-gray-700 mb-1">今日は確認済みです</p>
                <p className="text-center text-sm text-gray-400 mb-5">まだ記録していない子がいます</p>
                <div className="flex gap-3 justify-center flex-wrap mb-5">
                  {unrecordedPets.map(pet => (
                    <button key={pet.id} onClick={() => { setPopupOpen(false); router.push(`/record?petId=${pet.id}`) }} className="flex flex-col items-center gap-1">
                      <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-pink-200">
                        {pet.image_url ? (
                          <img src={pet.image_url} alt={pet.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-pink-50 flex items-center justify-center">
                            <svg viewBox="0 0 24 24" fill="none" stroke="#FFB7C5" strokeWidth={2} className="w-7 h-7">
                              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                            </svg>
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-gray-500 font-medium">{pet.name}</span>
                    </button>
                  ))}
                </div>
                <button onClick={() => setPopupOpen(false)} className="w-full py-3 rounded-2xl border border-gray-200 text-sm text-gray-400">
                  閉じる
                </button>
              </>
            )}

            {popupState === 'complete' && (
              <>
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-pink-50 flex items-center justify-center">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#FFB7C5" strokeWidth={2} className="w-8 h-8">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                </div>
                <p className="text-center text-lg font-bold text-gray-700 mb-1">全ての記録が完了しています！</p>
                <p className="text-center text-sm text-gray-400 mb-5">今日の記録を見てみましょう</p>
                <button onClick={() => { setPopupOpen(false); router.push(`/calendar/${today}`) }} className="w-full bg-[#FFB7C5] text-white font-bold py-4 rounded-2xl text-base mb-3">
                  今日の記録を見る
                </button>
                <button onClick={() => setPopupOpen(false)} className="w-full py-3 rounded-2xl border border-gray-200 text-sm text-gray-400">
                  閉じる
                </button>
              </>
            )}

          </div>
        </div>
      )}

      <BottomNav />
    </div>
  )
}