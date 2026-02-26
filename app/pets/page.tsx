// @ts-nocheck
'use client'
import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import Link from 'next/link'
import { PlusIcon } from '@heroicons/react/24/outline'
import { supabase } from '@/lib/supabase' // クラウド窓口を読み込み

export default function PetList() {
  const [pets, setPets] = useState([])
  const [loading, setLoading] = useState(true)

  // 💡 変更点1：画面が開いた瞬間にSupabase（クラウド）をチェックする
  useEffect(() => {
    async function fetchPets() {
      const { data, error } = await supabase
        .from('my_pets')
        .select('*') // すべての列を取得
        .order('created_at', { ascending: true }) // 登録順に並べる

      if (data && data.length > 0) {
        setPets(data)
      } else {
        // クラウドが空っぽの時だけ、今まで通りダミーを表示
        setPets([
          { id: 'd1', name: 'しらす', image_url: '/shirasu.png' },
          { id: 'd2', name: 'おこめ', image_url: '/okome.png' },
          { id: 'd3', name: '将軍', image_url: '/shogun.png' },
        ])
      }
      setLoading(false)
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
                {/* 💡 変更点2：pet.image ではなく pet.image_url を使う */}
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
        {loading && <p className="text-center text-[10px] text-gray-300 mt-4">読み込み中...</p>}
      </div>
    </div>
  )
}
