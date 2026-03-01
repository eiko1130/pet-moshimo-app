'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/AuthProvider'
import type { Pet } from '@/types'

export default function PetDetailPage() {
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [pet, setPet] = useState<Pet | null>(null)
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)

  const [form, setForm] = useState({
    name: '',
    species: '',
    birthday: '',
    vaccine_info: '',
    insurance_info: '',
    pet_message: '',
    notes: '',
  })

  useEffect(() => {
    if (!user || !id) return
    supabase.from('my_pets').select('*').eq('id', id).single().then(({ data }) => {
      if (!data) return
      setPet(data)
      setForm({
        name: data.name ?? '',
        species: data.species ?? '',
        birthday: data.birthday ?? '',
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
    if (!user || !pet) return
    setSaving(true)
    try {
      let image_url = pet.image_url
      if (photoFile) {
        const ext = photoFile.name.split('.').pop()
        const path = `${user.id}/${Date.now()}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('pet-images').upload(path, photoFile)
        if (!uploadError) {
          const { data } = supabase.storage.from('pet-images').getPublicUrl(path)
          image_url = data.publicUrl
        }
      }
      const { error } = await supabase.from('my_pets').update({
        ...form,
        image_url,
        birthday: form.birthday || null,
      }).eq('id', id)
      if (error) throw error
      setPet(p => p ? { ...p, ...form, image_url } : p)
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
    if (!confirm(`${pet?.name}を削除しますか？`)) return
    await supabase.from('my_pets').delete().eq('id', id)
    router.push('/pets')
  }

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
        <span className="font-bold">{pet?.name}</span>
        {!editing ? (
          <button onClick={() => setEditing(true)} className="text-sm bg-white text-[#FFB7C5] px-3 py-1 rounded-full font-bold">
            編集
          </button>
        ) : (
          <button onClick={() => { setEditing(false); setPhotoPreview(pet?.image_url ?? null) }} className="text-sm text-white opacity-70">
            キャンセル
          </button>
        )}
      </header>

      <div className="px-5 py-5 space-y-5">
        {/* 写真 */}
        <div className="flex justify-center">
          {editing ? (
            <label className="cursor-pointer">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-pink-100 bg-pink-50">
                {photoPreview ? (
                  <img src={photoPreview} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-1">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-8 h-8">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                      <circle cx="12" cy="13" r="4"/>
                    </svg>
                    <span className="text-xs">写真を追加</span>
                  </div>
                )}
              </div>
              <input type="file" accept="image/*" className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) { setPhotoFile(f); setPhotoPreview(URL.createObjectURL(f)) }
                }}
              />
            </label>
          ) : (
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-pink-100 bg-pink-50">
              {photoPreview ? (
                <img src={photoPreview} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-5xl">🐱</div>
              )}
            </div>
          )}
        </div>

        {/* 基本情報 */}
        <section>
          <h2 className="text-sm font-bold text-[#FFB7C5] mb-3">基本情報</h2>
          <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50">
            {[
              { label: '名前', key: 'name', placeholder: 'しらす' },
              { label: '種類', key: 'species', placeholder: '猫・アメリカンショートヘア' },
              { label: '誕生日', key: 'birthday', placeholder: '2020-04-01', type: 'date' },
            ].map(item => (
              <div key={item.key} className="px-4 py-3">
                <label className="text-xs text-gray-400 block mb-1">{item.label}</label>
                {editing ? (
                  <input
                    type={item.type ?? 'text'}
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

        {/* 伝言・メモ */}
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

        {/* 削除ボタン */}
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