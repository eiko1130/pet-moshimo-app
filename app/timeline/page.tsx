'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/AuthProvider'
import BottomNav from '@/components/BottomNav'
import type { Pet, PetRecord } from '@/types'

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土']
type Tab = 'timeline' | 'calendar' | 'gallery'
type PartnerType = 'self' | 'partner' | 'friend'

// ダミーデータ
const DUMMY_RECORDS = [
  {
    id: 'dummy-1',
    ownerName: 'エイコ',
    ownerType: 'self' as PartnerType,
    petName: 'しらす',
    petAvatar: null,
    date: '2026-04-07',
    mood: 'good',
    memo: '今日はひなたぼっこしながらうとうとしてた。かわいすぎる。',
    imageUrl: 'https://nukpisixfolbnzkvorym.supabase.co/storage/v1/object/public/pet-images/0.09657611072125127.jpeg',
    items: [],
  },
  {
    id: 'dummy-2',
    ownerName: '山田さん',
    ownerType: 'partner' as PartnerType,
    petName: 'まめ',
    petAvatar: null,
    date: '2026-04-07',
    mood: 'good',
    memo: '公園でお散歩！落ち葉をかさかさ踏むのが楽しそうだった。',
    imageUrl: 'https://nukpisixfolbnzkvorym.supabase.co/storage/v1/object/public/pet-images/mock/timelinedog1.jpeg',
    items: ['体重 3.1kg'],
  },
  {
    id: 'dummy-3',
    ownerName: '鈴木さん',
    ownerType: 'friend' as PartnerType,
    petName: 'ぴより',
    petAvatar: null,
    date: '2026-04-06',
    mood: 'normal',
    memo: 'ケージの掃除をしたらご機嫌ナナメ。でもごはんはちゃんと食べた。',
    imageUrl: 'https://nukpisixfolbnzkvorym.supabase.co/storage/v1/object/public/pet-images/mock/timelinebird1.jpeg',
    items: [],
  },
  {
    id: 'dummy-4',
    ownerName: 'エイコ',
    ownerType: 'self' as PartnerType,
    petName: 'おこめ',
    petAvatar: null,
    date: '2026-04-06',
    mood: 'good',
    memo: 'おやつをあげたら手から食べてくれた！成長した…！',
    imageUrl: 'https://nukpisixfolbnzkvorym.supabase.co/storage/v1/object/public/pet-images/0.033192628447572425.jpeg',
    items: ['爪切り'],
  },
  {
    id: 'dummy-5',
    ownerName: '山田さん',
    ownerType: 'partner' as PartnerType,
    petName: 'まめ',
    petAvatar: null,
    date: '2026-04-05',
    mood: 'bad',
    memo: '朝からご飯をあまり食べなかった。夕方には元気になったけど心配。',
    imageUrl: 'https://nukpisixfolbnzkvorym.supabase.co/storage/v1/object/public/pet-images/mock/timelinedog2.jpeg',
    items: ['食欲なし'],
  },
  {
    id: 'dummy-6',
    ownerName: '鈴木さん',
    ownerType: 'friend' as PartnerType,
    petName: 'ぴより',
    petAvatar: null,
    date: '2026-04-05',
    mood: 'good',
    memo: '今日は歌いっぱなし。元気すぎる。',
    imageUrl: 'https://nukpisixfolbnzkvorym.supabase.co/storage/v1/object/public/pet-images/mock/timelinebird2.jpeg',
    items: [],
  },
  {
    id: 'dummy-7',
    ownerName: 'エイコ',
    ownerType: 'self' as PartnerType,
    petName: 'しらす',
    petAvatar: null,
    date: '2026-04-04',
    mood: 'normal',
    memo: '少し鼻水が出てたので様子見。',
    imageUrl: null,
    items: ['体温 38.2℃'],
  },
  {
    id: 'dummy-8',
    ownerName: '山田さん',
    ownerType: 'partner' as PartnerType,
    petName: 'まめ',
    petAvatar: null,
    date: '2026-04-04',
    mood: 'good',
    memo: 'ドッグランデビュー！他のわんちゃんとも仲良くできた。',
    imageUrl: null,
    items: [],
  },
  {
    id: 'dummy-9',
    ownerName: 'エイコ',
    ownerType: 'self' as PartnerType,
    petName: 'おこめ',
    petAvatar: null,
    date: '2026-04-03',
    mood: 'good',
    memo: 'お気に入りのおもちゃで遊んでいた。',
    imageUrl: null,
    items: [],
  },
  {
    id: 'dummy-10',
    ownerName: '鈴木さん',
    ownerType: 'friend' as PartnerType,
    petName: 'ぴより',
    petAvatar: null,
    date: '2026-04-03',
    mood: 'normal',
    memo: '換羽期かも。羽根がよく落ちてる。',
    imageUrl: null,
    items: [],
  },
]

