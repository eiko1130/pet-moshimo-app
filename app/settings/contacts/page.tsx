'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/AuthProvider'
import BottomNav from '@/components/BottomNav'
import type { EmergencyContact } from '@/types'

const EMPTY: Partial<EmergencyContact> = { name: '', relationship: '', phone: '', email: '', consent: false }

export default function ContactsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [contacts, setContacts] = useState<EmergencyContact[]>([])
  const [editing, setEditing] = useState<Partial<EmergencyContact>>(EMPTY)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [showInvite, setShowInvite] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteSending, setInviteSending] = useState(false)
  const [inviteMessage, setInviteMessage] = useState('')

  useEffect(() => {
    if (!user) return
    supabase
      .from('emergency_contacts')
      .select('*')
      .order('priority')
      .then(({ data }) => setContacts(data ?? []))
  }, [user])

  const set = (key: keyof EmergencyContact, value: any) =>
    setEditing(f => ({ ...f, [key]: value }))

  const handleSave = async () => {
    if (!user || !editing.name) {
      setMessage('名前を入力してください')
      return
    }
    setSaving(true)
    try {
      if (editingId) {
        const { error } = await supabase
          .from('emergency_contacts')
          .update({ ...editing })
          .eq('id', editingId)
        if (error) throw error
        setContacts(cs => cs.map(c => c.id === editingId ? { ...c, ...editing } as EmergencyContact : c))
      } else {
        const { data, error } = await supabase
          .from('emergency_contacts')
          .insert({ ...editing, user_id: user.id, priority: contacts.length + 1 })
          .select()
          .single()
        if (error) throw error
        setContacts(cs => [...cs, data])
        // メールアドレスがあれば招待バナーを表示
        if (editing.email) {
          setInviteEmail(editing.email)
          setShowInvite(true)
        }
      }
      setEditing(EMPTY)
      setEditingId(null)
      setMessage('保存しました！')
      setTimeout(() => setMessage(''), 2000)
    } catch (e: any) {
      setMessage(e.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    await supabase.from('emergency_contacts').delete().eq('id', id)
    setContacts(cs => cs.filter(c => c.id !== id))
  }

  const handleSendInvite = async () => {
    if (!user || !inviteEmail) return
    setInviteSending(true)
    try {
      const res = await fetch(
        'https://nukpisixfolbnzkvorym.supabase.co/functions/v1/send-invite',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            inviter_user_id: user.id,
            proxy_email: inviteEmail,
          }),
        }
      )
      if (!res.ok) throw new Error('送信に失敗しました')
      setInviteMessage('招待メールを送信しました！')
      setTimeout(() => {
        setShowInvite(false)
        setInviteMessage('')
      }, 2000)
    } catch (e: any) {
      setInviteMessage('送信に失敗しました')
    } finally {
      setInviteSending(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FFFBFC] pb-24">
      <header className="bg-[#FFB7C5] text-white flex items-center px-4 py-4 gap-3">
        <button onClick={() => router.back()}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-6 h-6">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <span className="text-lg font-bold">緊急連絡先の編集</span>
      </header>

      <p className="text-center text-xs text-gray-400 mt-4 mb-5 px-6">
        万が一の際、あなたのペットを託せる方の連絡先を入力してください。
      </p>

      {/* 招待バナー */}
      {showInvite && (
        <div className="mx-5 mb-4 bg-pink-50 border border-pink-200 rounded-2xl p-4">
          <p className="text-sm font-bold text-gray-700 mb-1">アプリの紹介を送りますか？</p>
          <p className="text-xs text-gray-500 leading-relaxed mb-3">
            相手もアプリをインストールすると、メールとアプリ両方で通知されるので見逃しにくくなります！
          </p>
          {inviteMessage ? (
            <p className="text-xs text-center text-green-500 font-bold">{inviteMessage}</p>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleSendInvite}
                disabled={inviteSending}
                className="flex-1 bg-[#FFB7C5] text-white text-sm font-bold py-2 rounded-xl disabled:opacity-50"
              >
                {inviteSending ? '送信中...' : '招待メールを送る'}
              </button>
              <button
                onClick={() => setShowInvite(false)}
                className="flex-1 bg-white border border-gray-200 text-gray-400 text-sm py-2 rounded-xl"
              >
                あとで
              </button>
            </div>
          )}
        </div>
      )}

      {/* 登録済み連絡先リスト */}
      {contacts.length > 0 && (
        <div className="px-5 mb-4 space-y-2">
          {contacts.map(contact => (
            <div key={contact.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center justify-between">
              <div>
                <p className="font-bold text-gray-700 text-sm">{contact.name}</p>
                {contact.relationship && <p className="text-xs text-gray-400">{contact.relationship}</p>}
                {contact.phone && <p className="text-xs text-gray-500">{contact.phone}</p>}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => { setEditing(contact); setEditingId(contact.id) }}
                  className="text-xs text-[#FFB7C5] border border-pink-200 px-2 py-1 rounded-lg"
                >
                  編集
                </button>
                <button
                  onClick={() => handleDelete(contact.id)}
                  className="text-xs text-gray-400 border border-gray-200 px-2 py-1 rounded-lg"
                >
                  削除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 編集フォーム */}
      <div className="mx-5 bg-white rounded-2xl border border-gray-100 p-4 space-y-4">
        <h3 className="text-sm font-bold text-gray-600">
          {editingId ? '連絡先を編集' : '連絡先を追加'}
        </h3>

        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-gray-400 text-sm">👤</span>
            <label className="text-xs text-gray-500">連絡先のお名前</label>
          </div>
          <input
            type="text"
            value={editing.name ?? ''}
            onChange={(e) => set('name', e.target.value)}
            placeholder="例：山田 花子"
            className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-pink-200"
          />
        </div>

        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-gray-400 text-sm">👥</span>
            <label className="text-xs text-gray-500">続柄・関係性</label>
          </div>
          <input
            type="text"
            value={editing.relationship ?? ''}
            onChange={(e) => set('relationship', e.target.value)}
            placeholder="例：姉、友人、ペットシッター"
            className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-pink-200"
          />
        </div>

        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-gray-400 text-sm">📞</span>
            <label className="text-xs text-gray-500">電話番号</label>
          </div>
          <input
            type="tel"
            value={editing.phone ?? ''}
            onChange={(e) => set('phone', e.target.value)}
            placeholder="090-0000-0000"
            className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-pink-200"
          />
        </div>

        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-gray-400 text-sm">✉️</span>
            <label className="text-xs text-gray-500">メールアドレス</label>
          </div>
          <input
            type="email"
            value={editing.email ?? ''}
            onChange={(e) => set('email', e.target.value)}
            placeholder="example@mail.com"
            className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-pink-200"
          />
        </div>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={editing.consent ?? false}
            onChange={(e) => set('consent', e.target.checked)}
            className="mt-0.5 accent-pink-400"
          />
          <span className="text-xs text-gray-500">
            この方に「緊急時の連絡先」として登録することを伝え、承諾を得ていますか？
          </span>
        </label>
      </div>

      <p className="text-xs text-gray-400 text-center mt-3 px-6">
        ℹ️ ご登録いただいた情報は、緊急時にのみ使用され、厳重に管理されます。
      </p>

      {message && (
        <p className={`text-xs text-center mt-2 ${message.includes('保存しました') ? 'text-green-500' : 'text-pink-400'}`}>
          {message}
        </p>
      )}

      <div className="px-5 mt-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-[#FFB7C5] text-white font-bold py-4 rounded-2xl text-sm disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {saving ? '保存中...' : (
            <>設定を保存する <span>✓</span></>
          )}
        </button>
        {editingId && (
          <button
            onClick={() => { setEditing(EMPTY); setEditingId(null) }}
            className="w-full mt-2 text-sm text-gray-400 py-2"
          >
            キャンセル
          </button>
        )}
      </div>

      <BottomNav />
    </div>
  )
}