'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/AuthProvider'
import BottomNav from '@/components/BottomNav'
import type { EmergencyContact } from '@/types'

export default function ContactsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [contacts, setContacts] = useState<EmergencyContact[]>([])
  const [loading, setLoading] = useState(true)
  const [displayId, setDisplayId] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!user) return
    Promise.all([
      supabase
        .from('emergency_contacts')
        .select('*')
        .eq('user_id', user.id)
        .order('priority'),
      supabase
        .from('moshimo_info')
        .select('display_id')
        .eq('user_id', user.id)
        .single()
    ]).then(([contactsRes, infoRes]) => {
      setContacts(contactsRes.data ?? [])
      setDisplayId(infoRes.data?.display_id ?? null)
      setLoading(false)
    })
  }, [user])

  const handleCopy = () => {
    if (!displayId) return
    navigator.clipboard.writeText(displayId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-[#FFFBFC] pb-24">
      <header className="bg-[#FFB7C5] text-white flex items-center px-4 py-4 gap-3">
        <button onClick={() => router.back()}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-6 h-6">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <span className="text-lg font-bold">緊急連絡先</span>
      </header>

      {/* あなたのID */}
      {displayId && (
        <div className="mx-5 mt-5 bg-white rounded-2xl border border-gray-100 p-4">
          <p className="text-xs text-gray-400 mb-2">あなたのID</p>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-gray-700 tracking-widest">{displayId}</span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-xs text-[#FFB7C5] border border-pink-200 px-3 py-1.5 rounded-lg"
            >
              {copied ? (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-3.5 h-3.5">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  コピーしました
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                  </svg>
                  コピー
                </>
              )}
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2">代理人に伝えて連絡先登録時に入力してもらいましょう</p>
        </div>
      )}

      <p className="text-center text-xs text-gray-400 mt-4 mb-5 px-6">
        万が一の際、あなたのペットを託せる方を最大3人まで登録できます。
      </p>

      <div className="px-5 space-y-3">
        {loading ? (
          <p className="text-center text-sm text-gray-400 py-8">読み込み中...</p>
        ) : (
          <>
            {contacts.map((contact, index) => (
              <button
                key={contact.id}
                onClick={() => router.push(`/settings/contacts/${contact.id}`)}
                className="w-full bg-white rounded-2xl border border-gray-100 p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-pink-50 flex items-center justify-center text-[#FFB7C5] font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-gray-700 text-sm">{contact.name}</p>
                    {contact.relationship && <p className="text-xs text-gray-400">{contact.relationship}</p>}
                  </div>
                </div>
                <svg viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth={2} className="w-5 h-5">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </button>
            ))}

            {contacts.length < 3 && (
              <button
                onClick={() => router.push('/settings/contacts/new')}
                className="w-full bg-white rounded-2xl border-2 border-dashed border-pink-200 p-4 flex items-center justify-center gap-2 text-[#FFB7C5] text-sm font-bold"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-5 h-5">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                連絡先を追加
              </button>
            )}

            {contacts.length === 0 && (
              <p className="text-center text-xs text-gray-400 py-4">
                まだ登録されていません
              </p>
            )}
          </>
        )}
      </div>

      <BottomNav />
    </div>
  )
}