const PAGE_SIZE = 5

const moodLabel = (mood: string | null) => {
  if (mood === 'good') return '良い'
  if (mood === 'normal') return '普通'
  if (mood === 'bad') return '悪い'
  return ''
}

const moodColor = (mood: string | null) => {
  if (mood === 'good') return 'text-green-500'
  if (mood === 'normal') return 'text-yellow-500'
  if (mood === 'bad') return 'text-red-400'
  return 'text-gray-400'
}

const MoodIcon = ({ mood }: { mood: string | null }) => {
  const color = mood === 'good' ? '#4ade80' : mood === 'normal' ? '#facc15' : mood === 'bad' ? '#f87171' : '#d1d5db'
  if (mood === 'good') return (
    <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} className="w-4 h-4">
      <circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/>
      <line x1="9" y1="9" x2="9.01" y2="9" strokeWidth={3} strokeLinecap="round"/>
      <line x1="15" y1="9" x2="15.01" y2="9" strokeWidth={3} strokeLinecap="round"/>
    </svg>
  )
  if (mood === 'normal') return (
    <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} className="w-4 h-4">
      <circle cx="12" cy="12" r="10"/><line x1="8" y1="15" x2="16" y2="15"/>
      <line x1="9" y1="9" x2="9.01" y2="9" strokeWidth={3} strokeLinecap="round"/>
      <line x1="15" y1="9" x2="15.01" y2="9" strokeWidth={3} strokeLinecap="round"/>
    </svg>
  )
  if (mood === 'bad') return (
    <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} className="w-4 h-4">
      <circle cx="12" cy="12" r="10"/><path d="M16 16s-1.5-2-4-2-4 2-4 2"/>
      <line x1="9" y1="9" x2="9.01" y2="9" strokeWidth={3} strokeLinecap="round"/>
      <line x1="15" y1="9" x2="15.01" y2="9" strokeWidth={3} strokeLinecap="round"/>
    </svg>
  )
  return null
}

// パートナータイプのバッジ
const PartnerBadge = ({ type }: { type: PartnerType }) => {
  if (type === 'partner') return (
    <span className="flex items-center gap-0.5 text-xs bg-blue-50 text-blue-400 px-1.5 py-0.5 rounded-full">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3 h-3">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
      代理人
    </span>
  )
  if (type === 'friend') return (
    <span className="flex items-center gap-0.5 text-xs bg-pink-50 text-pink-400 px-1.5 py-0.5 rounded-full">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3 h-3">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
      友達
    </span>
  )
  return null
}

