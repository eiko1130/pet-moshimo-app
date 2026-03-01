'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/AuthProvider'
import BottomNav from '@/components/BottomNav'
import type { Pet, PetRecord } from '@/types'

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土']

const MoodIcon = ({ mood, active }: { mood: string | null, active?: boolean }) => {
  const color = active ? 'white' : mood === 'good' ? '#4ade80' : mood === 'normal' ? '#facc15' : mood === 'bad' ? '#f87171' : '#d1d5db'
  if (mood === 'good') return (
    <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} className="w-5 h-5">
      <circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/>
      <line x1="9" y1="9" x2="9.01" y2="9" strokeWidth={3} strokeLinecap="round"/>
      <line x1="15" y1="9" x2="15.01" y2="9" strokeWidth={3} strokeLinecap="round"/>
    </svg>
  )
  if (mood === 'normal') return (
    <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} className="w-5 h-5">
      <circle cx="12" cy="12" r="10"/><line x1="8" y1="15" x2="16" y2="15"/>
      <line x1="9" y1="9" x2="9.01" y2="9" strokeWidth={3} strokeLinecap="round"/>
      <line x1="15" y1="9" x2="15.01" y2="9" strokeWidth={3} strokeLinecap="round"/>
    </svg>
  )
  if (mood === 'bad') return (
    <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} className="w-5 h-5">
      <circle cx="12" cy="12" r="10"/><path d="M16 16s-1.5-2-4-2-4 2-4 2"/>
      <line x1="9" y1="9" x2="9.01" y2="9" strokeWidth={3} strokeLinecap="round"/>
      <line x1="15" y1="9" x2="15.01" y2="9" strokeWidth={3} strokeLinecap="round"/>
    </svg>
  )
  return null
}

const moodLabel = (mood: string | null) => {
  if (mood === 'good') return '元気いっぱい'
  if (mood === 'normal') return '普通'
  if (mood === 'bad') return '体調注意'
  return '-'
}

export default function CalendarPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [year, setYear] = useState(new Date().getFullYear())
  const [month, setMonth] = useState(new Date().getMonth())
  const [records, setRecords] = useState<PetRecord[]>([])
  const [pets, setPets] = useState<Pet[]>([])
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  )

  const toDateStr = (y: number, m: number, d: number) =>
    `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`

  useEffect(() => {
    if (!user) return
    supabase.from('my_pets').select('*').then(({ data }) => setPets(data ?? []))
  }, [user])

  useEffect(() => {
    if (!user) return
    const from = toDateStr(year, month, 1)
    const lastDay = new Date(year, month + 1, 0).getDate()
    const to = toDateStr(year, month, lastDay)
    supabase
      .from('pet_records')
      .select('*')
      .gte('date', from)
      .lte('date', to)
      .then(({ data }) => setRecords(data ?? []))
  }, [user, year, month])

  const datesWithRecords = new Set(records.map(r => r.date))
  const selectedRecords = records.filter(r => r.date === selectedDate)

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today = new Date().toISOString().split('T')[0]

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
  }

  const formatSelectedDate = () => {
    const d = new Date(selectedDate + 'T00:00:00')
    const wd = WEEKDAYS[d.getDay()]
    return `${d.getMonth() + 1}月${d.getDate()}日（${wd}）`
  }

  const getPet = (petId: string) => pets.find(p => p.id === petId)

  return (
    <div className="min-h-screen bg-[#FFFBFC] pb-24">
      <header className="bg-[#FFB7C5] text-white text-center py-4 text-lg font-bold">
        見守り記録カレンダー
      </header>

      <div className="mx-4 mt-4 bg-white rounded-2xl shadow-sm border border-gray-50 p-4">
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevMonth} className="text-gray-400 p-1">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <span className="font-bold text-gray-700">{year}年 {month + 1}月</span>
          <button onClick={nextMonth} className="text-gray-400 p-1">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-7 mb-1">
          {WEEKDAYS.map((w, i) => (
            <div key={w} className={`text-center text-xs py-1 font-medium ${
              i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-gray-400'
            }`}>{w}</div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1
            const dateStr = toDateStr(year, month, day)
            const isToday = dateStr === today
            const isSelected = dateStr === selectedDate
            const hasRecord = datesWithRecords.has(dateStr)
            const dow = (firstDay + i) % 7

            return (
              <button
                key={day}
                onClick={() => setSelectedDate(dateStr)}
                className={`flex flex-col items-center py-1.5 rounded-xl transition-all ${isSelected ? 'bg-pink-50' : ''}`}
              >
                <span className={`text-sm w-7 h-7 flex items-center justify-center rounded-full font-medium ${
                  isToday ? 'bg-[#FFB7C5] text-white' :
                  dow === 0 ? 'text-red-400' :
                  dow === 6 ? 'text-blue-400' :
                  'text-gray-600'
                }`}>{day}</span>
                {hasRecord
                  ? <div className="w-1.5 h-1.5 rounded-full bg-[#FFB7C5] mt-0.5" />
                  : <div className="w-1.5 h-1.5 mt-0.5" />
                }
              </button>
            )
          })}
        </div>
      </div>

      {/* 選択日の記録 */}
      <div className="mx-4 mt-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-gray-700">{formatSelectedDate()}の記録</h3>
          {selectedRecords.length > 0 && (
            <span className="text-xs text-gray-400">{selectedRecords.length}件</span>
          )}
        </div>

        {selectedRecords.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-gray-400 mb-3">この日の記録はありません</p>
            <button
              onClick={() => router.push('/record')}
              className="text-xs text-[#FFB7C5] border border-pink-200 rounded-full px-4 py-2"
            >
              + 記録を追加
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {selectedRecords.map(record => {
              const pet = getPet(record.pet_id)
              const thumbUrl = record.image_url || pet?.image_url || null
              return (
                <button
                  key={record.id}
                  onClick={() => router.push(`/calendar/${record.id}`)}
                  className="w-full bg-white rounded-2xl border border-gray-100 p-4 text-left"
                >
                  <div className="flex items-start gap-3">
                    {/* サムネイル：記録写真 > ペット写真 */}
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-pink-50 shrink-0">
                      {thumbUrl ? (
                        <img src={thumbUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">🐱</div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-gray-700 text-sm">{pet?.name ?? '不明'}</span>
                        <div className="flex items-center gap-1">
                          <MoodIcon mood={record.mood} />
                          <span className="text-xs text-gray-500">{moodLabel(record.mood)}</span>
                        </div>
                      </div>
                      {record.memo && (
                        <p className="text-xs text-gray-500 line-clamp-2">{record.memo}</p>
                      )}
                    </div>
                  </div>
                </button>
              )
            })}

            {pets.filter(p => !selectedRecords.some(r => r.pet_id === p.id)).length > 0 && (
              <button
                onClick={() => router.push('/record')}
                className="w-full border-2 border-dashed border-pink-200 rounded-2xl py-3 text-sm text-[#FFB7C5] font-medium flex items-center justify-center gap-2"
              >
                <span className="text-lg">+</span> 他の子の記録を追加
              </button>
            )}
          </div>
        )}
      </div>

      <button
        onClick={() => router.push('/record')}
        className="fixed bottom-20 right-5 w-12 h-12 bg-[#FFB7C5] rounded-full shadow-lg flex items-center justify-center text-white"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-5 h-5">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
      </button>

      <BottomNav />
    </div>
  )
}