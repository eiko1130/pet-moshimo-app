// @ts-nocheck
'use client'
import Header from '@/components/Header'
import Image from 'next/image'
import Link from 'next/link'
import { HomeIcon, ShieldExclamationIcon, HeartIcon } from '@heroicons/react/24/outline'

export default function Home() {
  return (
    <div className="min-h-screen bg-[#FFFBFC] pb-24 font-medium">
      <Header title="" showMenu={true} />
      
      <div className="px-6 py-8 flex flex-col items-center">
        
        {/* ロゴエリア */}
        <div className="mt-4 mb-0 flex justify-center">
          <Image 
            src="/logo.png" 
            alt="もしも手帳"
            width={300} 
            height={60}
            priority
          />
        </div>
        
        {/* メインビジュアル */}
        <div className="w-60 h-44 relative mb-2">
          <Image 
            src="/main.png" 
            alt="メインイラスト"
            fill
            className="object-contain"
          />
        </div>

        {/* 1. きょうの健康記録 */}
        <Link href="/record" className="w-full mb-10">
          <button className="btn-primary w-full gap-3 py-5 shadow-lg shadow-pink-100/50 flex items-center justify-center">
            <HeartIcon className="w-6 h-6" /> 
            <span className="tracking-[0.2em] font-bold text-[16px]">きょうの健康記録</span>
          </button>
        </Link>

        {/* 2. サブメニュー：3つ並びに変更 */}
        <div className="w-full grid grid-cols-3 gap-4 px-2">
          <SubMenuButton 
            href="/owner-info" 
            icon={<HomeIcon className="w-7 h-7 text-[#FFB7C5] stroke-[1.5px]" />} 
            label="飼い主情報" 
          />
          <SubMenuButton 
            href="/pets" 
            icon={<HeartIcon className="w-7 h-7 text-[#FFB7C5] stroke-[1.5px]" />} 
            label="ペット情報" 
          />
          <SubMenuButton 
            href="/emergency-contacts" 
            icon={<ShieldExclamationIcon className="w-7 h-7 text-[#FFB7C5] stroke-[1.5px]" />} 
            label="緊急連絡先" 
          />
        </div>
      </div>
    </div>
  )
}

function SubMenuButton({ href, icon, label }) {
  return (
    <Link href={href} className="flex flex-col items-center gap-3 group">
      <div className="w-16 h-16 bg-white border border-pink-50 rounded-full flex items-center justify-center shadow-sm group-active:scale-95 transition-all">
        {icon}
      </div>
      <span className="text-[10px] font-bold text-gray-400 tracking-tighter text-center whitespace-nowrap">
        {label}
      </span>
    </Link>
  )
}