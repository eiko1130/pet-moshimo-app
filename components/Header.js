'use client'
import { Bars3Icon } from '@heroicons/react/24/outline'

export default function Header({ title, showMenu = true }) {
  return (
    // グラデーションは一切なし！
    <header className="bg-[#FF9A93] sticky top-0 z-50 shadow-sm">
      <div className="flex items-center justify-between px-4 h-16">
        {showMenu ? (
          <button className="p-2 text-white active:opacity-60 transition-opacity">
            <Bars3Icon className="w-7 h-7 stroke-[2.5px]" /> {/* 三本線を白く、少し太くして視認性アップ */}
          </button>
        ) : (
          <div className="w-11" />
        )}
        
        {/* タイトルも白。洗練された印象にするため字間を広めに設定 */}
        <h1 className="text-white font-bold text-[18px] tracking-[0.15em] flex-1 text-center">
          {title}
        </h1>
        
        {showMenu ? <div className="w-11" /> : <div className="w-11" />}
      </div>
    </header>
  )
}