// @ts-nocheck
'use client'
import { useRouter, usePathname } from 'next/navigation'
import { 
  HomeIcon, 
  DocumentTextIcon, 
  CalendarIcon, 
  PhotoIcon // HeartIcon から PhotoIcon に変更
} from '@heroicons/react/24/outline'
import {
  HomeIcon as HomeIconSolid,
  DocumentTextIcon as DocumentTextIconSolid,
  CalendarIcon as CalendarIconSolid,
  PhotoIcon as PhotoIconSolid
} from '@heroicons/react/24/solid'

export default function BottomNavigation() {
  const router = useRouter()
  const pathname = usePathname()

  const navItems = [
    { 
      name: 'ホーム', 
      path: '/', 
      icon: HomeIcon, 
      activeIcon: HomeIconSolid 
    },
    { 
      name: '見守り記録', 
      path: '/record', 
      icon: DocumentTextIcon, 
      activeIcon: DocumentTextIconSolid 
    },
    { 
      name: 'カレンダー', 
      path: '/calendar', 
      icon: CalendarIcon, 
      activeIcon: CalendarIconSolid 
    },
    { 
      // 「うちの子」から「思い出（ギャラリー）」に変更
      name: '思い出', 
      path: '/gallery', 
      icon: PhotoIcon, 
      activeIcon: PhotoIconSolid 
    },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50 shadow-[0_-2px_10px_rgba(0,0,0,0.02)]">
      <div className="max-w-md mx-auto">
        <div className="flex justify-around items-center h-20 pb-4"> {/* 高さを少し調整してゆとりを */}
          {navItems.map((item) => {
            const isActive = pathname === item.path
            const Icon = isActive ? item.activeIcon : item.icon
            
            return (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
                className="flex flex-col items-center justify-center flex-1 py-2 group"
              >
                <div className={`p-1 rounded-xl transition-all ${isActive ? 'bg-pink-50' : 'bg-transparent'}`}>
                  <Icon 
                    className={`w-6 h-6 transition-colors ${
                      isActive ? 'text-[#FFB7C5]' : 'text-gray-300 group-hover:text-pink-200'
                    }`} 
                  />
                </div>
                <span 
                  className={`text-[10px] font-bold mt-1 tracking-tighter transition-colors ${
                    isActive ? 'text-[#FFB7C5]' : 'text-gray-300'
                  }`}
                >
                  {item.name}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}