// タイムラインカード（ダミー用）
const DummyTimelineCard = ({ record }: { record: typeof DUMMY_RECORDS[0] }) => {
  const [expanded, setExpanded] = useState(false)
  const MEMO_LIMIT = 60
  const isLong = (record.memo ?? '').length > MEMO_LIMIT

  const d = new Date(record.date + 'T00:00:00')
  const dateLabel = `${d.getMonth() + 1}月${d.getDate()}日（${WEEKDAYS[d.getDay()]}）`

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      {record.imageUrl && (
        <div className="relative w-full aspect-square">
          <Image
            src={record.imageUrl}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 512px"
          />
        </div>
      )}
      <div className="p-4">
        {/* ヘッダー */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-pink-50 shrink-0 flex items-center justify-center text-sm">
            {record.ownerType === 'self' ? '🐱' : record.ownerType === 'partner' ? '🐕' : '🐦'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-bold text-gray-700 text-sm">{record.ownerName}</span>
              <span className="text-xs text-gray-400">の</span>
              <span className="font-bold text-gray-700 text-sm">{record.petName}</span>
              <PartnerBadge type={record.ownerType} />
            </div>
            <span className="text-xs text-gray-400">{dateLabel}</span>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <MoodIcon mood={record.mood} />
            <span className={`text-xs font-medium ${moodColor(record.mood)}`}>
              {moodLabel(record.mood)}
            </span>
          </div>
        </div>

        {/* 記録項目 */}
        {record.items.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {record.items.map((item, i) => (
              <span key={i} className="text-xs bg-pink-50 text-[#FFB7C5] px-2 py-0.5 rounded-full">
                {item}
              </span>
            ))}
          </div>
        )}

        {/* メモ */}
        {record.memo && (
          <div>
            <p className="text-sm text-gray-600 leading-relaxed">
              {expanded || !isLong ? record.memo : record.memo.slice(0, MEMO_LIMIT) + '…'}
            </p>
            {isLong && (
              <button onClick={() => setExpanded(v => !v)} className="text-xs text-[#FFB7C5] mt-1">
                {expanded ? '閉じる' : '続きを見る'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// 実際のDBカード（自分のデータ用）
const TimelineCard = ({
  record, pet, weightUnit, freeLabels, onClick
}: {
  record: PetRecord
  pet: Pet | undefined
  weightUnit: string
  freeLabels: { free1: string; free2: string; free3: string }
  onClick: () => void
}) => {
  const [expanded, setExpanded] = useState(false)
  const photoUrl = record.image_url
  const avatarUrl = pet?.image_url ?? null
  const MEMO_LIMIT = 60
  const isLong = (record.memo ?? '').length > MEMO_LIMIT

  const d = new Date(record.date + 'T00:00:00')
  const dateLabel = `${d.getMonth() + 1}月${d.getDate()}日（${WEEKDAYS[d.getDay()]}）`

  const items: string[] = []
  if (record.weight) items.push(`体重 ${record.weight}${weightUnit}`)
  if (record.temperature) items.push(`体温 ${record.temperature}℃`)
  if (record.no_appetite) items.push('食欲なし')
  if (record.abnormal_excretion) items.push('排泄異常')
  if (record.vomit) items.push('嘔吐')
  if (record.nail_trimming) items.push('爪切り')
  if (record.free_item1_value && freeLabels.free1) items.push(freeLabels.free1)
  if (record.free_item2_value && freeLabels.free2) items.push(freeLabels.free2)
  if (record.free_item3_value && freeLabels.free3) items.push(freeLabels.free3)

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      {photoUrl && (
        <button onClick={onClick} className="block w-full">
          <div className="relative w-full aspect-square">
            <Image src={photoUrl} alt="" fill className="object-cover" sizes="(max-width: 768px) 100vw, 512px" />
          </div>
        </button>
      )}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-pink-50 shrink-0">
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-sm">🐱</div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs text-gray-400">エイコの</span>
              <span className="font-bold text-gray-700 text-sm">{pet?.name ?? '不明'}</span>
            </div>
            <span className="text-xs text-gray-400">{dateLabel}</span>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <MoodIcon mood={record.mood} />
            <span className={`text-xs font-medium ${moodColor(record.mood)}`}>
              {moodLabel(record.mood)}
            </span>
          </div>
        </div>
        {items.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {items.map((item, i) => (
              <span key={i} className="text-xs bg-pink-50 text-[#FFB7C5] px-2 py-0.5 rounded-full">{item}</span>
            ))}
          </div>
        )}
        {record.memo && (
          <div>
            <p className="text-sm text-gray-600 leading-relaxed">
              {expanded || !isLong ? record.memo : record.memo.slice(0, MEMO_LIMIT) + '…'}
            </p>
            {isLong && (
              <button onClick={() => setExpanded(v => !v)} className="text-xs text-[#FFB7C5] mt-1">
                {expanded ? '閉じる' : '続きを見る'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function TimelinePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('timeline')
  const [pets, setPets] = useState<Pet[]>([])
  const [records, setRecords] = useState<PetRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [weightUnit, setWeightUnit] = useState('kg')
  const [freeLabels, setFreeLabels] = useState({ free1: '', free2: '', free3: '' })
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  // カレンダー用
  const [year, setYear] = useState(new Date().getFullYear())
  const [month, setMonth] = useState(new Date().getMonth())
  const [calRecords, setCalRecords] = useState<PetRecord[]>([])
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0])

  // ギャラリー用
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null)
  const [groups, setGroups] = useState<{ yearMonth: string; label: string; photos: PetRecord[] }[]>([])
  const [flatPhotos, setFlatPhotos] = useState<PetRecord[]>([])
  const [popupRecord, setPopupRecord] = useState<PetRecord | null>(null)

  const toDateStr = (y: number, m: number, d: number) =>
    `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`

  useEffect(() => {
    if (!user) return
    supabase.from('my_pets').select('*').order('created_at').then(({ data }) => setPets(data ?? []))
    supabase
      .from('pet_records')
      .select('*')
      .order('date', { ascending: false })
      .then(({ data }) => {
        setRecords(data ?? [])
        setLoading(false)
      })
    supabase
      .from('moshimo_info')
      .select('weight_unit, free_item1_label, free_item2_label, free_item3_label')
      .eq('user_id', user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setWeightUnit(data.weight_unit ?? 'kg')
          setFreeLabels({
            free1: data.free_item1_label ?? '',
            free2: data.free_item2_label ?? '',
            free3: data.free_item3_label ?? '',
          })
        }
      })
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
      .then(({ data }) => setCalRecords(data ?? []))
  }, [user, year, month])

  useEffect(() => {
    const photoRecords = records.filter(r => r.image_url)
    let filtered = photoRecords
    if (selectedPetId) {
      filtered = photoRecords.filter(r =>
        r.pet_id === selectedPetId ||
        (r.extra_pet_ids && r.extra_pet_ids.includes(selectedPetId))
      )
    }
    setFlatPhotos(filtered)
    const map: Record<string, PetRecord[]> = {}
    filtered.forEach(r => {
      const ym = r.date.slice(0, 7)
      if (!map[ym]) map[ym] = []
      map[ym].push(r)
    })
    setGroups(
      Object.entries(map).map(([ym, photos]) => {
        const [y, m] = ym.split('-')
        return { yearMonth: ym, label: `${y}年 ${parseInt(m)}月`, photos }
      })
    )
  }, [records, selectedPetId])

  const getPet = (petId: string) => pets.find(p => p.id === petId)

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00')
    return `${d.getMonth() + 1}月${d.getDate()}日（${WEEKDAYS[d.getDay()]}）`
  }

  // カレンダー用
  const datesWithRecords = new Set(calRecords.map(r => r.date))
  const birthdayMap: Record<string, string[]> = {}
  pets.forEach(pet => {
    if (pet.birth_month === (month + 1) && pet.birth_day) {
      const dateStr = toDateStr(year, month, pet.birth_day)
      if (!birthdayMap[dateStr]) birthdayMap[dateStr] = []
      birthdayMap[dateStr].push(pet.name)
    }
  })
  const selectedRecords = calRecords.filter(r => r.date === selectedDate)
  const selectedBirthdays = birthdayMap[selectedDate] ?? []
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

  const currentIndex = popupRecord ? flatPhotos.findIndex(r => r.id === popupRecord.id) : -1
  const prevPhoto = currentIndex > 0 ? flatPhotos[currentIndex - 1] : null
  const nextPhoto = currentIndex < flatPhotos.length - 1 ? flatPhotos[currentIndex + 1] : null

  const visibleDummy = DUMMY_RECORDS.slice(0, visibleCount)
  const hasMore = visibleCount < DUMMY_RECORDS.length

  return (
    <div className="min-h-screen bg-[#FFFBFC] pb-24">
      <header className="bg-[#FFB7C5] text-white text-center py-4 text-lg font-bold">
        タイムライン
      </header>

      {/* タブ */}
      <div className="flex bg-white border-b border-gray-100 sticky top-0 z-10">
        {([
          { key: 'timeline', label: 'タイムライン' },
          { key: 'calendar', label: 'カレンダー' },
          { key: 'gallery', label: 'ギャラリー' },
        ] as { key: Tab; label: string }[]).map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
              tab === t.key ? 'border-[#FFB7C5] text-[#FFB7C5]' : 'border-transparent text-gray-400'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ─── タイムライン ─── */}
      {tab === 'timeline' && (
        <div className="px-4 py-4 space-y-4">
          {visibleDummy.map(record => (
            <DummyTimelineCard key={record.id} record={record} />
          ))}
          {hasMore && (
            <button
              onClick={() => setVisibleCount(v => v + PAGE_SIZE)}
              className="w-full py-3 text-sm text-[#FFB7C5] border border-pink-200 rounded-2xl font-medium"
            >
              もっと見る
            </button>
          )}
        </div>
      )}

      {/* ─── カレンダー ─── */}
      {tab === 'calendar' && (
        <div>
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
                const hasBirthday = !!birthdayMap[dateStr]
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
                    <div className="flex gap-0.5 mt-0.5 h-2 items-center">
                      {hasRecord && <div className="w-1.5 h-1.5 rounded-full bg-[#FFB7C5]" />}
                      {hasBirthday && <span className="text-xs leading-none">🐾</span>}
                      {!hasRecord && !hasBirthday && <div className="w-1.5 h-1.5" />}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="mx-4 mt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-700">{formatDate(selectedDate)}の記録</h3>
              {selectedRecords.length > 0 && (
                <span className="text-xs text-gray-400">{selectedRecords.length}件</span>
              )}
            </div>
            {selectedBirthdays.length > 0 && (
              <div className="bg-pink-50 border border-pink-100 rounded-2xl px-4 py-3 mb-3 flex items-center gap-2">
                <span className="text-xl">🐾</span>
                <p className="text-sm text-[#FFB7C5] font-bold">
                  {selectedBirthdays.join('と')}のお誕生日！
                </p>
              </div>
            )}
            {selectedRecords.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-gray-400 mb-3">この日の記録はありません</p>
                <button
                  onClick={() => router.push(`/record?date=${selectedDate}`)}
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
                              <span className={`text-xs ${moodColor(record.mood)}`}>{moodLabel(record.mood)}</span>
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
                    onClick={() => router.push(`/record?date=${selectedDate}`)}
                    className="w-full border-2 border-dashed border-pink-200 rounded-2xl py-3 text-sm text-[#FFB7C5] font-medium flex items-center justify-center gap-2"
                  >
                    <span className="text-lg">+</span> 他の子の記録を追加
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── ギャラリー ─── */}
      {tab === 'gallery' && (
        <div>
          {pets.length > 1 && (
            <div className="flex gap-2 px-4 py-3 overflow-x-auto">
              <button
                onClick={() => setSelectedPetId(null)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-all whitespace-nowrap ${
                  selectedPetId === null ? 'bg-[#FFB7C5] border-[#FFB7C5] text-white' : 'bg-white border-gray-200 text-gray-500'
                }`}
              >すべて</button>
              {pets.map(pet => (
                <button
                  key={pet.id}
                  onClick={() => setSelectedPetId(pet.id)}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium border transition-all whitespace-nowrap ${
                    selectedPetId === pet.id ? 'bg-[#FFB7C5] border-[#FFB7C5] text-white' : 'bg-white border-gray-200 text-gray-500'
                  }`}
                >
                  {pet.image_url && (
                    <div className="relative w-5 h-5 rounded-full overflow-hidden">
                      <Image src={pet.image_url} alt={pet.name} fill className="object-cover" />
                    </div>
                  )}
                  {pet.name}
                </button>
              ))}
            </div>
          )}
          {loading ? (
            <div className="flex justify-center mt-10">
              <div className="w-8 h-8 border-2 border-[#FFB7C5] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : groups.length === 0 ? (
            <div className="flex flex-col items-center justify-center mt-20 gap-4 text-gray-400">
              <p className="text-sm text-center">写真はまだありません。<br/>毎日の記録から写真を登録しましょう。</p>
              <button
                onClick={() => router.push('/record')}
                className="bg-[#FFB7C5] text-white px-5 py-3 rounded-2xl text-sm font-bold"
              >
                写真を撮る
              </button>
            </div>
          ) : (
            <div className="px-4 py-4 space-y-6">
              {groups.map(group => (
                <div key={group.yearMonth}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-[#FFB7C5]">{group.label}</h3>
                    <span className="text-xs text-gray-400">{group.photos.length}枚</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    {group.photos.map(photo => (
                      <button
                        key={photo.id}
                        onClick={() => setPopupRecord(photo)}
                        className="aspect-square rounded-lg overflow-hidden bg-gray-100 relative"
                      >
                        <Image
                          src={photo.image_url!}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 33vw, 200px"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ギャラリーポップアップ */}
      {popupRecord && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-end justify-center" onClick={() => setPopupRecord(null)}>
          <div className="bg-white rounded-t-3xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
            <div className="relative mx-4 mt-4 h-56">
              <Image
                src={popupRecord.image_url!}
                alt=""
                fill
                className="object-contain rounded-2xl bg-gray-50"
                sizes="(max-width: 768px) 100vw, 512px"
              />
              <button
                onClick={() => setPopupRecord(null)}
                className="absolute top-2 right-2 bg-black/40 rounded-full p-1.5 text-white z-10"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            {popupRecord.memo && (
              <p className="text-gray-500 text-xs px-5 pt-3 line-clamp-2">{popupRecord.memo}</p>
            )}
            <div className="flex gap-2 px-4 pt-3 pb-24">
              <button
                onClick={() => prevPhoto && setPopupRecord(prevPhoto)}
                disabled={!prevPhoto}
                className="flex-1 flex items-center justify-center gap-1 py-2.5 bg-gray-100 rounded-xl text-gray-600 text-xs font-medium disabled:opacity-30"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
                前の写真
              </button>
              <button
                onClick={() => router.push(`/calendar/${popupRecord.id}`)}
                className="flex-1 flex items-center justify-center gap-1 py-2.5 bg-[#FFB7C5] rounded-xl text-white text-xs font-medium"
              >
                この日の日記
              </button>
              <button
                onClick={() => nextPhoto && setPopupRecord(nextPhoto)}
                disabled={!nextPhoto}
                className="flex-1 flex items-center justify-center gap-1 py-2.5 bg-gray-100 rounded-xl text-gray-600 text-xs font-medium disabled:opacity-30"
              >
                次の写真
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FAB */}
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