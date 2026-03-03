'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/AuthProvider'
import BottomNav from '@/components/BottomNav'
import Link from 'next/link'
import type { Pet, PetRecord } from '@/types'

export default function GalleryPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [pets, setPets] = useState<Pet[]>([])
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null)
  const [allRecords, setAllRecords] = useState<PetRecord[]>([])
  const [groups, setGroups] = useState<{ yearMonth: string; label: string; photos: PetRecord[] }[]>([])
  const [loading, setLoading] = useState(true)

  // ポップアップ
  const [popupRecord, setPopupRecord] = useState<PetRecord | null>(null)
  const [flatPhotos, setFlatPhotos] = useState<PetRecord[]>([])

  useEffect(() => {
    if (!user) return
    supabase.from('my_pets').select('*').order('created_at').then(({ data }) => setPets(data ?? []))
    supabase
      .from('pet_records')
      .select('*')
      .not('image_url', 'is', null)
      .order('date', { ascending: false })
      .then(({ data }) => {
        setAllRecords(data ?? [])
        setLoading(false)
      })
  }, [user])

  useEffect(() => {
    let filtered = allRecords
    if (selectedPetId) {
      filtered = allRecords.filter(r =>
        r.pet_id === selectedPetId ||
        (r.extra_pet_ids && r.extra_pet_ids.includes(selectedPetId))
      )
    }
    setFlatPhotos(filtered)
    const map: Record<string, PetRecord[]> = {}
    filtered.forEach(r => {
      const ym = r.date.slice(0, 7)
      if (!map[ym]) map[ym] = []
      map[ym].push(r)
    })
    const result = Object.entries(map).map(([ym, photos]) => {
      const [y, m] = ym.split('-')
      return { yearMonth: ym, label: `${y}年 ${parseInt(m)}月`, photos }
    })
    setGroups(result)
  }, [allRecords, selectedPetId])

  const currentIndex = popupRecord ? flatPhotos.findIndex(r => r.id === popupRecord.id) : -1
  const prevPhoto = currentIndex > 0 ? flatPhotos[currentIndex - 1] : null
  const nextPhoto = currentIndex < flatPhotos.length - 1 ? flatPhotos[currentIndex + 1] : null

  return (
    <div className="min-h-screen bg-[#FFFBFC] pb-24">
      <header className="flex items-center justify-between bg-white border-b border-gray-100 px-4 py-4">
        <Link href="/" className="text-gray-400">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-6 h-6">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </Link>
        <span className="text-lg font-bold text-gray-700">思い出フォト</span>
        <div className="w-6" />
      </header>

      {/* ペット絞り込み */}
      {pets.length > 1 && (
        <div className="flex gap-2 px-4 py-3 overflow-x-auto">
          <button
            onClick={() => setSelectedPetId(null)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-all whitespace-nowrap ${
              selectedPetId === null ? 'bg-[#FFB7C5] border-[#FFB7C5] text-white' : 'bg-white border-gray-200 text-gray-500'
            }`}
          >すべて</button>
          {pets.map(pet => (
            <button
              key={pet.id}
              onClick={() => setSelectedPetId(pet.id)}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium border transition-all whitespace-nowrap ${
                selectedPetId === pet.id ? 'bg-[#FFB7C5] border-[#FFB7C5] text-white' : 'bg-white border-gray-200 text-gray-500'
              }`}
            >
              {pet.image_url && <img src={pet.image_url} alt="" className="w-5 h-5 rounded-full object-cover" />}
              {pet.name}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center mt-10">
          <div className="w-8 h-8 border-2 border-[#FFB7C5] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : groups.length === 0 ? (
        <div className="flex flex-col items-center justify-center mt-20 gap-4 text-gray-400">
          <p className="text-sm text-center">写真はまだありません。<br/>毎日の健康記録から写真を登録しましょう。</p>
          <Link href="/record" className="bg-[#FFB7C5] text-white px-5 py-3 rounded-2xl text-sm font-bold">
            📷 写真を撮る
          </Link>
        </div>
      ) : (
        <div className="px-4 py-4 space-y-6">
          {groups.map(group => (
            <div key={group.yearMonth}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-[#FFB7C5]">{group.label}</h3>
                <span className="text-xs text-gray-400">{group.photos.length}枚の写真</span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                {group.photos.map(photo => (
                  <button
                    key={photo.id}
                    onClick={() => setPopupRecord(photo)}
                    className="aspect-square rounded-lg overflow-hidden bg-gray-100"
                  >
                    <img src={photo.image_url!} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ポップアップ */}
      {popupRecord && (
  <div className="fixed inset-0 z-50 bg-black/70 flex items-end justify-center" onClick={() => setPopupRecord(null)}>
    <div className="bg-white rounded-t-3xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
      {/* 写真 */}
      <div className="relative mx-4 mt-4">
        <img
          src={popupRecord.image_url!}
          alt=""
          className="w-full h-56 object-contain bg-gray-50 rounded-2xl"
        />
        <button
          onClick={() => setPopupRecord(null)}
          className="absolute top-2 right-2 bg-black/40 rounded-full p-1.5 text-white"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      {/* メモ */}
      {popupRecord.memo && (
        <p className="text-gray-500 text-xs px-5 pt-3 line-clamp-2">{popupRecord.memo}</p>
      )}

      {/* ナビゲーション */}
      <div className="flex gap-2 px-4 pt-3 pb-8">
        <button
          onClick={() => prevPhoto && setPopupRecord(prevPhoto)}
          disabled={!prevPhoto}
          className="flex-1 flex items-center justify-center gap-1 py-2.5 bg-gray-100 rounded-xl text-gray-600 text-xs font-medium disabled:opacity-30"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          前の写真
        </button>
        <button
          onClick={() => router.push(`/calendar/${popupRecord.id}`)}
          className="flex-1 flex items-center justify-center gap-1 py-2.5 bg-[#FFB7C5] rounded-xl text-white text-xs font-medium"
        >
          📖 この日の日記
        </button>
        <button
          onClick={() => nextPhoto && setPopupRecord(nextPhoto)}
          disabled={!nextPhoto}
          className="flex-1 flex items-center justify-center gap-1 py-2.5 bg-gray-100 rounded-xl text-gray-600 text-xs font-medium disabled:opacity-30"
        >
          次の写真
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
)}

      <BottomNav />
    </div>
  )
}