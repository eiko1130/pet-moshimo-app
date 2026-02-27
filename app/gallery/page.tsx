// @ts-nocheck
'use client'
import Header from '@/components/Header'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function GalleryPage() {
  const [photos, setPhotos] = useState([])
  const [pets, setPets] = useState([])
  const [activeTab, setActiveTab] = useState('すべて')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchGalleryData() {
      setLoading(true)
      try {
        const { data: { user } } = await supabase.auth.getUser()

        // ログインしていない場合は全てリセット
        if (!user) {
          setPets([])
          setPhotos([])
          return
        }

        const [petsRes, recordsRes] = await Promise.all([
          supabase.from('my_pets').select('*').eq('user_id', user.id),
          supabase.from('pet_records').select('*').eq('user_id', user.id).not('image_url', 'is', null)
        ])

        const savedPets = petsRes.data || []
        const savedRecords = recordsRes.data || []
        setPets(savedPets)

        const galleryItems = []
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
            ) : null /* 💡 データがない時は何も（🐾も）出さない */
            }
          </div>
        )}
        
        {!loading && filteredPhotos.length === 0 && (
          <div className="mt-24 flex flex-col items-center justify-center space-y-2">
            <span className="text-4xl opacity-20">🎞️</span>
            <p className="text-center text-gray-300 text-xs font-bold tracking-widest italic">
              NO PHOTOS YET
            </p>
          </div>
        )}
      </div>
    </div>
  )
}