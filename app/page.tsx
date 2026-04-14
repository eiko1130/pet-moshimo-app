'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/AuthProvider'
import BottomNav from '@/components/BottomNav'

const toLocalDateString = () => {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const formatDateTime = (isoString: string) => {
  const d = new Date(isoString)
  const m = d.getMonth() + 1
  const day = d.getDate()
  const h = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${m}月${day}日 ${h}:${min}`
}

const formatDeadline = (isoString: string, alertHours: number) => {
  const d = new Date(new Date(isoString).getTime() + alertHours * 60 * 60 * 1000)
  const m = d.getMonth() + 1
  const day = d.getDate()
  const h = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${m}月${day}日 ${h}:${min}`
}

const calcRemaining = (isoString: string, alertHours: number) => {
  const deadline = new Date(new Date(isoString).getTime() + alertHours * 60 * 60 * 1000)
  const diff = deadline.getTime() - Date.now()
  if (diff <= 0) return null
  const totalMin = Math.floor(diff / 60000)
  const h = Math.floor(totalMin / 60)
  const min = totalMin % 60
  if (h > 0) return `残り${h}時間${min}分`
  return `残り${min}分`
}

const WEEKDAYS_JP = ['日', '月', '火', '水', '木', '金', '土']
const WEEKDAYS_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default function HomePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [partnerName, setPartnerName] = useState<string | null>(null)
  const [lastCheckedAt, setLastCheckedAt] = useState<string | null>(null)
  const [alertHours, setAlertHours] = useState<number>(24)
  const [checkinTime, setCheckinTime] = useState<string | null>(null) // 直前のチェックイン時刻

  const [swipeY, setSwipeY] = useState(0)
  const [swiping, setSwiping] = useState(false)
  const [peeled, setPeeled] = useState(false)
  const [done, setDone] = useState(false)
  const [remaining, setRemaining] = useState<string | null>(null)
  const startYRef = useRef<number | null>(null)

  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth() + 1
  const dow = today.getDay()

  useEffect(() => {
    if (!user) return
    const fetchData = async () => {
      const { data: moshimoData } = await supabase
        .from('moshimo_info')
        .select('proxy_user_id, proxy_approved_at, proxy_name, last_checked_at, alert_hours')
        .eq('user_id', user.id)
        .single()
      if (moshimoData?.proxy_user_id && moshimoData?.proxy_approved_at) {
        setPartnerName(moshimoData.proxy_name ?? 'パートナー')
      }
      if (moshimoData?.last_checked_at) {
        setLastCheckedAt(moshimoData.last_checked_at)
      }
      if (moshimoData?.alert_hours) {
        setAlertHours(moshimoData.alert_hours)
      }
    }
    fetchData()
  }, [user])

  // 残り時間を1分ごとに更新
  useEffect(() => {
    if (!lastCheckedAt) return
    const update = () => setRemaining(calcRemaining(lastCheckedAt, alertHours))
    update()
    const timer = setInterval(update, 60000)
    return () => clearInterval(timer)
  }, [lastCheckedAt, alertHours])

  const triggerCheckin = async () => {
    const now = new Date().toISOString()
    if (user) {
      await supabase.from('moshimo_info')
        .update({ last_checked_at: now })
        .eq('user_id', user.id)
      setCheckinTime(now)
      setLastCheckedAt(now)
    }
  }

  const handleSwipeEnd = () => {
    if (swipeY > 80) {
      setPeeled(true)
      triggerCheckin()
      setTimeout(() => { setDone(true); setPeeled(false); setSwipeY(0) }, 400)
    } else {
      setSwipeY(0)
    }
    setSwiping(false)
    startYRef.current = null
  }

  const onTouchStart = (e: React.TouchEvent) => { startYRef.current = e.touches[0].clientY; setSwiping(true) }
  const onTouchMove = (e: React.TouchEvent) => {
    if (startYRef.current === null) return
    const diff = e.touches[0].clientY - startYRef.current
    if (diff > 0) setSwipeY(Math.min(diff, 300))
  }
  const onTouchEnd = () => handleSwipeEnd()
  const onMouseDown = (e: React.MouseEvent) => { startYRef.current = e.clientY; setSwiping(true) }
  const onMouseMove = (e: React.MouseEvent) => {
    if (!swiping || startYRef.current === null) return
    const diff = e.clientY - startYRef.current
    if (diff > 0) setSwipeY(Math.min(diff, 300))
  }
  const onMouseUp = () => handleSwipeEnd()

  const cardTransform = peeled
    ? 'translateY(110%) rotate(3deg)'
    : `translateY(${swipeY}px) rotate(${swipeY * 0.01}deg)`
  const cardTransition = peeled
    ? 'transform 0.4s ease-in'
    : swiping ? 'none' : 'transform 0.3s ease-out'

  return (
    <div
      className="min-h-screen pb-24"
      style={{ backgroundColor: '#F5C842' }}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
    >
      {/* ヘッダー（ロゴのみ） */}
      <header className="flex items-center justify-center px-5 pt-5 pb-3">
        <Image src="/logo.webp" alt="うちの子バトン" width={200} height={67} className="object-contain" priority />
      </header>

      {/* カレンダー本体 */}
      <div className="px-8">

        {/* 木枠 */}
        <div className="relative rounded-t-2xl" style={{ backgroundColor: '#C8A96E' }}>
          <div className="flex justify-center pt-2 pb-1">
            <div style={{
              width: '40px', height: '22px',
              borderRadius: '20px 20px 0 0',
              border: '3px solid #A0845C',
              borderBottom: 'none',
              backgroundColor: '#F5C842',
            }} />
          </div>
          <div style={{ height: '8px', backgroundColor: '#A0845C', marginTop: '2px' }} />
        </div>

        {/* カードエリア */}
        <div className="relative" style={{ minHeight: '480px' }}>

          {/* 後ろのページ3枚 */}
          <div className="absolute top-3 bottom-0" style={{ backgroundColor: '#ccc5b8', zIndex: 0, left: 0, right: '-8px' }} />
          <div className="absolute top-1.5 bottom-0" style={{ backgroundColor: '#ddd8ce', zIndex: 1, left: 0, right: '-4px' }} />
          <div className="absolute inset-0" style={{ backgroundColor: '#edeae4', zIndex: 2 }} />

          {/* めくった後のページ */}
          {done && (
  <div className="relative z-10" style={{ backgroundColor: '#FFFEF9', minHeight: '480px' }}>
              <div className="flex flex-col items-center px-6 pt-10 pb-10 gap-5">

                {/* チェックマーク */}
                <div className="flex items-center justify-center w-16 h-16 rounded-full" style={{ backgroundColor: '#FFF0F3' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#FFB7C5" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>

                {/* 確認時刻メッセージ */}
                <div className="w-full text-center">
                  <p className="text-base font-bold text-gray-700 leading-relaxed">
                    {checkinTime ? formatDateTime(checkinTime) : ''}に確認しました！
                  </p>
                  <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                    次は
                    <span className="font-bold text-gray-700 mx-1">
                      {checkinTime ? formatDeadline(checkinTime, alertHours) : ''}まで
                    </span>
                    にまた来てください。
                  </p>
                </div>

                {/* 区切り */}
                <div className="w-full border-t border-gray-100" />

                {/* 記録ボタン */}
                <button
                  onClick={() => router.push('/record')}
                  className="w-full text-white font-bold py-3 rounded-2xl text-sm"
                  style={{ backgroundColor: '#FFB7C5' }}
                >
                  ペットの記録もつける
                </button>
                <button onClick={() => setDone(false)} className="text-xs text-gray-400">閉じる</button>
              </div>
            </div>
          )}

          {/* スワイプカード */}
          {!done && (
            <div
              className="relative z-10"
              style={{
                transform: cardTransform,
                transition: cardTransition,
                cursor: swiping ? 'grabbing' : 'grab',
                margin: '0 4px',
              }}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
              onMouseDown={onMouseDown}
            >
              <div style={{ backgroundColor: '#FFFEF9', position: 'relative', overflow: 'hidden' }}>

                {/* 日付 */}
                <div className="flex items-center justify-between px-5 pt-4 pb-2">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xs text-gray-400">{year}年</span>
                    <span className="text-sm font-medium text-gray-500">{month}月</span>
                    <span className="text-xs text-gray-300">{MONTHS_EN[today.getMonth()]}</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-sm font-bold text-gray-500">{WEEKDAYS_JP[dow]}曜日</span>
                    <span className="text-xs text-gray-300">{WEEKDAYS_EN[dow]}</span>
                  </div>
                </div>

                {/* 区切り線 */}
                <div className="mx-5 border-t border-gray-100" />

                {/* 最終確認時刻・残り時間 */}
                {lastCheckedAt && (
                  <div className="mx-5 mt-3 px-3 py-2 rounded-xl" style={{ backgroundColor: '#FFF0F3' }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <svg viewBox="0 0 24 24" fill="none" stroke="#FFB7C5" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 flex-shrink-0">
                          <circle cx="12" cy="12" r="10"/>
                          <polyline points="12 6 12 12 16 14"/>
                        </svg>
                        <span className="text-xs text-gray-500">最終確認：{formatDateTime(lastCheckedAt)}</span>
                      </div>
                      {remaining && (
                        <span className="text-xs font-bold" style={{ color: '#FFB7C5' }}>{remaining}</span>
                      )}
                    </div>
                  </div>
                )}

                {/* 今日もめくって記録しよう */}
                <p className="text-center text-sm font-bold pt-3" style={{ color: '#555' }}>今日もめくって記録しよう</p>

                {/* メインイラスト */}
                <div className="px-5 pt-2">
                  <div className="relative w-full aspect-square rounded-xl overflow-hidden">
                    <Image src="/main.webp" alt="" fill className="object-cover" priority />
                  </div>
                </div>

                {/* スワイプ誘導 */}
                <div className="relative flex flex-col items-center pt-3 pb-8 gap-1">
                  <p className="text-xs font-medium" style={{ color: '#555' }}>下にスワイプして記録する</p>
                  <div style={{ animation: 'finger-down 1.2s ease-in-out infinite' }}>
                    <svg viewBox="0 0 24 24" fill="#FFB7C5" className="w-7 h-7">
                      <path d="M9 11.24V7.5C9 6.12 10.12 5 11.5 5S14 6.12 14 7.5v3.74c1.21-.81 2-2.18 2-3.74C16 5.01 13.99 3 11.5 3S7 5.01 7 7.5c0 1.56.79 2.93 2 3.74zm9.84 4.63l-4.54-2.26c-.17-.07-.35-.11-.54-.11H13v-6c0-.83-.67-1.5-1.5-1.5S10 6.67 10 7.5v10.74l-3.43-.72c-.08-.01-.15-.03-.24-.03-.31 0-.59.13-.79.33l-.79.8 4.94 4.94c.27.27.65.44 1.06.44h6.79c.75 0 1.33-.55 1.44-1.28l.75-5.27c.01-.07.02-.14.02-.2 0-.62-.38-1.16-.91-1.38z"/>
                    </svg>
                  </div>

                  {/* 右下の折り目 */}
                  <div className="absolute bottom-0 right-0 w-10 h-10">
                    <div style={{
                      position: 'absolute', bottom: 0, right: 0,
                      width: 0, height: 0,
                      borderLeft: '40px solid transparent',
                      borderBottom: '40px solid #FFFEF9',
                    }} />
                    <div style={{
                      position: 'absolute', bottom: 0, right: 0,
                      width: '40px', height: '40px',
                      background: 'linear-gradient(135deg, #d4cbbf 50%, transparent 50%)',
                    }} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* パートナー招待バナー */}
      {!partnerName && (
        <div className="mx-8 mt-5 bg-white border border-pink-100 rounded-2xl p-4">
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

      <style jsx>{`
        @keyframes finger-down {
          0%, 100% { transform: translateY(0); opacity: 1; }
          50% { transform: translateY(10px); opacity: 0.5; }
        }
      `}</style>

      <BottomNav />
    </div>
  )
}