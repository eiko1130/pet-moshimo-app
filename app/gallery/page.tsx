// @ts-nocheck
'use client'
import Header from '@/components/Header'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase' // 💡 追加

export default function GalleryPage() {
  const [photos, setPhotos] = useState([])
  const [pets, setPets] = useState([])
  const [activeTab, setActiveTab] = useState('すべて')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchGalleryData() {
      setLoading(true)
      try {
        // 1. クラウドからペット名簿と記録を同時に取得
        const [petsRes, recordsRes] = await Promise.all([
          supabase.from('my_pets').select('*'),
          supabase.from('pet_records').select('*').not('image_url', 'is', null) // 画像がある記録だけ
        ])

        const savedPets = petsRes.data || []
        const savedRecords = recordsRes.data || []
        
        setPets(savedPets)

        // 2. ギャラリー用にデータを整形
        const galleryItems = []

        // A. 日々の記録からの写真
        savedRecords.forEach(record => {
          const pet = savedPets.find(p => p.id === record.pet_id)
          galleryItems.push({
            id: record.id,
            src: record.image_url,
            petName: pet ? pet.name : '不明',
            date: record.date.replace(/-/g, '.'),
            createdAt: record.created_at
          })
        })

        // B. プロフィール写真も思い出として追加
        savedPets.forEach(pet => {
          if (pet.image_url) {
            galleryItems.push({
              id: `profile-${pet.id}`,
              src: pet.image_url,
              petName: pet.name,
              date: 'Profile',
              createdAt: pet.created_at
            })
          }
        })

        // 新しい順（作成日時順）に並び替え
        galleryItems.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        setPhotos(galleryItems)

      } catch (error) {
        console.error('ギャラリー取得失敗:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchGalleryData()
  }, [])

  // 3. フィルタリング処理
  const filteredPhotos = activeTab === 'すべて' 
    ? photos 
    : photos.filter(p => p.petName === activeTab)

  return (
    <div className="min-h-screen bg-[#FFFBFC] pb-24 font-medium text-gray-700">
      <Header title="思い出ギャラリー" showMenu={true} />
      
      <div className="px-1 py-4">
        {/* 動的なフィルタータブ */}
        <div className="flex gap-2 px-4 mb-6 overflow-x-auto no-scrollbar">
          {['すべて', ...pets.map(p => p.name)].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-full text-[11px] font-bold tracking-wider transition-all whitespace-nowrap ${
                activeTab === tab 
                ? 'bg-[#FFB7C5] text-white shadow-sm' 
                : 'bg-white text-gray-400 border border-pink-50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* 写真グリッド */}
        {loading ? (
          <p className="text-center text-gray-300 text-xs mt-10">読み込み中...</p>
        ) : (
          <div className="grid grid-cols-3 gap-1">
            {filteredPhotos.length > 0 ? (
              filteredPhotos.map((photo) => (
                <div key={photo.id} className="aspect-square relative group overflow-hidden bg-pink-50">
                  <img
                    src={photo.src}
                    alt={`${photo.petName}の画像`}
                    className="w-full h-full object-cover transition-transform group-hover:scale-110"
                  />
                  <div className="absolute bottom-1 right-1 bg-black/20 backdrop-blur-[2px] px-1.5 py-0.5 rounded text-[8px] text-white font-bold">
                    {photo.petName}
                  </div>
                </div>
              ))
            ) : (
              // 画像がない時のダミー
              [...Array(9)].map((_, i) => (
                <div key={i} className="aspect-square bg-white border border-pink-50/20 flex items-center justify-center">
                  <span className="text-pink-100 text-[10px] opacity-30">🐾</span>
                </div>
              ))
            )}
          </div>
        )}
        
        {!loading && filteredPhotos.length === 0 && (
          <p className="text-center text-gray-300 text-xs mt-20 font-bold tracking-widest">
            NO PHOTOS YET
          </p>
        )}
      </div>
    </div>
  )
}