// @ts-nocheck
'use client'
import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import { UserCircleIcon, PhoneIcon, MapPinIcon, CheckIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'

export default function OwnerInfo() {
  const router = useRouter()
  const [info, setInfo] = useState({ name: '', phone: '', address: '', memo: '' })

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('owner_info') || '{}')
    setInfo(saved)
  }, [])

  const handleSave = () => {
    localStorage.setItem('owner_info', JSON.stringify(info))
    alert('飼い主情報を保存しました')
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-[#FFFBFC] pb-24 font-medium text-gray-700">
      <Header title="飼い主情報" />
      <div className="px-6 py-8 space-y-6">
        
        <div className="flex flex-col items-center mb-4">
          <div className="w-24 h-24 bg-pink-50 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
            <UserCircleIcon className="w-16 h-16 text-[#FFB7C5]" />
          </div>
        </div>

        <div className="space-y-4">
          <InputGroup label="お名前" icon={<UserCircleIcon className="w-5 h-5" />}>
            <input 
              type="text" 
              className="input-field" 
              value={info.name} 
              onChange={(e) => setInfo({...info, name: e.target.value})} 
              placeholder="あなたの名前" 
            />
          </InputGroup>

          <InputGroup label="電話番号" icon={<PhoneIcon className="w-5 h-5" />}>
            <input 
              type="tel" 
              className="input-field" 
              value={info.phone} 
              onChange={(e) => setInfo({...info, phone: e.target.value})} 
              placeholder="090-0000-0000" 
            />
          </InputGroup>

          <InputGroup label="住所" icon={<MapPinIcon className="w-5 h-5" />}>
            <textarea 
              className="input-field min-h-[80px] py-3 resize-none" 
              value={info.address} 
              onChange={(e) => setInfo({...info, address: e.target.value})} 
              placeholder="避難先や自宅の住所" 
            />
          </InputGroup>
        </div>

        <button onClick={handleSave} className="w-full btn-primary h-16 shadow-lg shadow-pink-100/50 flex items-center justify-center gap-2">
          <CheckIcon className="w-6 h-6" />
          情報を保存する
        </button>
      </div>
    </div>
  )
}

function InputGroup({ label, icon, children }) {
  return (
    <div>
      <label className="text-[10px] font-bold text-gray-400 tracking-widest uppercase ml-2 mb-1 flex items-center gap-1">
        {icon} {label}
      </label>
      {children}
    </div>
  )
}