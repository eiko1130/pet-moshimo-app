'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/AuthProvider'

const EMPTY = { name: '', relationship: '', phone: '', email: '', consent: false }

export default function ContactsNewPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [showInvite, setShowInvite] = useState(false)
  const [inviteSending, setInviteSending] = useState(false)
  const [inviteMessage, setInviteMessage] = useState('')

  const set = (key: string, value: any) => setForm(f => ({ ...f, [key]: value }))

  const handleSave = async () => {
    if (!user || !form.name) { setError('名前を入力してください'); return }
    setSaving(true)
    try {
      const { data: existing } = await supabase
        .from('emergency_contacts')
        .select('id')
        .eq('user_id', user.id)

      if ((existing ?? []).length >= 3) {
        setError('登録できる連絡先は最大3人までです')
        return
      }

      const { error: err } = await supabase
        .from('emergency_contacts')
        .insert({ ...form, user_id: user.id, priority: (existing ?? []).length + 1 })
      if (err) throw err

      if (form.email) {
        setShowInvite(true)
      } else {
        router.push('/settings/contacts')
      }
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const handleSendInvite = async () => {
    if (!user || !form.email) return
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
          body: JSON.stringify({ inviter_user_id: user.id, proxy_email: form.email }),
        }
      )
      if (!res.ok) throw new Error()
      setInviteMessage('招待メールを送信しました！')
      setTimeout(() => router.push('/settings/contacts'), 1500)
    } catch {
      setInviteMessage('送信に失敗しました')
    } finally {
      setInviteSending(false)
    }
  }

  if (showInvite) {
    return (
      <div className="min-h-screen bg-[#FFFBFC] flex flex-col">
        <header className="bg-[#FFB7C5] text-white flex items-center px-4 py-4 gap-3">
          <span className="text-lg font-bold">登録完了</span>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
          <div className="w-16 h-16 rounded-full bg-pink-50 flex items-center justify-center mb-6">
            <svg viewBox="0 0 24 24" fill="none" stroke="#FFB7C5" strokeWidth={2} className="w-8 h-8">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <h2 className="text-lg font-bold text-gray-700 mb-2">連絡先を登録しました</h2>
          <p className="text-sm text-gray-500 leading-relaxed mb-8">
            相手もアプリをインストールすると、メールとアプリ両方で通知されるので見逃しにくくなります。
          </p>
          {inviteMessage ? (
            <p className={`text-sm font-bold mb-4 ${inviteMessage.includes('失敗') ? 'text-pink-400' : 'text-green-500'}`}>
              {inviteMessage}
            </p>
          ) : (
            <div className="w-full space-y-3">
              <button
                onClick={handleSendInvite}
                disabled={inviteSending}
                className="w-full bg-[#FFB7C5] text-white font-bold py-4 rounded-2xl text-sm disabled:opacity-50"
              >
                {inviteSending ? '送信中...' : 'アプリの招待メールを送る'}
              </button>
              <button
                onClick={() => router.push('/settings/contacts')}
                className="w-full text-sm text-gray-400 py-2"
              >
                あとで
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FFFBFC] pb-24">
      <header className="bg-[#FFB7C5] text-white flex items-center px-4 py-4 gap-3">
        <button onClick={() => router.back()}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-6 h-6">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <span className="text-lg font-bold">連絡先を追加</span>
      </header>

      <div className="mx-5 mt-5 bg-white rounded-2xl border border-gray-100 p-4 space-y-4">
        <div>
          <label className="text-xs text-gray-400 block mb-1">お名前 <span className="text-pink-400">必須</span></label>
          <input
            type="text"
            value={form.name}
            onChange={e => set('name', e.target.value)}
            placeholder="例：山田 花子"
            className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-pink-200"
          />
        </div>
        <div>
          <label className="text-xs text-gray-400 block mb-1">続柄・関係性</label>
          <input
            type="text"
            value={form.relationship}
            onChange={e => set('relationship', e.target.value)}
            placeholder="例：姉、友人、ペットシッター"
            className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-pink-200"
          />
        </div>
        <div>
          <label className="text-xs text-gray-400 block mb-1">電話番号</label>
          <input
            type="tel"
            value={form.phone}
            onChange={e => set('phone', e.target.value)}
            placeholder="090-0000-0000"
            className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-pink-200"
          />
        </div>
        <div>
          <label className="text-xs text-gray-400 block mb-1">メールアドレス</label>
          <input
            type="email"
            value={form.email}
            onChange={e => set('email', e.target.value)}
            placeholder="example@mail.com"
            className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-pink-200"
          />
        </div>
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.consent}
            onChange={e => set('consent', e.target.checked)}
            className="mt-0.5 accent-pink-400"
          />
          <span className="text-xs text-gray-500">
            この方に「緊急時の連絡先」として登録することを伝え、承諾を得ていますか？
          </span>
        </label>
      </div>

      {error && <p className="text-xs text-pink-400 text-center mt-3">{error}</p>}

      <div className="px-5 mt-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-[#FFB7C5] text-white font-bold py-4 rounded-2xl text-sm disabled:opacity-50"
        >
          {saving ? '保存中...' : '保存する'}
        </button>
      </div>
    </div>
  )
}