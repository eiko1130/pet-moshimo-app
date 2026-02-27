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
  PencilSquareIcon,
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function EmergencyContacts() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [contacts, setContacts] = useState({
    proxyName: '',
    proxyEmail: '',
    proxyPhone: '',
    hospitalName: '',
    hospitalPhone: '',
    memo: ''
  })

  useEffect(() => {
    async function fetchContacts() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      const { data } = await supabase
        .from('emergency_contacts')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (data) {
        setContacts(data)
      }
      setLoading(false)
    }
    fetchContacts()
  }, [])

  const handleSave = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return alert('ログインが必要です')

    if (contacts.proxyEmail && !contacts.proxyEmail.includes('@')) {
      return alert('有効なメールアドレスを入力してください');
    }

    try {
      const { error } = await supabase
        .from('emergency_contacts')
        .upsert({
          user_id: user.id,
          proxyName: contacts.proxyName,
          proxyEmail: contacts.proxyEmail,
          proxyPhone: contacts.proxyPhone,
          hospitalName: contacts.hospitalName,
          hospitalPhone: contacts.hospitalPhone,
          memo: contacts.memo,
          updated_at: new Date()
        }, {
          onConflict: 'user_id'
        })

      if (error) throw error
      alert('緊急連絡先を保存しました');
      setIsEditing(false)
    } catch (e) {
      alert('保存に失敗しました: ' + e.message)
    }
  }

  if (loading) return <div className="min-h-screen bg-[#FFFBFC] flex items-center justify-center text-gray-400">読み込み中...</div>

  return (
    <div className="min-h-screen bg-[#FFFBFC] pb-24 font-medium text-gray-700">
      <Header title="緊急連絡先" />
      
      <div className="px-6 py-8 space-y-8">
        {/* 1. ワーニング（一番上） */}
        <div className="bg-amber-50 p-4 rounded-[24px] border border-amber-100 flex gap-3 shadow-sm shadow-amber-100/50">
          <ExclamationTriangleIcon className="w-6 h-6 text-amber-500 flex-shrink-0" />
          <p className="text-[11px] text-amber-700 font-bold leading-tight">
            24時間以内にアプリの操作がない場合、以下の代理人へ自動的に緊急メールが送信されます。
          </p>
        </div>

        <div className="space-y-6">
          <section className="space-y-4">
            {/* 2. 見出し ＋ 編集ボタン（横並び） */}
            <div className="flex items-center justify-between px-2">
              <h3 className="text-[10px] font-black text-pink-400 tracking-[0.2em] uppercase flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-pink-400 rounded-full"></span>
                緊急時の代理人
              </h3>
              <button 
                onClick={() => setIsEditing(!isEditing)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold transition-all ${
                  isEditing ? 'bg-gray-100 text-gray-500' : 'bg-pink-50 text-[#FFB7C5] border border-pink-100'
                }`}
              >
                {isEditing ? 'キャンセル' : <><PencilSquareIcon className="w-3.5 h-3.5" />編集</>}
              </button>
            </div>
            
            <div className="space-y-3">
              <InputField 
                icon={<UserIcon />} 
                value={contacts.proxyName} 
                placeholder="代理人の名前" 
                isEditing={isEditing} 
                onChange={(v) => setContacts({...contacts, proxyName: v})} 
              />
              <InputField 
                icon={<EnvelopeIcon />} 
                value={contacts.proxyEmail} 
                placeholder="通知先メールアドレス" 
                isEditing={isEditing} 
                onChange={(v) => setContacts({...contacts, proxyEmail: v})} 
              />
              <InputField 
                icon={<PhoneIcon />} 
                value={contacts.proxyPhone} 
                placeholder="代理人の電話番号" 
                isEditing={isEditing} 
                onChange={(v) => setContacts({...contacts, proxyPhone: v})} 
              />
            </div>
          </section>

          <section className="space-y-4 pt-4 border-t border-gray-100">
            <h3 className="text-[10px] font-black text-gray-300 tracking-[0.2em] uppercase ml-2">
              かかりつけ病院
            </h3>
            <InputField 
              icon={<BuildingOffice2Icon />} 
              value={contacts.hospitalName} 
              placeholder="病院名" 
              isEditing={isEditing} 
              onChange={(v) => setContacts({...contacts, hospitalName: v})} 
            />
          </section>
        </div>

        {isEditing && (
          <button 
            onClick={handleSave}
            className="w-full btn-primary h-16 shadow-lg shadow-pink-100/50 flex items-center justify-center gap-2 mt-8 animate-in fade-in slide-in-from-bottom-4"
          >
            <CheckIcon className="w-6 h-6" />
            設定を保存する
          </button>
        )}
      </div>
    </div>
  )
}

function InputField({ icon, value, placeholder, isEditing, onChange }) {
  return (
    <div className="relative">
      <div className="w-5 h-5 absolute left-4 top-4 text-gray-300">
        {icon}
      </div>
      {isEditing ? (
        <input 
          type="text" 
          placeholder={placeholder} 
          className="input-field pl-12"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <div className="input-field pl-12 flex items-center bg-gray-50/50 border-transparent text-gray-500">
          {value || <span className="text-gray-300 italic">未設定</span>}
        </div>
      )}
    </div>
  )
}