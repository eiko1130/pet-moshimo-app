// @ts-nocheck
'use client'
import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import { 
  EnvelopeIcon, 
  PhoneIcon, 
  UserIcon, 
  BuildingOffice2Icon, 
  CheckIcon,
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'

export default function EmergencyContacts() {
  const router = useRouter()
  const [contacts, setContacts] = useState({
    proxyName: '',      // 代理人（守ってくれる人）の名前
    proxyEmail: '',     // 通知先メールアドレス
    proxyPhone: '',     // 連絡先電話番号
    hospitalName: '',
    hospitalPhone: '',
    memo: ''
  })

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('emergency_contacts') || '{}')
    setContacts(saved)
  }, [])

  const handleSave = () => {
    // メールアドレスの簡易チェック
    if (contacts.proxyEmail && !contacts.proxyEmail.includes('@')) {
      return alert('有効なメールアドレスを入力してください');
    }
    localStorage.setItem('emergency_contacts', JSON.stringify(contacts))
    alert('緊急連絡先を保存しました');
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-[#FFFBFC] pb-24 font-medium text-gray-700">
      <Header title="緊急連絡先" />
      
      <div className="px-6 py-8 space-y-8">
        {/* 重要アラート */}
        <div className="bg-amber-50 p-4 rounded-[24px] border border-amber-100 flex gap-3">
          <ExclamationTriangleIcon className="w-6 h-6 text-amber-500 flex-shrink-0" />
          <div>
            <p className="text-[11px] text-amber-700 font-bold leading-tight">
              24時間以内にアプリの操作がない場合、以下の「代理人」へ自動的に緊急メールが送信されます。
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* 代理人情報（最優先） */}
          <section className="space-y-4">
            <h3 className="text-[10px] font-black text-pink-400 tracking-[0.2em] uppercase ml-2 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-pink-400 rounded-full"></span>
              Proxy / 緊急時の代理人（通知先）
            </h3>
            
            <div className="space-y-3">
              <div className="relative">
                <UserIcon className="w-5 h-5 absolute left-4 top-4 text-gray-300" />
                <input 
                  type="text" 
                  placeholder="代理人の名前（例：佐藤 花子）" 
                  className="input-field pl-12"
                  value={contacts.proxyName}
                  onChange={(e) => setContacts({...contacts, proxyName: e.target.value})}
                />
              </div>
              <div className="relative">
                <EnvelopeIcon className="w-5 h-5 absolute left-4 top-4 text-gray-300" />
                <input 
                  type="email" 
                  placeholder="通知先メールアドレス" 
                  className="input-field pl-12"
                  value={contacts.proxyEmail}
                  onChange={(e) => setContacts({...contacts, proxyEmail: e.target.value})}
                />
              </div>
              <div className="relative">
                <PhoneIcon className="w-5 h-5 absolute left-4 top-4 text-gray-300" />
                <input 
                  type="tel" 
                  placeholder="代理人の電話番号" 
                  className="input-field pl-12"
                  value={contacts.proxyPhone}
                  onChange={(e) => setContacts({...contacts, proxyPhone: e.target.value})}
                />
              </div>
            </div>
          </section>

          {/* かかりつけ病院（サブ） */}
          <section className="space-y-4 pt-4 border-t border-gray-100">
            <h3 className="text-[10px] font-black text-gray-300 tracking-[0.2em] uppercase ml-2">
              Animal Hospital / かかりつけ病院
            </h3>
            
            <div className="space-y-3">
              <div className="relative">
                <BuildingOffice2Icon className="w-5 h-5 absolute left-4 top-4 text-gray-300" />
                <input 
                  type="text" 
                  placeholder="病院名" 
                  className="input-field pl-12"
                  value={contacts.hospitalName}
                  onChange={(e) => setContacts({...contacts, hospitalName: e.target.value})}
                />
              </div>
            </div>
          </section>
        </div>

        <button 
          onClick={handleSave}
          className="w-full btn-primary h-16 shadow-lg shadow-pink-100/50 flex items-center justify-center gap-2 mt-8"
        >
          <CheckIcon className="w-6 h-6" />
          設定を保存する
        </button>
      </div>
    </div>
  )
}