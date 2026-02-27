// @ts-nocheck
'use client'
import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import Link from 'next/link'
import { PlusIcon } from '@heroicons/react/24/outline'
import { supabase } from '@/lib/supabase'
import { Pet } from '../types' // app/types.ts がある前提です

export default function PetList() {
  const [pets, setPets] = useState<Pet[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPets() {
      setLoading(true)
      try {
        // 1. ログインしている自分の情報を取得
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          setLoading(false)
          return
        }

        // 2. 自分の ID と一致するペットだけを取得（ダミーは一切入れない）
        const { data, error } = await supabase
          .from('my_pets')
          .select('*')
          .eq('user_id', user.id) // 持ち主が自分であること
          .order('created_at', { ascending: true })

        if (error) throw error

        // 3. データをセット（なければ空の配列 [] が入る）
        setPets(data || [])
        
      } catch (error) {
        console.error('ペットの取得に失敗しました:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPets()
  }, [])

  return (
    <div className="min-h-screen bg-[#FFFBFC] pb-24">
      <Header title="うちの子リスト" showMenu={true} />
      
      <div className="px-6 py-10">
        <p className="text-center text-[11px] text-pink-200 tracking-[0.3em] mb-12 font-black uppercase">
          Select Your Pet
        </p>
        
        <div className="grid grid-cols-2 gap-x-8 gap-y-12">
          {pets.map((pet) => (
            <div key={pet.id} className="flex flex-col items-center group cursor-pointer">
              <div className="w-28 h-28 rounded-full shadow-md border-4 border-white overflow-hidden relative mb-4 bg-[#FFDDE4] group-active:scale-95 transition-all">
                {pet.image_url ? (
                  <img
                    src={pet.image_url}
                    alt={pet.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-white text-2xl font-bold">
                    🐾
                  </div>
                )}
              </div>
              <span className="text-gray-600 font-bold text-[15px] tracking-tighter">
                {pet.name}
              </span>
            </div>
          ))}
          
          <Link href="/pets/new" className="flex flex-col items-center group cursor-pointer">
            <div className="w-28 h-28 border-2 border-dashed border-pink-100 rounded-full flex items-center justify-center bg-white group-hover:border-[#FFB7C5] transition-colors mb-4 group-active:scale-95">
              <PlusIcon className="w-8 h-8 text-pink-100 group-hover:text-[#FFB7C5]" />
            </div>
            <span className="text-pink-200 font-bold text-[11px] tracking-widest uppercase">
              Add Pet
            </span>
          </Link>
        </div>
        
        {loading && (
          <p className="text-center text-[10px] text-gray-300 mt-8 animate-pulse">
            うちの子を探しています...
          </p>
        )}
        
        {!loading && pets.length === 0 && (
          <div className="mt-8 p-6 border border-dashed border-pink-50 rounded-2xl bg-white/50">
            <p className="text-center text-[12px] text-gray-400 leading-relaxed">
             まだペットがいません。<br />
             登録してください。<br />
            </p>
          </div>
        )}
      </div>
    </div>
  )
}