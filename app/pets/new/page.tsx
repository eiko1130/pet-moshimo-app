'use client'
import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/AuthProvider'
import BottomNav from '@/components/BottomNav'
import { compressImage } from '@/lib/compressImage'
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'

function centerAspectCrop(mediaWidth: number, mediaHeight: number) {
  return centerCrop(
    makeAspectCrop({ unit: '%', width: 80 }, 1, mediaWidth, mediaHeight),
    mediaWidth,
    mediaHeight
  )
}

async function getCroppedImg(image: HTMLImageElement, crop: PixelCrop): Promise<File> {
  const canvas = document.createElement('canvas')
  const scaleX = image.naturalWidth / image.width
  const scaleY = image.naturalHeight / image.height
  canvas.width = crop.width
  canvas.height = crop.height
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(
    image,
    crop.x * scaleX, crop.y * scaleY,
    crop.width * scaleX, crop.height * scaleY,
    0, 0, crop.width, crop.height
  )
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(new File([blob!], 'cropped.jpg', { type: 'image/jpeg' }))
    }, 'image/jpeg', 0.9)
  })
}

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

  // トリミング関連
  const [cropSrc, setCropSrc] = useState<string | null>(null)
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
  const imgRef = useRef<HTMLImageElement>(null)

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setCropSrc(reader.result as string)
    reader.readAsDataURL(file)
  }

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget
    setCrop(centerAspectCrop(width, height))
  }

  const handleCropDone = async () => {
    if (!imgRef.current || !completedCrop) return
    const croppedFile = await getCroppedImg(imgRef.current, completedCrop)
    setPhotoFile(croppedFile)
    setPhotoPreview(URL.createObjectURL(croppedFile))
    setCropSrc(null)
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
        birth_year: birthday ? parseInt(birthday.split('-')[0]) : null,
        birth_month: birthday ? parseInt(birthday.split('-')[1]) : null,
        birth_day: birthday ? parseInt(birthday.split('-')[2]) : null,
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

      {/* トリミング画面 */}
      {cropSrc && (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex flex-col items-center justify-center p-4">
          <p className="text-white text-sm mb-4 font-bold">ペットの顔が中心に来るように調整してください</p>
          <ReactCrop
            crop={crop}
            onChange={(c) => setCrop(c)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={1}
            circularCrop
          >
            <img
              ref={imgRef}
              src={cropSrc}
              onLoad={onImageLoad}
              className="max-h-[60vh] max-w-full"
            />
          </ReactCrop>
          <div className="flex gap-3 mt-6 w-full max-w-xs">
            <button
              onClick={() => setCropSrc(null)}
              className="flex-1 bg-white text-gray-600 font-bold py-3 rounded-2xl text-sm"
            >
              キャンセル
            </button>
            <button
              onClick={handleCropDone}
              className="flex-1 bg-[#FFB7C5] text-white font-bold py-3 rounded-2xl text-sm"
            >
              決定
            </button>
          </div>
        </div>
      )}

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