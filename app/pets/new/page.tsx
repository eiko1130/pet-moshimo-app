'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/AuthProvider'
import BottomNav from '@/components/BottomNav'
import { compressImage } from '@/lib/compressImage'

export default function NewPetPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [name, setName] = useState('')
  const [species, setSpecies] = useState('猫')
  const [birthday, setBirthday] = useState('')
  const [notes, setNotes] = useState('')
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async () => {
    if (!user || !name) {
      setMessage('名前を入力してください')
      return
    }
    setLoading(true)
    try {
      let image_url = null

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

      const { error } = await supabase.from('my_pets').insert({
        user_id: user.id,
        name,
        species,
        birthday: birthday || null,
        notes: notes || null,
        image_url,
      })
      if (error) throw error
      router.push('/pets')
    } catch (e: any) {
      setMessage(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FFFBFC] pb-24">
      <header className="bg-[#FFB7C5] text-white flex items-center px-4 py-4 gap-3">
        <button onClick={() => router.back()}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-6 h-6">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <span className="text-lg font-bold">ペットを追加</span>
      </header>

      <div className="px-5 py-6 space-y-4">
        <div className="flex justify-center">
          <label className="cursor-pointer">
            <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-md bg-pink-50 flex items-center justify-center">
              {photoPreview ? (
                <img src={photoPreview} alt="preview" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center text-gray-400 text-xs">
                  <div className="text-3xl mb-1">📷</div>
                  写真を追加
                </div>
              )}
            </div>
            <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
          </label>
        </div>

        <div>
          <label className="text-sm text-gray-600 font-medium mb-1 block">名前 <span className="text-pink-400">必須</span></label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例：しらす"
            className="w-full border border-gray-100 rounded-xl px-4 py-3 text-sm bg-gray-50 focus:outline-none focus:border-pink-200"
          />
        </div>

        <div>
          <label className="text-sm text-gray-600 font-medium mb-1 block">種類</label>
          <input
            type="text"
            value={species}
            onChange={(e) => setSpecies(e.target.value)}
            placeholder="例：猫、犬"
            className="w-full border border-gray-100 rounded-xl px-4 py-3 text-sm bg-gray-50 focus:outline-none focus:border-pink-200"
          />
        </div>

        <div>
          <label className="text-sm text-gray-600 font-medium mb-1 block">誕生日</label>
          <input
            type="date"
            value={birthday}
            onChange={(e) => setBirthday(e.target.value)}
            className="w-full border border-gray-100 rounded-xl px-4 py-3 text-sm bg-gray-50 focus:outline-none focus:border-pink-200"
          />
        </div>

        <div>
          <label className="text-sm text-gray-600 font-medium mb-1 block">メモ</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="特徴や気をつけること"
            rows={3}
            className="w-full border border-gray-100 rounded-xl px-4 py-3 text-sm bg-gray-50 focus:outline-none focus:border-pink-200 resize-none"
          />
        </div>

        {message && <p className="text-xs text-pink-400 text-center">{message}</p>}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-[#FFB7C5] text-white font-bold py-4 rounded-2xl text-sm disabled:opacity-50"
        >
          {loading ? '保存中...' : '登録する'}
        </button>
      </div>

      <BottomNav />
    </div>
  )
}