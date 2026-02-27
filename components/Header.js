'use client'
import { useState } from 'react' // 追加
import { Bars3Icon } from '@heroicons/react/24/outline'
import { supabase } from '@/lib/supabase' // ログアウト用に必要
import { useRouter } from 'next/navigation'

export default function Header({ title, showMenu = true }) {
  const [isOpen, setIsOpen] = useState(false) // メニューの開閉状態を管理
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/auth' // 確実にキャッシュを切って移動
  }

  return (
    <header className="bg-[#FF9A93] sticky top-0 z-50 shadow-sm">
      <div className="flex items-center justify-between px-4 h-16">
        {showMenu ? (
          <button 
            onClick={() => setIsOpen(!isOpen)} // クリックでメニューを開閉
            className="p-2 text-white active:opacity-60 transition-opacity"
          >
            <Bars3Icon className="w-7 h-7 stroke-[2.5px]" />
          </button>
        ) : (
          <div className="w-11" />
        )}
        
        <h1 className="text-white font-bold text-[18px] tracking-[0.15em] flex-1 text-center">
          {title}
        </h1>
        
        <div className="w-11" />
      </div>

      {/* ドロップダウンメニュー本体 */}
      {isOpen && (
        <div className="absolute left-0 top-16 w-48 bg-white shadow-xl rounded-br-lg border border-gray-100 py-2">
          <button 
            onClick={handleLogout}
            className="w-full text-left px-4 py-3 text-red-600 font-bold active:bg-gray-50"
          >
            ログアウト
          </button>
          {/* 必要であればここに「ホームへ」などの項目も追加可能 */}
        </div>
      )}
    </header>
  )
}