'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/AuthProvider'
import type { EmergencyContact } from '@/types'

export default function ContactDetailPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const [form, setForm] = useState<Partial<EmergencyContact>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!user || !id) return
    supabase
      .from('emergency_contacts')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data }) => {
        if (data) setForm(data)
        setLoading(false)
      })
  }, [user, id])

  const set = (key: string, value: any) => setForm(f => ({ ...f, [key]: value }))

  const handleSave = async () => {
    if (!form.name) { setError('名前を入力してください'); return }
    setSaving(true)
    try {
      const { error: err } = await supabase
        .from('emergency_contacts')
        .update({ ...form })
        .eq('id', id)
      if (err) throw err
      setMessage('保存しました')
      setTimeout(() => setMessage(''), 2000)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('この連絡先を削除しますか？')) return
    await supabase.from('emergency_contacts').delete().eq('id', id)
    router.push('/settings/contacts')
  }

  if (loading) return (
    <div className="min-h-screen bg-[#FFFBFC] flex items-center justify-center">
      <p className="text-sm text-gray-400">読み込み中...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#FFFBFC] pb-24">
      <header className="bg-[#FFB7C5] text-white flex items-center px-4 py-4 gap-3">
        <button onClick={() => router.back()}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-6 h-6">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <span className="text-lg font-bold">連絡先の詳細</span>
      </header>

      <div className="mx-5 mt-5 bg-white rounded-2xl border border-gray-100 p-4 space-y-4">
        <div>
          <label className="text-xs text-gray-400 block mb-1">お名前 <span className="text-pink-400">必須</span></label>
          <input
            type="text"
            value={form.name ?? ''}
            onChange={e => set('name', e.target.value)}
            className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-pink-200"
          />
        </div>
        <div>
          <label className="text-xs text-gray-400 block mb-1">続柄・関係性</label>
          <input
            type="text"
            value={form.relationship ?? ''}
            onChange={e => set('relationship', e.target.value)}
            className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-pink-200"
          />
        </div>
        <div>
          <label className="text-xs text-gray-400 block mb-1">電話番号</label>
          <input
            type="tel"
            value={form.phone ?? ''}
            onChange={e => set('phone', e.target.value)}
            className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-pink-200"
          />
        </div>
        <div>
          <label className="text-xs text-gray-400 block mb-1">メールアドレス</label>
          <input
            type="email"
            value={form.email ?? ''}
            onChange={e => set('email', e.target.value)}
            className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-pink-200"
          />
        </div>
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.consent ?? false}
            onChange={e => set('consent', e.target.checked)}
            className="mt-0.5 accent-pink-400"
          />
          <span className="text-xs text-gray-500">
            この方に「緊急時の連絡先」として登録することを伝え、承諾を得ていますか？
          </span>
        </label>
      </div>

      {error && <p className="text-xs text-pink-400 text-center mt-3">{error}</p>}
      {message && <p className="text-xs text-green-500 text-center mt-3">{message}</p>}

      <div className="px-5 mt-4 space-y-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-[#FFB7C5] text-white font-bold py-4 rounded-2xl text-sm disabled:opacity-50"
        >
          {saving ? '保存中...' : '保存する'}
        </button>
        <button
          onClick={handleDelete}
          className="w-full text-sm text-gray-400 border border-gray-200 py-3 rounded-2xl"
        >
          この連絡先を削除する
        </button>
      </div>
    </div>
  )
}