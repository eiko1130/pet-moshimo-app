'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/AuthProvider'
import BottomNav from '@/components/BottomNav'
import type { Pet } from '@/types'

export default function PetsPage() {
  const { user } = useAuth()
  const [pets, setPets] = useState<Pet[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    supabase
      .from('my_pets')
      .select('*')
      .order('created_at')
      .then(({ data }) => {
        setPets(data ?? [])
        setLoading(false)
      })
  }, [user])

  return (
    <div className="min-h-screen bg-[#FFFBFC] pb-24">
      <header className="bg-[#FFB7C5] text-white text-center py-4 text-lg font-bold">
        うちの子リスト
      </header>

      <p className="text-center text-sm text-gray-400 mt-5 mb-6">記録をつけたいペットを選んでください</p>

      {loading ? (
        <div className="flex justify-center mt-10">
          <div className="w-8 h-8 border-2 border-[#FFB7C5] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-5 px-8">
          {pets.map(pet => (
            <Link key={pet.id} href={`/pets/${pet.id}`} className="flex flex-col items-center gap-2">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-md bg-pink-50">
                {pet.photo_url ? (
                  <img src={pet.photo_url} alt={pet.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">🐱</div>
                )}
              </div>
              <span className="font-bold text-gray-700">{pet.name}</span>
            </Link>
          ))}

          {/* ペットを追加 */}
          <Link href="/pets/new" className="flex flex-col items-center gap-2">
            <div className="w-32 h-32 rounded-full border-2 border-dashed border-[#FFB7C5] flex items-center justify-center bg-pink-50">
              <span className="text-[#FFB7C5] text-4xl font-light">+</span>
            </div>
            <span className="text-sm text-[#FFB7C5] font-medium">ペットを追加</span>
          </Link>
        </div>
      )}

      <BottomNav />
    </div>
  )
}
