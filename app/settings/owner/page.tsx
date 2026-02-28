'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/AuthProvider'
import BottomNav from '@/components/BottomNav'
import type { OwnerInfo } from '@/types'

export default function OwnerInfoPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [form, setForm] = useState<Partial<OwnerInfo>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!user) return
    supabase
      .from('owner_info')
      .select('*')
      .eq('user_id', user.id)
      .single()
      .then(({ data }) => {
        if (data) setForm(data)
        setLoading(false)
      })
  }, [user])

  const set = (key: keyof OwnerInfo, value: string) => setForm(f => ({ ...f, [key]: value }))

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    setMessage('')
    try {
      const { error } = await supabase
        .from('owner_info')
        .upsert({ ...form, user_id: user.id }, { onConflict: 'user_id' })
      if (error) throw error
      setMessage('保存しました！')
      setTimeout(() => setMessage(''), 2000)
    } catch (e: any) {
      setMessage(e.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-[#FFFBFC] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#FFB7C5] border-t-transparent rounded-full animate-spin" />
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
        <span className="text-lg font-bold">緊急情報の編集</span>
      </header>

      {/* イラスト */}
      <div className="flex justify-center gap-6 py-5 text-5xl">
        <span>🐩</span><span>🐱</span><span>🐶</span>
      </div>
      <p className="text-center text-sm font-bold text-gray-600 mb-1">かかりつけ医・保険情報</p>
      <p className="text-center text-xs text-gray-400 mb-5">大切なペットのための緊急連絡先を登録しましょう</p>

      <div className="px-5 space-y-4">
        {/* かかりつけ動物病院 */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-red-400">🏥</span>
            <span className="text-sm font-bold text-gray-600">かかりつけの動物病院</span>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">病院名</label>
              <input
                type="text"
                value={form.vet_name ?? ''}
                onChange={(e) => set('vet_name', e.target.value)}
                placeholder="例：ひまわり動物病院"
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-pink-200"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">電話番号</label>
              <input
                type="tel"
                value={form.vet_phone ?? ''}
                onChange={(e) => set('vet_phone', e.target.value)}
                placeholder="03-0000-0000"
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-pink-200"
              />
            </div>
          </div>
        </div>

        {/* ペット保険情報 */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-blue-400">📋</span>
            <span className="text-sm font-bold text-gray-600">ペット保険情報</span>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">保険会社名</label>
              <input
                type="text"
                value={form.insurance_company ?? ''}
                onChange={(e) => set('insurance_company', e.target.value)}
                placeholder="例：○○ペット保険"
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-pink-200"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">証券番号</label>
              <input
                type="text"
                value={form.insurance_number ?? ''}
                onChange={(e) => set('insurance_number', e.target.value)}
                placeholder="A123456789"
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-pink-200"
              />
            </div>
          </div>
        </div>

        {/* ワクチン接種記録 */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-green-400">💉</span>
            <span className="text-sm font-bold text-gray-600">最新のワクチン接種記録</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">接種日</label>
              <input
                type="date"
                value={form.vaccine_date ?? ''}
                onChange={(e) => set('vaccine_date', e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-pink-200"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">ワクチンの種類</label>
              <select
                value={form.vaccine_type ?? ''}
                onChange={(e) => set('vaccine_type', e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-pink-200"
              >
                <option value="">選択</option>
                <option value="混合ワクチン">混合ワクチン</option>
                <option value="狂犬病">狂犬病</option>
                <option value="3種混合">3種混合</option>
                <option value="5種混合">5種混合</option>
              </select>
            </div>
          </div>
        </div>

        {/* 住所・緊急メッセージ */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-orange-400">🏠</span>
            <span className="text-sm font-bold text-gray-600">飼い主情報</span>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">氏名</label>
              <input
                type="text"
                value={form.full_name ?? ''}
                onChange={(e) => set('full_name', e.target.value)}
                placeholder="例：山田 花子"
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-pink-200"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">住所</label>
              <input
                type="text"
                value={form.address ?? ''}
                onChange={(e) => set('address', e.target.value)}
                placeholder="例：東京都渋谷区..."
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-pink-200"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">鍵の場所</label>
              <input
                type="text"
                value={form.key_location ?? ''}
                onChange={(e) => set('key_location', e.target.value)}
                placeholder="例：玄関マットの下"
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-pink-200"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">緊急メッセージ</label>
              <textarea
                value={form.emergency_msg ?? ''}
                onChange={(e) => set('emergency_msg', e.target.value)}
                placeholder="もしもの時に伝えたいこと"
                rows={3}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-pink-200 resize-none"
              />
            </div>
          </div>
        </div>

        {message && (
          <p className={`text-xs text-center ${message.includes('保存しました') ? 'text-green-500' : 'text-pink-400'}`}>
            {message}
          </p>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-[#FFB7C5] text-white font-bold py-4 rounded-2xl text-sm disabled:opacity-50"
        >
          {saving ? '保存中...' : '内容を保存する'}
        </button>
        <p className="text-center text-xs text-gray-400 pb-2">情報はいつでも変更可能です</p>
      </div>

      <BottomNav />
    </div>
  )
}
