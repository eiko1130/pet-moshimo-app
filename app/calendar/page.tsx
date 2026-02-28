'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/AuthProvider'
import BottomNav from '@/components/BottomNav'
import type { PetRecord } from '@/types'

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土']
const MOOD_COLOR = { good: 'bg-pink-400', normal: 'bg-yellow-400', bad: 'bg-gray-400' }

export default function CalendarPage() {
  const { user } = useAuth()
  const [year, setYear] = useState(new Date().getFullYear())
  const [month, setMonth] = useState(new Date().getMonth())
  const [records, setRecords] = useState<PetRecord[]>([])
  const [selectedDate, setSelectedDate] = useState<string | null>(
    new Date().toISOString().split('T')[0]
  )
  const [selectedRecords, setSelectedRecords] = useState<PetRecord[]>([])

  useEffect(() => {
    if (!user) return
    const from = `${year}-${String(month + 1).padStart(2, '0')}-01`
    const lastDay = new Date(year, month + 1, 0).getDate()
    const to = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
    supabase
      .from('pet_records')
      .select('*, pet:my_pets(name, photo_url)')
      .gte('date', from)
      .lte('date', to)
      .then(({ data }) => setRecords(data ?? []))
  }, [user, year, month])

  useEffect(() => {
    if (!selectedDate) return
    setSelectedRecords(records.filter(r => r.date === selectedDate))
  }, [selectedDate, records])

  const datesWithRecords = new Set(records.map(r => r.date))

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
    if (!selectedDate) return ''
    const d = new Date(selectedDate)
    const wd = WEEKDAYS[d.getDay()]
    return `${d.getMonth() + 1}月${d.getDate()}日（${wd}）`
  }

  return (
    <div className="min-h-screen bg-[#FFFBFC] pb-24">
      <header className="bg-[#FFB7C5] text-white text-center py-4 text-lg font-bold">
        見守り記録カレンダー
      </header>

      {/* カレンダー */}
      <div className="mx-4 mt-4 bg-white rounded-2xl shadow-sm border border-gray-50 p-4">
        {/* 月ナビ */}
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

        {/* 曜日ヘッダー */}
        <div className="grid grid-cols-7 mb-1">
          {WEEKDAYS.map((w, i) => (
            <div key={w} className={`text-center text-xs py-1 font-medium ${i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-gray-400'}`}>
              {w}
            </div>
          ))}
        </div>

        {/* 日付グリッド */}
        <div className="grid grid-cols-7">
          {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
            const isToday = dateStr === today
            const isSelected = dateStr === selectedDate
            const hasRecord = datesWithRecords.has(dateStr)
            const dayOfWeek = (firstDay + i) % 7

            return (
              <button
                key={day}
                onClick={() => setSelectedDate(dateStr)}
                className={`flex flex-col items-center py-1.5 rounded-xl transition-all ${
                  isSelected ? 'bg-pink-100' : ''
                }`}
              >
                <span className={`text-sm w-7 h-7 flex items-center justify-center rounded-full font-medium ${
                  isToday ? 'bg-[#FFB7C5] text-white' :
                  dayOfWeek === 0 ? 'text-red-400' :
                  dayOfWeek === 6 ? 'text-blue-400' :
                  'text-gray-600'
                }`}>
                  {day}
                </span>
                {hasRecord && <div className="w-1.5 h-1.5 rounded-full bg-[#FFB7C5] mt-0.5" />}
              </button>
            )
          })}
        </div>
      </div>

      {/* 選択日の記録 */}
      {selectedDate && (
        <div className="mx-4 mt-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-700">{formatSelectedDate()}の記録</h3>
            {selectedRecords.length > 0 && (
              <span className="text-xs text-gray-400">{selectedRecords.length}件のペットを記録</span>
            )}
          </div>

          {selectedRecords.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">この日の記録はありません</p>
          ) : (
            <div className="space-y-3">
              {selectedRecords.map(record => (
                <div key={record.id} className="bg-white rounded-2xl border border-gray-100 p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-pink-50 shrink-0">
                      {(record.pet as any)?.photo_url ? (
                        <img src={(record.pet as any).photo_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xl">🐱</div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-gray-700">{(record.pet as any)?.name}</span>
                        {record.mood && (
                          <span className={`text-xs px-2 py-0.5 rounded-full text-white ${
                            record.mood === 'good' ? 'bg-green-400' :
                            record.mood === 'normal' ? 'bg-yellow-400' : 'bg-gray-400'
                          }`}>
                            {record.mood === 'good' ? '元気いっぱい' : record.mood === 'normal' ? '普通' : '体調注意'}
                          </span>
                        )}
                      </div>
                      {record.content && <p className="text-xs text-gray-500">{record.content}</p>}
                      {record.image_url && (
                        <img src={record.image_url} alt="" className="mt-2 w-16 h-16 rounded-xl object-cover" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={() => {}}
            className="w-full mt-3 border-2 border-dashed border-pink-200 rounded-2xl py-3 text-sm text-[#FFB7C5] font-medium flex items-center justify-center gap-2"
          >
            <span className="text-lg">+</span> 他の子の記録を追加
          </button>
        </div>
      )}

      {/* FAB */}
      <a
        href="/record"
        className="fixed bottom-20 right-5 w-12 h-12 bg-[#FFB7C5] rounded-full shadow-lg flex items-center justify-center text-white"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-5 h-5">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
      </a>

      <BottomNav />
    </div>
  )
}
