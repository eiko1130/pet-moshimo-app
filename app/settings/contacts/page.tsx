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

  useEffect(() => {
    if (!user) return
    supabase
      .from('emergency_contacts')
      .select('*')
      .eq('user_id', user.id)
      .order('priority')
      .then(({ data }) => {
        setContacts(data ?? [])
        setLoading(false)
      })
  }, [user])

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