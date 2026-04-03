'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/AuthProvider'
import BottomNav from '@/components/BottomNav'
import type { Pet } from '@/types'

export default function PetsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [pets, setPets] = useState<Pet[]>([])
  const [loading, setLoading] = useState(true)
  const [partnerPets, setPartnerPets] = useState<Pet[]>([])
  const [partnerName, setPartnerName] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return

    // 自分のペット取得
    supabase
      .from('my_pets')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at')
      .then(({ data }) => {
        setPets(data ?? [])
        setLoading(false)
      })

    // パートナー情報取得
    supabase
      .from('moshimo_info')
      .select('proxy_user_id, proxy_approved_at, proxy_name')
      .eq('user_id', user.id)
      .single()
      .then(({ data }) => {
        if (!data?.proxy_user_id || !data?.proxy_approved_at) return

        setPartnerName(data.proxy_name ?? 'パートナー')

        // パートナーのペット取得
        supabase
          .from('my_pets')
          .select('*')
          .eq('user_id', data.proxy_user_id)
          .order('created_at')
          .then(({ data: partnerPetData }) => {
            setPartnerPets(partnerPetData ?? [])
          })
      })
  }, [user])

  return (
    <div className="min-h-screen bg-[#FFFBFC] pb-24">
      <header className="bg-[#FFB7C5] text-white flex items-center justify-between px-4 py-4">
        <button onClick={() => router.back()}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-6 h-6">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <span className="font-bold text-lg">うちの子リスト</span>
        <div className="w-6" />
      </header>

      {loading ? (
        <div className="flex justify-center mt-10">
          <div className="w-8 h-8 border-2 border-[#FFB7C5] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="px-8 py-6 space-y-8">

          {/* 自分のペット */}
          <section>
            <h2 className="text-xs font-bold text-gray-400 mb-4 px-1">自分のペット</h2>
            <div className="grid grid-cols-2 gap-5">
              {pets.map(pet => (
                <Link key={pet.id} href={`/pets/${pet.id}`} className="flex flex-col items-center gap-2">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-md bg-pink-50">
                    {pet.image_url ? (
                      <img src={pet.image_url} alt={pet.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg viewBox="0 0 24 24" fill="none" stroke="#FFB7C5" strokeWidth={1.5} className="w-12 h-12">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                        </svg>
                      </div>
                    )}
                  </div>
                  <span className="font-bold text-gray-700">{pet.name}</span>
                </Link>
              ))}

              {/* ペットを追加 */}
              <Link href="/pets/new" className="flex flex-col items-center gap-2">
                <div className="w-32 h-32 rounded-full border-2 border-dashed border-[#FFB7C5] flex items-center justify-center bg-pink-50">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#FFB7C5" strokeWidth={1.5} className="w-10 h-10">
                    <line x1="12" y1="5" x2="12" y2="19"/>
                    <line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                </div>
                <span className="text-sm text-[#FFB7C5] font-medium">ペットを追加</span>
              </Link>
            </div>
          </section>

          {/* パートナーのペット（承認済みの場合のみ表示） */}
          {partnerName && (
            <section>
              <h2 className="text-xs font-bold text-gray-400 mb-4 px-1">{partnerName}のペット</h2>
              {partnerPets.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 px-4 py-6 text-center">
                  <p className="text-sm text-gray-400">まだペットが登録されていません</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-5">
                  {partnerPets.map(pet => (
                    <div key={pet.id} className="flex flex-col items-center gap-2">
                      <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-md bg-pink-50">
                        {pet.image_url ? (
                          <img src={pet.image_url} alt={pet.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg viewBox="0 0 24 24" fill="none" stroke="#FFB7C5" strokeWidth={1.5} className="w-12 h-12">
                              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                            </svg>
                          </div>
                        )}
                      </div>
                      <span className="font-bold text-gray-700">{pet.name}</span>
                      <span className="text-xs text-gray-400">閲覧のみ</span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

        </div>
      )}

      <BottomNav />
    </div>
  )
}