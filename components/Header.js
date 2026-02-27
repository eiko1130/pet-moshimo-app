// @ts-nocheck
'use client'
import { useState } from 'react'
import { Bars3Icon, XMarkIcon, ArrowLeftOnRectangleIcon, UserCircleIcon, HomeIcon } from '@heroicons/react/24/outline'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Header({ title, showMenu = true }) {
  const [isOpen, setIsOpen] = useState(false) // メニューが開いているかどうかの状態
  const router = useRouter()

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      alert('ログアウトに失敗しました: ' + error.message)
    } else {
      // メニューを閉じてトップページへ移動
      setIsOpen(false)
      router.push('/') 
      // ログアウト後は middleware や top ページの useEffect が検知して
      // 自動的にログインフォームが表示されるはずです
    }
  }

  return (
    <>
      <header className="bg-[#FF9A93] sticky top-0 z-50 shadow-sm">
        <div className="flex items-center justify-between px-4 h-16">
          {showMenu ? (
            <button 
              onClick={() => setIsOpen(true)} // クリックでメニューを開く
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
      </header>

      {/* --- サイドメニュー（ドロワー） --- */}
      {/* 背景のオーバーレイ */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-[60] animate-in fade-in duration-300"
          onClick={() => setIsOpen(false)} // 背景クリックで閉じる
        />
      )}

      {/* メニュー本体 */}
      <div className={`fixed top-0 left-0 h-full w-[280px] bg-white z-[70] shadow-2xl transform transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* メニュー上部：閉じるボタン */}
          <div className="p-4 flex justify-end">
            <button onClick={() => setIsOpen(false)} className="p-2 text-gray-400">
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* メニュー項目 */}
          <nav className="flex-1 px-4 py-2 space-y-2">
            <MenuLink href="/" icon={<HomeIcon className="w-5 h-5" />} label="ホーム" onClick={() => setIsOpen(false)} />
            <MenuLink href="/owner" icon={<UserCircleIcon className="w-5 h-5" />} label="飼い主情報" onClick={() => setIsOpen(false)} />
          </nav>

          {/* メニュー下部：ログアウト */}
          <div className="p-4 border-t border-gray-100 mb-8">
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-4 text-gray-500 hover:bg-red-50 hover:text-red-500 rounded-xl transition-all"
            >
              <ArrowLeftOnRectangleIcon className="w-5 h-5" />
              <span className="font-bold text-sm">ログアウト</span>
            </button>
            <p className="text-[10px] text-gray-300 text-center mt-4 uppercase tracking-widest">
              Pet Emergency App v1.0
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

function MenuLink({ href, icon, label, onClick }) {
  return (
    <Link 
      href={href} 
      onClick={onClick}
      className="flex items-center gap-4 px-4 py-4 text-gray-600 hover:bg-pink-50 rounded-xl transition-all font-medium"
    >
      <span className="text-gray-400">{icon}</span>
      {label}
    </Link>
  )
}