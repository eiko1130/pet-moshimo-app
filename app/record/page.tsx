// @ts-nocheck
'use client'
import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import { CameraIcon, FaceSmileIcon, FaceFrownIcon } from '@heroicons/react/24/outline' 
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase' // 💡 追加

export default function RecordEntry() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [pets, setPets] = useState([])
  const [selectedPet, setSelectedPet] = useState(null)
  const [selectedMood, setSelectedMood] = useState('good')
  const [recordDate, setRecordDate] = useState('')
  const [memo, setMemo] = useState('')
  const [dailyImage, setDailyImage] = useState(null)
  const [uploading, setUploading] = useState(false) // 💡 アップロード中フラグ

  useEffect(() => {
    setMounted(true)
    setRecordDate(new Date().toISOString().split('T')[0])
    
    // 💡 1. ペット一覧をクラウドから取得
    async function fetchPets() {
      const { data } = await supabase.from('my_pets').select('*')
      if (data && data.length > 0) {
        setPets(data)
        setSelectedPet(data[0].id)
      }
    }
    fetchPets()
  }, [])

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setDailyImage(file) // 💡 ファイルをそのままセット
  }

  if (!mounted) return null

  // 💡 2. 保存処理をSupabase向けに書き換え
  const handleSave = async () => {
    if (!selectedPet) return alert('ペットを選んでね')
    setUploading(true)

    try {
      let imageUrl = null

      // 画像があればStorageにアップロード
      if (dailyImage) {
        const fileExt = dailyImage.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        const filePath = `${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('pet-images')
          .upload(filePath, dailyImage)

        if (uploadError) throw uploadError

        const { data: urlData } = supabase.storage
          .from('pet-images')
          .getPublicUrl(filePath)
        
        imageUrl = urlData.publicUrl
      }

      // 💡 pet_recordsテーブルにデータを保存
      const { error } = await supabase.from('pet_records').insert([
        {
          pet_id: selectedPet,
          date: recordDate,
          mood: selectedMood,
          memo: memo,
          image_url: imageUrl
        }
      ])

      if (error) throw error

      alert('クラウドに記録を保存しました！')
      router.push('/calendar')
    } catch (e) {
      console.error(e)
      alert('エラーが発生しました: ' + e.message)
    } finally {
      setUploading(false)
    }
  }

  const moods = [
    { id: 'good', label: '良い', Icon: FaceSmileIcon, color: 'text-[#FFB7C5] border-[#FFB7C5] bg-pink-50' },
    { id: 'normal', label: 'ふつう', Icon: FaceSmileIcon, color: 'text-gray-400 border-gray-300 bg-gray-50' },
    { id: 'bad', label: '悪い', Icon: FaceFrownIcon, color: 'text-blue-400 border-blue-200 bg-blue-50' },
  ]

  return (
    <div className="min-h-screen bg-[#FFFBFC] pb-24 font-medium text-gray-700">
      <Header title="今日の見守り記録" />
      <div className="px-6 py-8">
        <div className="mb-10">
          <label className="text-[10px] font-black text-gray-300 tracking-widest block mb-4 uppercase">Select Pet</label>
          <div className="space-y-3">
            {pets.map((pet) => (
              <button key={pet.id} onClick={() => setSelectedPet(pet.id)} className={`w-full flex items-center gap-4 p-4 rounded-[20px] border-2 transition-all ${selectedPet === pet.id ? 'bg-white border-[#FFB7C5] shadow-md' : 'bg-white border-gray-100'}`}>
                <div className="w-12 h-12 rounded-full bg-pink-50 relative overflow-hidden border border-gray-50 flex-shrink-0">
                  {pet.image_url && <img src={pet.image_url} alt="" className="w-full h-full object-cover" />}
                </div>
                <span className={`text-sm font-bold ${selectedPet === pet.id ? 'text-gray-700' : 'text-gray-400'}`}>{pet.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-8">
          <input type="date" value={recordDate} onChange={(e) => setRecordDate(e.target.value)} className="input-field" />
          <div className="flex gap-3">
            {moods.map((m) => (
              <button key={m.id} onClick={() => setSelectedMood(m.id)} className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-[24px] border-2 transition-all ${selectedMood === m.id ? m.color : 'bg-white border-gray-100 text-gray-300'}`}>
                <m.Icon className="w-8 h-8" /><span className="text-[10px] font-bold">{m.label}</span>
              </button>
            ))}
          </div>
          <label className="w-full h-44 bg-white border-2 border-dashed border-gray-100 rounded-[32px] flex flex-col items-center justify-center overflow-hidden cursor-pointer">
            {dailyImage ? (
              <img src={URL.createObjectURL(dailyImage)} className="w-full h-full object-cover" />
            ) : (
              <CameraIcon className="w-8 h-8 text-gray-200" />
            )}
            <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
          </label>
          <textarea value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="様子をメモ..." className="input-field min-h-[120px] resize-none" />
          <button 
            onClick={handleSave} 
            disabled={uploading}
            className="w-full btn-primary h-16 shadow-lg shadow-pink-100/50 disabled:bg-gray-200"
          >
            {uploading ? '保存中...' : '記録を保存する'}
          </button>
        </div>
      </div>
    </div>
  )
}