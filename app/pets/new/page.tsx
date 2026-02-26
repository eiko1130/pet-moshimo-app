// @ts-nocheck
'use client'
import { useState } from 'react'
import Header from '@/components/Header'
import { CameraIcon, CheckIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase' // クラウド接続窓口

export default function NewPet() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [imageFile, setImageFile] = useState(null) // ファイル本体
  const [preview, setPreview] = useState(null)     // プレビュー用
  const [uploading, setUploading] = useState(false)

  // 1. 画像を選択した時の処理
  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImageFile(file)
    setPreview(URL.createObjectURL(file)) // 画面表示用のURLを作る
  }

  // 2. クラウドに保存する処理
  const handleSavePet = async () => {
    if (!name) return alert('名前を入力してね！')
    
    setUploading(true)
    let imageUrl = null

    try {
      // --- A. 画像がある場合はStorageにアップロード ---
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        const filePath = `profile/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('pet-images')
          .upload(filePath, imageFile)

        if (uploadError) throw uploadError

        // 公開URLを取得
        const { data } = supabase.storage
          .from('pet-images')
          .getPublicUrl(filePath)
        
        imageUrl = data.publicUrl
      }

      // --- B. データベース(my_pets)に登録 ---
      const { error: dbError } = await supabase
        .from('my_pets')
        .insert([{ 
          name: name, 
          image_url: imageUrl 
        }])

      if (dbError) throw dbError

      alert('クラウドに家族が登録されました！')
      router.push('/pets') // 一覧画面に戻る

    } catch (error) {
      console.error(error)
      alert('エラーが発生しました: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FFFBFC] pb-24 font-medium text-gray-700">
      <Header title="ペットを登録" />
      
      <div className="px-6 py-8 flex flex-col items-center">
        <div className="mb-8 flex flex-col items-center">
          <label className="relative w-32 h-32 rounded-full bg-white border-2 border-dashed border-[#FFB7C5] flex flex-col items-center justify-center cursor-pointer overflow-hidden group">
            {preview ? (
              <img src={preview} alt="preview" className="w-full h-full object-cover" />
            ) : (
              <>
                <CameraIcon className="w-8 h-8 text-[#FFB7C5]" />
                <span className="text-[10px] text-gray-400 mt-1">写真を登録</span>
              </>
            )}
            <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
          </label>
        </div>

        <div className="w-full space-y-6">
          <div>
            <label className="text-xs font-bold text-gray-400 tracking-widest uppercase ml-2">Name / おなまえ</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例：しらす" 
              className="w-full h-14 bg-white border-none rounded-[20px] px-6 mt-2 shadow-sm focus:ring-2 focus:ring-[#FFB7C5] outline-none"
            />
          </div>

          <button 
            onClick={handleSavePet}
            disabled={uploading}
            className={`w-full btn-primary h-16 shadow-lg shadow-pink-100/50 flex items-center justify-center gap-2 ${uploading ? 'opacity-50' : ''}`}
          >
            {uploading ? (
              '登録中...'
            ) : (
              <>
                <CheckIcon className="w-6 h-6" />
                登録する
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}