'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/AuthProvider'
import { compressImage } from '@/lib/compressImage'


const SPECIES_OPTIONS = ['猫', '犬', 'その他']

export default function PetDetailPage() {
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)
  const [message, setMessage] = useState('')
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)

  const [form, setForm] = useState({
    name: '',
    species: '',
    birth_year: '',
    birth_month: '',
    vaccine_info: '',
    insurance_info: '',
    pet_message: '',
    notes: '',
  })

  useEffect(() => {
    if (!user || !id) return
    supabase.from('my_pets').select('*').eq('id', id).single().then(({ data }) => {
      if (!data) return
      setForm({
        name: data.name ?? '',
        species: data.species ?? '',
        birth_year: data.birth_year ? String(data.birth_year) : '',
        birth_month: data.birth_month ? String(data.birth_month) : '',
        vaccine_info: data.vaccine_info ?? '',
        insurance_info: data.insurance_info ?? '',
        pet_message: data.pet_message ?? '',
        notes: data.notes ?? '',
      })
      setPhotoPreview(data.image_url ?? null)
      setLoading(false)
    })
  }, [user, id])

  const set = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }))

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    try {
      let image_url = photoPreview
      if (photoFile) {
        const compressed = await compressImage(photoFile)
        const path = `${user.id}/${Date.now()}.jpg`
        const { error: uploadError } = await supabase.storage
          .from('pet-images').upload(path, compressed)
        if (!uploadError) {
          const { data } = supabase.storage.from('pet-images').getPublicUrl(path)
          image_url = data.publicUrl
        }
      }
      const { error } = await supabase.from('my_pets').update({
        name: form.name,
        species: form.species || null,
        birth_year: form.birth_year ? parseInt(form.birth_year) : null,
        birth_month: form.birth_month ? parseInt(form.birth_month) : null,
        vaccine_info: form.vaccine_info || null,
        insurance_info: form.insurance_info || null,
        pet_message: form.pet_message || null,
        notes: form.notes || null,
        image_url,
      }).eq('id', id)
      if (error) throw error
      setEditing(false)
      setMessage('保存しました！')
      setTimeout(() => setMessage(''), 2000)
    } catch (e: any) {
      setMessage(e.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm(`${form.name}を削除しますか？`)) return
    await supabase.from('my_pets').delete().eq('id', id)
    router.push('/pets')
  }

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 30 }, (_, i) => currentYear - i)
  const months = Array.from({ length: 12 }, (_, i) => i + 1)

  if (loading) return (
    <div className="min-h-screen bg-[#FFFBFC] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#FFB7C5] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-[#FFFBFC] pb-10">
      <header className="bg-[#FFB7C5] text-white flex items-center justify-between px-4 py-4">
        <button onClick={() => router.back()}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-6 h-6">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <span className="font-bold">{form.name}</span>
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

      <div className="px-5 py-5 space-y-5">
        {/* 写真 */}
        <div className="flex justify-center">
          <label className={editing ? 'cursor-pointer' : ''}>
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-pink-100 bg-pink-50">
              {photoPreview ? (
                <img src={photoPreview} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-1">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-8 h-8">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                    <circle cx="12" cy="13" r="4"/>
                  </svg>
                  {editing && <span className="text-xs">写真を追加</span>}
                </div>
              )}
            </div>
            {editing && (
              <input type="file" accept="image/*" className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) { setPhotoFile(f); setPhotoPreview(URL.createObjectURL(f)) }
                }}
              />
            )}
          </label>
        </div>

        {/* 基本情報 */}
        <section>
          <h2 className="text-sm font-bold text-[#FFB7C5] mb-3">基本情報</h2>
          <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50">
            {/* 名前 */}
            <div className="px-4 py-3">
              <label className="text-xs text-gray-400 block mb-1">名前</label>
              {editing ? (
                <input
                  type="text"
                  value={form.name}
                  onChange={e => set('name', e.target.value)}
                  placeholder="しらす"
                  className="w-full text-sm text-gray-700 bg-transparent focus:outline-none"
                />
              ) : (
                <p className="text-sm text-gray-700">{form.name || <span className="text-gray-300">未設定</span>}</p>
              )}
            </div>

            {/* 種類 */}
            <div className="px-4 py-3">
              <label className="text-xs text-gray-400 block mb-1">種類</label>
              {editing ? (
                <div className="flex gap-2 mt-1">
                  {SPECIES_OPTIONS.map(s => (
                    <button
                      key={s}
                      onClick={() => set('species', s)}
                      className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-all ${
                        form.species === s
                          ? 'bg-[#FFB7C5] border-[#FFB7C5] text-white'
                          : 'bg-white border-gray-200 text-gray-500'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-700">{form.species || <span className="text-gray-300">未設定</span>}</p>
              )}
            </div>

            {/* 誕生日 */}
            <div className="px-4 py-3">
              <label className="text-xs text-gray-400 block mb-1">誕生日</label>
              {editing ? (
                <div className="space-y-2">
                  <p className="text-xs text-gray-400">正確な誕生日がわからない場合はおおよその生年だけ入れてください</p>
                  <div className="flex gap-2 items-center">
                    <select
                      value={form.birth_year}
                      onChange={e => set('birth_year', e.target.value)}
                      className="text-sm text-gray-700 bg-gray-50 rounded-lg px-2 py-1.5 focus:outline-none"
                    >
                      <option value="">年</option>
                      {years.map(y => <option key={y} value={y}>{y}年</option>)}
                    </select>
                    <select
                      value={form.birth_month}
                      onChange={e => set('birth_month', e.target.value)}
                      className="text-sm text-gray-700 bg-gray-50 rounded-lg px-2 py-1.5 focus:outline-none"
                    >
                      <option value="">月（不明）</option>
                      {months.map(m => <option key={m} value={m}>{m}月</option>)}
                    </select>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-700">
                  {form.birth_year
                    ? `${form.birth_year}年${form.birth_month ? `${form.birth_month}月` : '（月不明）'}`
                    : <span className="text-gray-300">未設定</span>
                  }
                </p>
              )}
            </div>
          </div>
        </section>

        {/* 健康情報 */}
        <section>
          <h2 className="text-sm font-bold text-[#FFB7C5] mb-3">健康情報</h2>
          <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50">
            {[
              { label: 'ワクチン情報', key: 'vaccine_info', placeholder: '混合ワクチン 2024年3月接種済み' },
              { label: 'ペット保険番号', key: 'insurance_info', placeholder: '証券番号: 1234-5678' },
            ].map(item => (
              <div key={item.key} className="px-4 py-3">
                <label className="text-xs text-gray-400 block mb-1">{item.label}</label>
                {editing ? (
                  <input
                    type="text"
                    value={form[item.key as keyof typeof form]}
                    onChange={e => set(item.key, e.target.value)}
                    placeholder={item.placeholder}
                    className="w-full text-sm text-gray-700 bg-transparent focus:outline-none"
                  />
                ) : (
                  <p className="text-sm text-gray-700">{form[item.key as keyof typeof form] || <span className="text-gray-300">未設定</span>}</p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* 代理人への伝言 */}
        <section>
          <h2 className="text-sm font-bold text-[#FFB7C5] mb-3">代理人への伝言</h2>
          <div className="bg-white rounded-2xl border border-gray-100">
            <div className="px-4 py-3">
              <label className="text-xs text-gray-400 block mb-1">この子についての伝言</label>
              {editing ? (
                <textarea
                  value={form.pet_message}
                  onChange={e => set('pet_message', e.target.value)}
                  placeholder="ご飯は朝晩1回ずつ。ビビりなので優しく接してください。"
                  rows={4}
                  className="w-full text-sm text-gray-700 bg-transparent focus:outline-none resize-none"
                />
              ) : (
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{form.pet_message || <span className="text-gray-300">未設定</span>}</p>
              )}
            </div>
          </div>
        </section>

        {/* メモ */}
        <section>
          <h2 className="text-sm font-bold text-[#FFB7C5] mb-3">メモ</h2>
          <div className="bg-white rounded-2xl border border-gray-100">
            <div className="px-4 py-3">
              {editing ? (
                <textarea
                  value={form.notes}
                  onChange={e => set('notes', e.target.value)}
                  placeholder="その他気になること"
                  rows={3}
                  className="w-full text-sm text-gray-700 bg-transparent focus:outline-none resize-none"
                />
              ) : (
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{form.notes || <span className="text-gray-300">未設定</span>}</p>
              )}
            </div>
          </div>
        </section>

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

        <button
          onClick={handleDelete}
          className="w-full text-red-400 text-sm py-3 border border-red-100 rounded-2xl"
        >
          このペットを削除する
        </button>
      </div>
    </div>
  )
}