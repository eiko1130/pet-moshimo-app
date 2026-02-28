'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/AuthProvider'
import BottomNav from '@/components/BottomNav'
import Link from 'next/link'
import type { PetRecord } from '@/types'

type GroupedPhotos = {
  yearMonth: string
  label: string
  count: number
  photos: PetRecord[]
}

export default function GalleryPage() {
  const { user } = useAuth()
  const [groups, setGroups] = useState<GroupedPhotos[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    supabase
      .from('pet_records')
      .select('*')
      .not('image_url', 'is', null)
      .order('date', { ascending: false })
      .then(({ data }) => {
        const map: Record<string, PetRecord[]> = {}
        ;(data ?? []).forEach(r => {
          const ym = r.date.slice(0, 7)
          if (!map[ym]) map[ym] = []
          map[ym].push(r)
        })
        const result = Object.entries(map).map(([ym, photos]) => {
          const [y, m] = ym.split('-')
          return {
            yearMonth: ym,
            label: `${y}年 ${parseInt(m)}月`,
            count: photos.length,
            photos,
          }
        })
        setGroups(result)
        setLoading(false)
      })
  }, [user])

  return (
    <div className="min-h-screen bg-[#FFFBFC] pb-24">
      <header className="flex items-center justify-between bg-white border-b border-gray-100 px-4 py-4">
        <Link href="/" className="text-gray-400">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-6 h-6">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </Link>
        <span className="text-lg font-bold text-gray-700">思い出フォト</span>
        <button className="text-gray-400">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
            <line x1="8" y1="6" x2="21" y2="6"/>
            <line x1="8" y1="12" x2="21" y2="12"/>
            <line x1="8" y1="18" x2="21" y2="18"/>
            <line x1="3" y1="6" x2="3.01" y2="6"/>
            <line x1="3" y1="12" x2="3.01" y2="12"/>
            <line x1="3" y1="18" x2="3.01" y2="18"/>
          </svg>
        </button>
      </header>

      {loading ? (
        <div className="flex justify-center mt-10">
          <div className="w-8 h-8 border-2 border-[#FFB7C5] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : groups.length === 0 ? (
        <div className="flex flex-col items-center justify-center mt-20 gap-4 text-gray-400">
          <p className="text-sm text-center">写真はまだありません。<br/>毎日の健康記録から写真を登録しましょう。</p>
          <Link href="/record" className="bg-[#FFB7C5] text-white px-5 py-3 rounded-2xl text-sm font-bold flex items-center gap-2">
            📷 写真を撮る
          </Link>
        </div>
      ) : (
        <div className="px-4 py-4 space-y-6">
          {groups.map(group => (
            <div key={group.yearMonth}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-[#FFB7C5]">{group.label}</h3>
                <span className="text-xs text-gray-400">{group.count}枚の写真</span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                {group.photos.map(photo => (
                  <div key={photo.id} className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={photo.image_url!}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="text-center py-6 text-xs text-gray-400 space-y-3">
            <p>これより前の写真はまだありません。<br/>毎日の健康記録から写真を登録しましょう。</p>
            <Link href="/record" className="inline-flex items-center gap-2 border border-[#FFB7C5] text-[#FFB7C5] px-4 py-2 rounded-full text-sm font-medium">
              📷 写真を撮る
            </Link>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  )
}
