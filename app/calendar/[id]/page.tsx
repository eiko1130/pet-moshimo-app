'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/AuthProvider'
import type { Pet, PetRecord } from '@/types'

const MOODS = [
  { value: 'good', label: '良い', icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7">
      <circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/>
      <line x1="9" y1="9" x2="9.01" y2="9" strokeWidth={3} strokeLinecap="round"/>
      <line x1="15" y1="9" x2="15.01" y2="9" strokeWidth={3} strokeLinecap="round"/>
    </svg>
  )},
  { value: 'normal', label: 'ふつう', icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7">
      <circle cx="12" cy="12" r="10"/><line x1="8" y1="15" x2="16" y2="15"/>
      <line x1="9" y1="9" x2="9.01" y2="9" strokeWidth={3} strokeLinecap="round"/>
      <line x1="15" y1="9" x2="15.01" y2="9" strokeWidth={3} strokeLinecap="round"/>
    </svg>
  )},
  { value: 'bad', label: '悪い', icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7">
      <circle cx="12" cy="12" r="10"/><path d="M16 16s-1.5-2-4-2-4 2-4 2"/>
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
  const [sameDayRecords, setSameDayRecords] = useState<PetRecord[]>([])
  const [prevRecord, setPrevRecord] = useState<PetRecord | null>(null)
  const [nextRecord, setNextRecord] = useState<PetRecord | null>(null)
  const [editing, setEditing] = useState(false)
  const [mood, setMood] = useState<'good' | 'normal' | 'bad' | null>(null)
  const [memo, setMemo] = useState('')
  const [extraPetIds, setExtraPetIds] = useState<string[]>([])
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  // 項目設定
  const [weightUnit, setWeightUnit] = useState('kg')
  const [freeLabels, setFreeLabels] = useState({ free1: '', free2: '', free3: '' })

  useEffect(() => {
    if (!user || !id) return
    supabase.from('my_pets').select('*').then(({ data }) => setPets(data ?? []))
    supabase.from('pet_records').select('*').eq('id', id).single().then(({ data }) => {
      if (!data) return
      setRecord(data)
      setMood(data.mood)
      setMemo(data.memo ?? '')
      setExtraPetIds(data.extra_pet_ids ?? [])
      setPhotoPreview(data.image_url ?? null)
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
  }, [user, id])

  useEffect(() => {
    if (!record || pets.length === 0) return
    const currentPet = pets.find(p => p.id === record.pet_id)
    setPet(currentPet ?? null)

    supabase
      .from('pet_records')
      .select('*')
      .eq('date', record.date)
      .neq('id', record.id)
      .then(({ data }) => setSameDayRecords(data ?? []))

    supabase
      .from('pet_records')
      .select('*')
      .eq('pet_id', record.pet_id)
      .lt('date', record.date)
      .order('date', { ascending: false })
      .limit(1)
      .then(({ data }) => setPrevRecord(data?.[0] ?? null))

    supabase
      .from('pet_records')
      .select('*')
      .eq('pet_id', record.pet_id)
      .gt('date', record.date)
      .order('date', { ascending: true })
      .limit(1)
      .then(({ data }) => setNextRecord(data?.[0] ?? null))
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
          .from('pet-images').upload(path, photoFile)
        if (!uploadError) {
          const { data } = supabase.storage.from('pet-images').getPublicUrl(path)
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

  // 記録項目の表示用データを組み立てる
  const buildRecordItems = () => {
    if (!record) return []
    const items: { label: string; value: string; note?: string }[] = []

    if (record.weight != null)
      items.push({ label: '体重', value: `${record.weight} ${weightUnit}` })
    if (record.temperature != null)
      items.push({ label: '体温', value: `${record.temperature} ℃` })
    if (record.no_appetite)
      items.push({ label: '食欲がない', value: 'あり', note: record.no_appetite_note ?? undefined })
    if (record.abnormal_excretion)
      items.push({ label: '排泄の異常', value: 'あり', note: record.abnormal_excretion_note ?? undefined })
    if (record.vomit)
      items.push({ label: '嘔吐', value: 'あり', note: record.vomit_note ?? undefined })
    if (record.nail_trimming)
      items.push({ label: '爪切り', value: 'あり', note: record.nail_trimming_note ?? undefined })
    if (record.free_item1_value && freeLabels.free1)
      items.push({ label: freeLabels.free1, value: 'あり', note: record.free_item1_note ?? undefined })
    if (record.free_item2_value && freeLabels.free2)
      items.push({ label: freeLabels.free2, value: 'あり', note: record.free_item2_note ?? undefined })
    if (record.free_item3_value && freeLabels.free3)
      items.push({ label: freeLabels.free3, value: 'あり', note: record.free_item3_note ?? undefined })

    return items
  }

  const recordItems = buildRecordItems()
  const otherPets = pets.filter(p => p.id !== record?.pet_id)
  const moodInfo = MOODS.find(m => m.value === (editing ? mood : record?.mood))

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
    <div className="min-h-screen bg-[#FFFBFC] pb-32">
      {/* ヘッダー */}
      <header className="bg-[#FFB7C5] text-white flex items-center justify-between px-4 py-4">
        <button onClick={() => router.back()}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-6 h-6">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <span className="font-bold text-sm">{formatDate(record.date)}</span>
        {!editing ? (
          <button onClick={() => setEditing(true)} className="text-sm bg-white text-[#FFB7C5] px-3 py-1 rounded-full font-bold">
            編集
          </button>
        ) : (
          <button onClick={() => { setEditing(false); setPhotoPreview(record.image_url ?? null) }} className="text-sm text-white opacity-70">
            キャンセル
          </button>
        )}
      </header>

      <div className="px-5 py-5 space-y-4">
        {/* 写真 */}
        <div className="rounded-2xl overflow-hidden bg-gray-100">
          {editing ? (
            <label className="cursor-pointer block">
              {photoPreview ? (
                <img src={photoPreview} alt="" className="w-full h-56 object-cover" />
              ) : (
                <div className="h-56 flex flex-col items-center justify-center text-gray-400 gap-2">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-10 h-10">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                    <circle cx="12" cy="13" r="4"/>
                  </svg>
                  <span className="text-sm">タップして写真を追加</span>
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
              ? <img src={record.image_url} alt="" className="w-full max-h-96 object-contain bg-gray-50" />
              : (
                <div className="h-32 flex items-center justify-center">
                  {pet?.image_url
                    ? <img src={pet.image_url} alt="" className="w-24 h-24 rounded-full object-cover" />
                    : <div className="text-6xl">🐱</div>
                  }
                </div>
              )
          )}
        </div>

        {/* ペット情報 */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-pink-50 border-2 border-pink-100 shrink-0">
            {pet?.image_url
              ? <img src={pet.image_url} alt="" className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center text-lg">🐱</div>
            }
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

        {/* 記録項目（値があるものだけ表示） */}
        {recordItems.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <label className="text-sm font-bold text-gray-600 block mb-3">記録項目</label>
            <div className="divide-y divide-gray-50">
              {recordItems.map((item, i) => (
                <div key={i} className="py-2.5 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">{item.label}</span>
                    <span className="text-sm font-medium text-gray-700">{item.value}</span>
                  </div>
                  {item.note && (
                    <p className="text-xs text-gray-400 mt-1">{item.note}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

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

        {/* 一緒に写っている子 */}
        {otherPets.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <label className="text-sm font-bold text-gray-600 block mb-2">
              <span className="flex items-center gap-1">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
                一緒に写っている子
              </span>
            </label>
            <div className="flex gap-2 flex-wrap">
              {otherPets.map(p => {
                const isSelected = (editing ? extraPetIds : record.extra_pet_ids ?? []).includes(p.id)
                const isDisabled = !editing && !isSelected
                if (isDisabled) return null
                return (
                  <button
                    key={p.id}
                    onClick={() => editing && toggleExtraPet(p.id)}
                    disabled={!editing && !isSelected}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-[#FFB7C5] border-[#FFB7C5] text-white'
                        : editing
                          ? 'bg-white border-gray-200 text-gray-500'
                          : 'bg-gray-100 border-gray-200 text-gray-400'
                    } ${!editing && !record.image_url ? 'opacity-40 cursor-default' : ''}`}
                  >
                    {p.image_url
                      ? <img src={p.image_url} alt={p.name} className="w-5 h-5 rounded-full object-cover" />
                      : '🐱'}
                    {p.name}
                  </button>
                )
              })}
              {editing && !photoPreview && (
                <p className="text-xs text-gray-400 w-full mt-1">※ 写真を登録すると選択できます</p>
              )}
            </div>
          </div>
        )}

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

        {/* 同じ日の他の子 */}
        {sameDayRecords.length > 0 && (
          <div className="bg-pink-50 rounded-2xl p-4">
            <p className="text-xs text-gray-500 mb-2">この日の他の子の記録</p>
            <div className="flex gap-2">
              {sameDayRecords.map(r => {
                const p = pets.find(pt => pt.id === r.pet_id)
                return (
                  <button
                    key={r.id}
                    onClick={() => router.push(`/calendar/${r.id}`)}
                    className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 border border-pink-100"
                  >
                    <div className="w-7 h-7 rounded-full overflow-hidden bg-pink-100">
                      {p?.image_url
                        ? <img src={p.image_url} alt="" className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-sm">🐱</div>
                      }
                    </div>
                    <span className="text-xs font-medium text-gray-600">{p?.name}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* 前後の記録ナビ */}
        <div className="flex gap-3">
          <button
            onClick={() => prevRecord && router.push(`/calendar/${prevRecord.id}`)}
            disabled={!prevRecord}
            className="flex-1 flex items-center justify-center gap-1 py-3 bg-white border border-gray-100 rounded-2xl text-xs text-gray-500 disabled:opacity-30"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            {pet?.name}の前の記録
          </button>
          <button
            onClick={() => nextRecord && router.push(`/calendar/${nextRecord.id}`)}
            disabled={!nextRecord}
            className="flex-1 flex items-center justify-center gap-1 py-3 bg-white border border-gray-100 rounded-2xl text-xs text-gray-500 disabled:opacity-30"
          >
            {pet?.name}の次の記録
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}