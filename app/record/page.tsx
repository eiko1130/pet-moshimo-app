'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/AuthProvider'
import BottomNav from '@/components/BottomNav'
import type { Pet } from '@/types'

const MOODS = [
  { value: 'good', label: '良い', icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7">
      <circle cx="12" cy="12" r="10"/>
      <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
      <line x1="9" y1="9" x2="9.01" y2="9" strokeWidth={3} strokeLinecap="round"/>
      <line x1="15" y1="9" x2="15.01" y2="9" strokeWidth={3} strokeLinecap="round"/>
    </svg>
  )},
  { value: 'normal', label: 'ふつう', icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7">
      <circle cx="12" cy="12" r="10"/>
      <line x1="8" y1="15" x2="16" y2="15"/>
      <line x1="9" y1="9" x2="9.01" y2="9" strokeWidth={3} strokeLinecap="round"/>
      <line x1="15" y1="9" x2="15.01" y2="9" strokeWidth={3} strokeLinecap="round"/>
    </svg>
  )},
  { value: 'bad', label: '悪い', icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7">
      <circle cx="12" cy="12" r="10"/>
      <path d="M16 16s-1.5-2-4-2-4 2-4 2"/>
      <line x1="9" y1="9" x2="9.01" y2="9" strokeWidth={3} strokeLinecap="round"/>
      <line x1="15" y1="9" x2="15.01" y2="9" strokeWidth={3} strokeLinecap="round"/>
    </svg>
  )},
]

const toLocalDateString = () => {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export default function RecordPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [pets, setPets] = useState<Pet[]>([])
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null)
  const [date, setDate] = useState(toLocalDateString())
  const [mood, setMood] = useState<'good' | 'normal' | 'bad' | null>(null)
  const [content, setContent] = useState('')
  const [memo, setMemo] = useState('')
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!user) return
    supabase.from('my_pets').select('*').order('created_at').then(({ data }) => {
      setPets(data ?? [])
      if (data && data.length > 0) setSelectedPet(data[0])
    })
  }, [user])

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async () => {
    if (!user || !selectedPet || !mood) {
      setMessage('ごきげんを選んでください')
      return
    }
    setLoading(true)
    try {
      let image_url = null
      if (photoFile) {
        const ext = photoFile.name.split('.').pop()
        const path = `${user.id}/${Date.now()}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('pet-photos')
          .upload(path, photoFile)
        if (!uploadError) {
          const { data } = supabase.storage.from('pet-photos').getPublicUrl(path)
          image_url = data.publicUrl
        }
      }

      const { error } = await supabase.from('pet_records').insert({
        user_id: user.id,
        pet_id: selectedPet.id,
        type: 'daily',
        mood,
        content: content || null,
        image_url,
        date,
      })
      if (error) throw error
      setMessage('記録しました！')
      setMood(null)
      setContent('')
      setMemo('')
      setPhotoFile(null)
      setPhotoPreview(null)
      setTimeout(() => router.push('/'), 1000)
    } catch (e: any) {
      setMessage(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FFFBFC] pb-24">
      <header className="bg-[#FFB7C5] text-white text-center py-4 text-lg font-bold">
        今日の見守り記録
      </header>

      {selectedPet && (
        <div className="mx-5 mt-4 bg-pink-50 rounded-xl px-4 py-3 text-sm text-[#FFB7C5] font-medium">
          {selectedPet.name} の健康記録を教えてください。
        </div>
      )}

      {/* ペット選択 */}
      {pets.length > 1 && (
        <div className="flex gap-3 px-5 mt-3 overflow-x-auto">
          {pets.map(pet => (
            <button
              key={pet.id}
              onClick={() => setSelectedPet(pet)}
              className="flex flex-col items-center gap-1 shrink-0"
            >
              <div className={`w-14 h-14 rounded-full overflow-hidden border-4 transition-all ${
                selectedPet?.id === pet.id ? 'border-[#FFB7C5]' : 'border-gray-100'
              }`}>
                {pet.photo_url ? (
                  <img src={pet.photo_url} alt={pet.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-pink-50 flex items-center justify-center text-xl">🐱</div>
                )}
              </div>
              <span className={`text-xs font-medium ${selectedPet?.id === pet.id ? 'text-[#FFB7C5]' : 'text-gray-400'}`}>
                {pet.name}
              </span>
            </button>
          ))}
        </div>
      )}

      <div className="px-5 py-4 space-y-4">
        {/* 日付 */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <label className="text-sm font-bold text-gray-600 block mb-2">記録する日</label>
          <div className="flex items-center gap-2 text-gray-600">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 text-gray-400">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="text-sm bg-transparent focus:outline-none"
            />
          </div>
        </div>

        {/* ごきげん */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-bold text-gray-600">今日のごきげん</label>
            <span className="text-xs bg-pink-100 text-pink-400 px-2 py-0.5 rounded-full">必須</span>
          </div>
          <div className="flex gap-3">
            {MOODS.map(m => (
              <button
                key={m.value}
                onClick={() => setMood(m.value as any)}
                className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-xl border-2 transition-all ${
                  mood === m.value
                    ? 'bg-[#FFB7C5] border-[#FFB7C5] text-white'
                    : 'bg-white border-gray-100 text-gray-400'
                }`}
              >
                {m.icon}
                <span className="text-xs font-medium">{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ペットの様子 */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <label className="text-sm font-bold text-gray-600 block mb-2">ペットの様子</label>
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="例：食欲旺盛、よく寝ている"
            className="w-full text-sm bg-gray-50 rounded-xl px-3 py-3 focus:outline-none focus:ring-1 focus:ring-pink-200"
          />
        </div>

        {/* メモ */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <label className="text-sm font-bold text-gray-600 block mb-2">メモ</label>
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="気づいたことや気になること"
            rows={3}
            className="w-full text-sm bg-gray-50 rounded-xl px-3 py-3 focus:outline-none focus:ring-1 focus:ring-pink-200 resize-none"
          />
        </div>

        {/* 写真（一番下） */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <label className="text-sm font-bold text-gray-600 block mb-2">今日の写真</label>
          <label className="cursor-pointer block">
            {photoPreview ? (
              <img src={photoPreview} alt="preview" className="w-full h-40 object-cover rounded-xl" />
            ) : (
              <div className="border-2 border-dashed border-gray-200 rounded-xl h-28 flex flex-col items-center justify-center text-gray-400 text-sm gap-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-8 h-8">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
                画像を選択...
              </div>
            )}
            <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
          </label>
        </div>

        {message && (
          <p className={`text-xs text-center ${message.includes('記録しました') ? 'text-green-500' : 'text-pink-400'}`}>
            {message}
          </p>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-[#FFB7C5] text-white font-bold py-4 rounded-2xl text-base disabled:opacity-50"
        >
          {loading ? '送信中...' : '提出する'}
        </button>
      </div>

      <BottomNav />
    </div>
  )
}