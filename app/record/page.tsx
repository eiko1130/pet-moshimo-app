'use client'
import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/AuthProvider'
import BottomNav from '@/components/BottomNav'
import type { Pet } from '@/types'
import { compressImage } from '@/lib/compressImage'

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

const PetPlaceholderIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="#FFB7C5" strokeWidth={2} className="w-6 h-6">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
)

export default function RecordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FFFBFC]" />}>
      <RecordPageInner />
    </Suspense>
  )
}

function RecordPageInner() {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [pets, setPets] = useState<Pet[]>([])
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null)
  const [extraPetIds, setExtraPetIds] = useState<string[]>([])
  const [date, setDate] = useState(() => searchParams.get('date') || toLocalDateString())
  const [mood, setMood] = useState<'good' | 'normal' | 'bad' | null>(null)
  const [memo, setMemo] = useState('')
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  // 項目設定
  const [recordItems, setRecordItems] = useState<string[]>([])
  const [weightUnit, setWeightUnit] = useState<'kg' | 'g'>('kg')
  const [freeLabels, setFreeLabels] = useState({ free1: '', free2: '', free3: '' })

  // 各項目の入力値
  const [weight, setWeight] = useState('')
  const [temperature, setTemperature] = useState('')
  const [noAppetite, setNoAppetite] = useState(false)
  const [noAppetiteNote, setNoAppetiteNote] = useState('')
  const [abnormalExcretion, setAbnormalExcretion] = useState(false)
  const [abnormalExcretionNote, setAbnormalExcretionNote] = useState('')
  const [vomit, setVomit] = useState(false)
  const [vomitNote, setVomitNote] = useState('')
  const [nailTrimming, setNailTrimming] = useState(false)
  const [nailTrimmingNote, setNailTrimmingNote] = useState('')
  const [free1Value, setFree1Value] = useState(false)
  const [free1Note, setFree1Note] = useState('')
  const [free2Value, setFree2Value] = useState(false)
  const [free2Note, setFree2Note] = useState('')
  const [free3Value, setFree3Value] = useState(false)
  const [free3Note, setFree3Note] = useState('')

  useEffect(() => {
    if (!user) return
    const petId = searchParams.get('petId')

    // ペット取得
    supabase.from('my_pets').select('*').eq('user_id', user.id).order('created_at').then(({ data }) => {
      const list = data ?? []
      setPets(list)
      if (list.length > 0) {
        const target = petId ? list.find(p => p.id === petId) ?? list[0] : list[0]
        setSelectedPet(target)
      }
    })

    // 項目設定取得
    supabase
      .from('moshimo_info')
      .select('record_items, weight_unit, free_item1_label, free_item2_label, free_item3_label')
      .eq('user_id', user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setRecordItems(data.record_items ?? [])
          setWeightUnit(data.weight_unit ?? 'kg')
          setFreeLabels({
            free1: data.free_item1_label ?? '',
            free2: data.free_item2_label ?? '',
            free3: data.free_item3_label ?? '',
          })
        }
      })
  }, [user])

  const toggleExtraPet = (id: string) => {
    setExtraPetIds(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    )
  }

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
    if (date > toLocalDateString()) {
      setMessage('未来の日付には記録できません')
      return
    }
    setLoading(true)
    try {
      let image_url = null
      if (photoFile) {
        const compressed = await compressImage(photoFile)
        const path = `${user.id}/${Date.now()}.jpg`
        const { error: uploadError } = await supabase.storage
          .from('pet-images')
          .upload(path, compressed)
        if (!uploadError) {
          const { data } = supabase.storage.from('pet-images').getPublicUrl(path)
          image_url = data.publicUrl
        }
      }

      const { error } = await supabase.from('pet_records').insert({
        user_id: user.id,
        pet_id: selectedPet.id,
        mood,
        memo: memo || null,
        image_url,
        date,
        extra_pet_ids: extraPetIds.length > 0 ? extraPetIds : null,
        // 項目設定で有効な項目のみ保存
        weight: recordItems.includes('weight') && weight ? parseFloat(weight) : null,
        temperature: recordItems.includes('temperature') && temperature ? parseFloat(temperature) : null,
        no_appetite: recordItems.includes('no_appetite') ? noAppetite : null,
        no_appetite_note: recordItems.includes('no_appetite') && noAppetiteNote ? noAppetiteNote : null,
        abnormal_excretion: recordItems.includes('abnormal_excretion') ? abnormalExcretion : null,
        abnormal_excretion_note: recordItems.includes('abnormal_excretion') && abnormalExcretionNote ? abnormalExcretionNote : null,
        vomit: recordItems.includes('vomit') ? vomit : null,
        vomit_note: recordItems.includes('vomit') && vomitNote ? vomitNote : null,
        nail_trimming: recordItems.includes('nail_trimming') ? nailTrimming : null,
        nail_trimming_note: recordItems.includes('nail_trimming') && nailTrimmingNote ? nailTrimmingNote : null,
        free_item1_value: freeLabels.free1 ? free1Value : null,
        free_item1_note: freeLabels.free1 && free1Note ? free1Note : null,
        free_item2_value: freeLabels.free2 ? free2Value : null,
        free_item2_note: freeLabels.free2 && free2Note ? free2Note : null,
        free_item3_value: freeLabels.free3 ? free3Value : null,
        free_item3_note: freeLabels.free3 && free3Note ? free3Note : null,
      })
      if (error) throw error
      setMessage('記録しました！')
      setMood(null)
      setMemo('')
      setPhotoFile(null)
      setPhotoPreview(null)
      setExtraPetIds([])
      setWeight('')
      setTemperature('')
      setNoAppetite(false)
      setNoAppetiteNote('')
      setAbnormalExcretion(false)
      setAbnormalExcretionNote('')
      setVomit(false)
      setVomitNote('')
      setNailTrimming(false)
      setNailTrimmingNote('')
      setFree1Value(false)
      setFree1Note('')
      setFree2Value(false)
      setFree2Note('')
      setFree3Value(false)
      setFree3Note('')
      setTimeout(() => router.push('/'), 1000)
    } catch (e: any) {
      setMessage(e.message)
    } finally {
      setLoading(false)
    }
  }

  // チェックボックス項目のUI部品
  const CheckItem = ({
    label, checked, onToggle, note, onNote, notePlaceholder
  }: {
    label: string
    checked: boolean
    onToggle: () => void
    note: string
    onNote: (v: string) => void
    notePlaceholder?: string
  }) => (
    <div className="px-4 py-3 border-b border-gray-50 last:border-0">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-700">{label}</span>
        <button
          onClick={onToggle}
          className={`relative w-12 h-6 rounded-full transition-colors ${checked ? 'bg-[#FFB7C5]' : 'bg-gray-200'}`}
        >
          <span
            className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform"
            style={{ transform: checked ? 'translateX(20px)' : 'translateX(0px)' }}
          />
        </button>
      </div>
      {checked && (
        <input
          type="text"
          value={note}
          onChange={e => onNote(e.target.value)}
          placeholder={notePlaceholder ?? 'メモ（任意）'}
          className="mt-2 w-full text-xs bg-gray-50 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-pink-200"
        />
      )}
    </div>
  )

  const otherPets = pets.filter(p => p.id !== selectedPet?.id)

  return (
    <div className="min-h-screen bg-[#FFFBFC] pb-24">
      <header className="bg-[#FFB7C5] text-white text-center py-4 text-lg font-bold">
        今日の見守り記録
      </header>

      {selectedPet && (
        <div className="mx-5 mt-4 bg-pink-50 rounded-xl px-4 py-3 text-sm text-[#FFB7C5] font-medium">
          {selectedPet.name} の記録をつけましょう。
        </div>
      )}

      {pets.length > 1 && (
        <div className="flex gap-3 px-5 mt-3 overflow-x-auto">
          {pets.map(pet => (
            <button
              key={pet.id}
              onClick={() => {
                setSelectedPet(pet)
                setExtraPetIds(prev => prev.filter(id => id !== pet.id))
              }}
              className="flex flex-col items-center gap-1 shrink-0"
            >
              <div className={`w-14 h-14 rounded-full overflow-hidden border-4 transition-all ${
                selectedPet?.id === pet.id ? 'border-[#FFB7C5]' : 'border-gray-100'
              }`}>
                {pet.image_url ? (
                  <img src={pet.image_url} alt={pet.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-pink-50 flex items-center justify-center">
                    <PetPlaceholderIcon />
                  </div>
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
              max={toLocalDateString()}
              onChange={(e) => setDate(e.target.value)}
              className="text-sm bg-transparent focus:outline-none"
            />
          </div>
        </div>

        {/* ごきげん（必須） */}
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

        {/* 追加項目（設定で有効なもののみ） */}
        {(recordItems.length > 0 || freeLabels.free1 || freeLabels.free2 || freeLabels.free3) && (
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <label className="text-sm font-bold text-gray-600 block mb-3">記録項目</label>
            <div className="divide-y divide-gray-50 -mx-4">

              {recordItems.includes('weight') && (
                <div className="px-4 py-3 border-b border-gray-50">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">体重</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={weight}
                        onChange={e => setWeight(e.target.value)}
                        placeholder="0.00"
                        step="0.01"
                        className="w-20 text-sm text-right bg-gray-50 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-pink-200"
                      />
                      <span className="text-xs text-gray-400">{weightUnit}</span>
                    </div>
                  </div>
                </div>
              )}

              {recordItems.includes('temperature') && (
                <div className="px-4 py-3 border-b border-gray-50">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">体温</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={temperature}
                        onChange={e => setTemperature(e.target.value)}
                        placeholder="38.5"
                        step="0.1"
                        className="w-20 text-sm text-right bg-gray-50 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-pink-200"
                      />
                      <span className="text-xs text-gray-400">℃</span>
                    </div>
                  </div>
                </div>
              )}

              {recordItems.includes('no_appetite') && (
                <CheckItem
                  label="食欲がない"
                  checked={noAppetite}
                  onToggle={() => setNoAppetite(v => !v)}
                  note={noAppetiteNote}
                  onNote={setNoAppetiteNote}
                  notePlaceholder="どのくらい食べなかったか"
                />
              )}

              {recordItems.includes('abnormal_excretion') && (
                <CheckItem
                  label="排泄の異常"
                  checked={abnormalExcretion}
                  onToggle={() => setAbnormalExcretion(v => !v)}
                  note={abnormalExcretionNote}
                  onNote={setAbnormalExcretionNote}
                  notePlaceholder="どんな異常があったか"
                />
              )}

              {recordItems.includes('vomit') && (
                <CheckItem
                  label="嘔吐"
                  checked={vomit}
                  onToggle={() => setVomit(v => !v)}
                  note={vomitNote}
                  onNote={setVomitNote}
                  notePlaceholder="回数・様子など"
                />
              )}

              {recordItems.includes('nail_trimming') && (
                <CheckItem
                  label="爪切り"
                  checked={nailTrimming}
                  onToggle={() => setNailTrimming(v => !v)}
                  note={nailTrimmingNote}
                  onNote={setNailTrimmingNote}
                />
              )}

              {freeLabels.free1 && (
                <CheckItem
                  label={freeLabels.free1}
                  checked={free1Value}
                  onToggle={() => setFree1Value(v => !v)}
                  note={free1Note}
                  onNote={setFree1Note}
                />
              )}

              {freeLabels.free2 && (
                <CheckItem
                  label={freeLabels.free2}
                  checked={free2Value}
                  onToggle={() => setFree2Value(v => !v)}
                  note={free2Note}
                  onNote={setFree2Note}
                />
              )}

              {freeLabels.free3 && (
                <CheckItem
                  label={freeLabels.free3}
                  checked={free3Value}
                  onToggle={() => setFree3Value(v => !v)}
                  note={free3Note}
                  onNote={setFree3Note}
                />
              )}

            </div>
          </div>
        )}

        {/* メモ */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <label className="text-sm font-bold text-gray-600 block mb-2">メモ</label>
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="今日の様子、気づいたことなど"
            rows={4}
            className="w-full text-sm bg-gray-50 rounded-xl px-3 py-3 focus:outline-none focus:ring-1 focus:ring-pink-200 resize-none"
          />
        </div>

        {/* 写真 */}
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

          {otherPets.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-400 mb-2">写真に他の子も写っていますか？</p>
              <div className="flex gap-2 flex-wrap">
                {otherPets.map(pet => (
                  <button
                    key={pet.id}
                    onClick={() => toggleExtraPet(pet.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                      extraPetIds.includes(pet.id)
                        ? 'bg-[#FFB7C5] border-[#FFB7C5] text-white'
                        : 'bg-white border-gray-200 text-gray-500'
                    }`}
                  >
                    {pet.image_url ? (
                      <img src={pet.image_url} alt={pet.name} className="w-5 h-5 rounded-full object-cover" />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-pink-50 flex items-center justify-center">
                        <svg viewBox="0 0 24 24" fill="none" stroke="#FFB7C5" strokeWidth={2} className="w-3 h-3">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                        </svg>
                      </div>
                    )}
                    {pet.name}
                  </button>
                ))}
              </div>
            </div>
          )}
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
          {loading ? '送信中...' : '記録する'}
        </button>
      </div>

      <BottomNav />
    </div>
  )
}