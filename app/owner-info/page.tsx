// @ts-nocheck
'use client'
import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import { UserCircleIcon, PhoneIcon, MapPinIcon, CheckIcon, PencilSquareIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function OwnerInfo() {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false) // 編集モードかどうか
  const [info, setInfo] = useState({ name: '', phone: '', address: '' })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchOwnerInfo() {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('owner_info')
        .select('*')
        .single()

      if (data) {
        setInfo({ name: data.name, phone: data.phone, address: data.address })
      }
      setLoading(false)
    }
    fetchOwnerInfo()
  }, [])

  const handleSave = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return alert('ログインが必要です')

    const { error } = await supabase
      .from('owner_info')
      .upsert({ 
        user_id: user.id, 
        name: info.name, 
        phone: info.phone, 
        address: info.address 
      })

    if (error) {
      alert('保存に失敗しました: ' + error.message)
    } else {
      setIsEditing(false) // 保存成功したら表示モードに戻る
      alert('飼い主情報を保存しました！')
    }
  }

  return (
    <div className="min-h-screen bg-[#FFFBFC] pb-24 font-medium text-gray-700">
      <Header title="飼い主情報" />
      <div className="px-6 py-8 space-y-6">
        
       {/* モード切替ボタンエリア */}
       <div className="flex justify-end pr-2">
          {isEditing ? (
            <button 
              onClick={() => setIsEditing(false)} 
              className="flex items-center gap-1 text-[11px] font-medium text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="w-3.5 h-3.5" /> キャンセル
            </button>
          ) : (
            <button 
              onClick={() => setIsEditing(true)} 
              className="flex items-center gap-1 text-[11px] font-medium text-gray-400 hover:text-pink-400 border border-gray-200 hover:border-pink-100 bg-white px-3 py-1 rounded-full transition-all shadow-sm"
            >
              <PencilSquareIcon className="w-3.5 h-3.5" /> 編集する
            </button>
          )}
        </div>
        <div className="flex flex-col items-center mb-4">
          <div className="w-24 h-24 bg-pink-50 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
            <UserCircleIcon className="w-16 h-16 text-[#FFB7C5]" />
          </div>
          {loading && <p className="text-[10px] text-gray-400 mt-2">読み込み中...</p>}
        </div>

        <div className="space-y-4">
          <InputGroup label="お名前" icon={<UserCircleIcon className="w-5 h-5" />}>
            {isEditing ? (
              <input 
                type="text" 
                className="input-field" 
                value={info.name || ''} 
                onChange={(e) => setInfo({...info, name: e.target.value})} 
                placeholder="あなたの名前" 
              />
            ) : (
              <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm min-h-[56px] flex items-center">
                <span className={info.name ? "text-gray-700" : "text-gray-300"}>
                  {info.name || '未設定'}
                </span>
              </div>
            )}
          </InputGroup>

          <InputGroup label="電話番号" icon={<PhoneIcon className="w-5 h-5" />}>
            {isEditing ? (
              <input 
                type="tel" 
                className="input-field" 
                value={info.phone || ''} 
                onChange={(e) => setInfo({...info, phone: e.target.value})} 
                placeholder="090-0000-0000" 
              />
            ) : (
              <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm min-h-[56px] flex items-center">
                <span className={info.phone ? "text-gray-700" : "text-gray-300"}>
                  {info.phone || '未設定'}
                </span>
              </div>
            )}
          </InputGroup>

          <InputGroup label="住所" icon={<MapPinIcon className="w-5 h-5" />}>
            {isEditing ? (
              <textarea 
                className="input-field min-h-[80px] py-3 resize-none" 
                value={info.address || ''} 
                onChange={(e) => setInfo({...info, address: e.target.value})} 
                placeholder="避難先や自宅の住所" 
              />
            ) : (
              <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm min-h-[80px] flex items-start">
                <span className={info.address ? "text-gray-700 whitespace-pre-wrap" : "text-gray-300"}>
                  {info.address || '未設定'}
                </span>
              </div>
            )}
          </InputGroup>
        </div>

        {/* 編集モードの時だけ注意書きと保存ボタンを表示 */}
        {isEditing && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex gap-2 px-2 text-[11px] text-gray-400 leading-relaxed">
              <span className="shrink-0">※</span>
              <p>
                この情報は緊急時にあなたが登録した代理人へ提示・送信されることを想定しています。個人情報の取り扱いには十分ご注意ください。
              </p>
            </div>
            
            <button 
              onClick={handleSave} 
              className="w-full btn-primary h-16 shadow-lg shadow-pink-100/50 flex items-center justify-center gap-2 transition-all"
            >
              <CheckIcon className="w-6 h-6" />
            保存する
            </button>
          </div>
        )}
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
