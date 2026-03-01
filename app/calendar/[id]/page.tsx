'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/AuthProvider'
import type { Pet, PetRecord } from '@/types'

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

export default function RecordDetailPage() {
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [record, setRecord] = useState<PetRecord | null>(null)
  const [pet, setPet] = useState<Pet | null>(null)
  const [pets, setPets] = useState<Pet[]>([])
  const [editing, setEditing] = useState(false)
  const [mood, setMood] = useState<'good' | 'normal' | 'bad' | null>(null)
  const [memo, setMemo] = useState('')
  const [extraPetIds, setExtraPetIds] = useState<string[]>([])
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!user || !id) return
    supabase.from('my_pets').select('*').then(({ data }) => setPets(data ?? []))
    supabase.from('pet_records').select('*').eq('id', id).single().then(({ data }) => {
      if (!data) return
      setRecord(data)
      setMood(data.mood)
      setMemo(data.memo ?? '')
      setExtraPetIds(data.extra_pet_ids ?? [])
      setPhotoPreview(data.image_url)
    })
  }, [user, id])

  useEffect(() => {
    if (!record || pets.length === 0) return
    setPet(pets.find(p => p.id === record.pet_id) ?? null)
  }, [record, pets])

  const toggleExtraPet = (petId: string) => {
    setExtraPetIds(prev =>
      prev.includes(petId) ? prev.filter(p => p !== petId) : [...prev, petId]
    )
  }

  const handleSave = async () => {
    if (!record || !mood) return
    setSaving(true)
    try {
      let image_url = record.image_url
      if (photoFile) {
        const ext = photoFile.name.split('.').pop()
        const path = `${user!.id}/${Date.now()}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('pet-photos').upload(path, photoFile)
        if (!uploadError) {
          const { data } = supabase.storage.from('pet-photos').getPublicUrl(path)
          image_url = data.publicUrl
        }
      }
      const { error } = await supabase.from('pet_records').update({
        mood,
        memo: memo || null,
        image_url,
        extra_pet_ids: extraPetIds.length > 0 ? extraPetIds : null,
      }).eq('id', id)
      if (error) throw error
      setRecord(r => r ? { ...r, mood, memo, image_url, extra_pet_ids: extraPetIds } : r)
      setEditing(false)
      setMessage('保存しました！')
      setTimeout(() => setMessage(''), 2000)
    } catch (e: any) {
      setMessage(e.message)
    } finally {
      setSaving(false)
    }
  }

  const moodInfo = MOODS.find(m => m.value === (editing ? mood : record?.mood))
  const otherPets = pets.filter(p => p.id !== record?.pet_id)

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00')
    const wd = ['日','月','火','水','木','金','土'][d.getDay()]
    return `${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日（${wd}）`
  }

  if (!record) return (
    <div className="min-h-screen bg-[#FFFBFC] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#FFB7C5] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-[#FFFBFC] pb-24">
      <header className="bg-[#FFB7C5] text-white flex items-center justify-between px-4 py-4">
        <button onClick={() => router.back()}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-6 h-6">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <span className="font-bold">{formatDate(record.date)}</span>
        {!editing ? (
          <button onClick={() => setEditing(true)} className="text-sm bg-white text-[#FFB7C5] px-3 py-1 rounded-full font-bold">
            編集
          </button>
        ) : (
          <button onClick={() => setEditing(false)} className="text-sm text-white opacity-70">
            キャンセル
          </button>
        )}
      </header>

      <div className="px-5 py-5 space-y-4">
        {/* ペット情報 */}
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-full overflow-hidden bg-pink-50 border-2 border-pink-100">
            {pet?.image_url ? (
              <img src={pet.image_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl">🐱</div>
            )}
          </div>
          <div>
            <p className="font-bold text-gray-700">{pet?.name}</p>
            <p className="text-xs text-gray-400">{formatDate(record.date)}</p>
          </div>
        </div>

        {/* ごきげん */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <label className="text-sm font-bold text-gray-600 block mb-3">ごきげん</label>
          {editing ? (
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
          ) : (
            <div className="flex items-center gap-2 text-gray-600">
              {moodInfo?.icon}
              <span className="text-sm font-medium">{moodInfo?.label ?? '-'}</span>
            </div>
          )}
        </div>

        {/* メモ */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <label className="text-sm font-bold text-gray-600 block mb-2">メモ</label>
          {editing ? (
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              rows={4}
              placeholder="今日の様子、気づいたことなど"
              className="w-full text-sm bg-gray-50 rounded-xl px-3 py-3 focus:outline-none focus:ring-1 focus:ring-pink-200 resize-none"
            />
          ) : (
            <p className="text-sm text-gray-600 whitespace-pre-wrap">
              {record.memo || <span className="text-gray-300">メモなし</span>}
            </p>
          )}
        </div>

        {/* 写真 */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <label className="text-sm font-bold text-gray-600 block mb-2">写真</label>
          {editing ? (
            <label className="cursor-pointer block">
              {photoPreview ? (
                <img src={photoPreview} alt="" className="w-full h-48 object-cover rounded-xl" />
              ) : (
                <div className="border-2 border-dashed border-gray-200 rounded-xl h-28 flex flex-col items-center justify-center text-gray-400 text-sm gap-2">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-8 h-8">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                    <circle cx="12" cy="13" r="4"/>
                  </svg>
                  タップして変更
                </div>
              )}
              <input type="file" accept="image/*" className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) { setPhotoFile(f); setPhotoPreview(URL.createObjectURL(f)) }
                }}
              />
            </label>
          ) : (
            record.image_url
              ? <img src={record.image_url} alt="" className="w-full h-48 object-cover rounded-xl" />
              : <p className="text-sm text-gray-300">写真なし</p>
          )}

          {/* 一緒にいる子 */}
          {otherPets.length > 0 && (editing || (record.extra_pet_ids && record.extra_pet_ids.length > 0)) && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-400 mb-2">📷 一緒に写っている子</p>
              <div className="flex gap-2 flex-wrap">
                {otherPets.map(p => (
                  <button
                    key={p.id}
                    onClick={() => editing && toggleExtraPet(p.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                      (editing ? extraPetIds : record.extra_pet_ids ?? []).includes(p.id)
                        ? 'bg-[#FFB7C5] border-[#FFB7C5] text-white'
                        : editing ? 'bg-white border-gray-200 text-gray-500' : 'hidden'
                    }`}
                  >
                    {p.image_url
                      ? <img src={p.image_url} alt={p.name} className="w-5 h-5 rounded-full object-cover" />
                      : '🐱'}
                    {p.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {message && (
          <p className={`text-xs text-center ${message.includes('保存') ? 'text-green-500' : 'text-pink-400'}`}>
            {message}
          </p>
        )}

        {editing && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-[#FFB7C5] text-white font-bold py-4 rounded-2xl text-base disabled:opacity-50"
          >
            {saving ? '保存中...' : '保存する'}
          </button>
        )}
      </div>
    </div>
  )
}