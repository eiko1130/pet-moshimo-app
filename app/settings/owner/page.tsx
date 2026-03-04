'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/AuthProvider'

export default function MoshimoInfoPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [form, setForm] = useState({
    full_name: '',
    address: '',
    key_location: '',
    hospital_name: '',
    hospital_phone: '',
    message: '',
    proxy_name: '',
    proxy_phone: '',
    proxy_email: '',
    alert_enabled: false,
    alert_hours: 24,
  })

  useEffect(() => {
    if (!user) return
    supabase
      .from('moshimo_info')
      .select('*')
      .eq('user_id', user.id)
      .single()
      .then(({ data }) => {
        if (data) setForm({
          full_name: data.full_name ?? '',
          address: data.address ?? '',
          key_location: data.key_location ?? '',
          hospital_name: data.hospital_name ?? '',
          hospital_phone: data.hospital_phone ?? '',
          message: data.message ?? '',
          proxy_name: data.proxy_name ?? '',
          proxy_phone: data.proxy_phone ?? '',
          proxy_email: data.proxy_email ?? '',
          alert_enabled: data.alert_enabled ?? false,
          alert_hours: data.alert_hours ?? 24,
        })
        setLoading(false)
      })
  }, [user])

  const set = (key: string, value: string | boolean | number) =>
    setForm(f => ({ ...f, [key]: value }))

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    try {
      const { data: existing } = await supabase
        .from('moshimo_info')
        .select('id')
        .eq('user_id', user.id)
        .single()

      const payload = { ...form, user_id: user.id, updated_at: new Date().toISOString() }

      if (existing) {
        await supabase.from('moshimo_info').update(payload).eq('user_id', user.id)
      } else {
        await supabase.from('moshimo_info').insert(payload)
      }
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
    <div className="min-h-screen bg-[#FFFBFC] pb-10">
      <header className="bg-[#FFB7C5] text-white flex items-center justify-between px-4 py-4">
        <button onClick={() => router.back()}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-6 h-6">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <span className="font-bold">もしもの時のために</span>
        <div className="w-6" />
      </header>

      <div className="mx-5 mt-5 bg-pink-50 rounded-2xl p-4">
        <p className="text-xs text-gray-500 leading-relaxed">
          🐾 もし私に何かあったとき、このページの情報をもとにペットのお世話をお願いします。緊急連絡先に登録した方に情報が共有されます。
        </p>
      </div>

      <div className="px-5 py-4 space-y-5">

        {/* 私について */}
        <section>
          <h2 className="text-sm font-bold text-[#FFB7C5] mb-3 flex items-center gap-2">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            私について
          </h2>
          <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50">
            {[
              { label: '氏名', key: 'full_name', placeholder: '山田 花子' },
              { label: '住所', key: 'address', placeholder: '東京都渋谷区...' },
              { label: '鍵の場所', key: 'key_location', placeholder: '玄関右の植木鉢の下' },
            ].map(item => (
              <div key={item.key} className="px-4 py-3">
                <label className="text-xs text-gray-400 block mb-1">{item.label}</label>
                <input
                  type="text"
                  value={form[item.key as keyof typeof form] as string}
                  onChange={e => set(item.key, e.target.value)}
                  placeholder={item.placeholder}
                  className="w-full text-sm text-gray-700 bg-transparent focus:outline-none"
                />
              </div>
            ))}
          </div>
        </section>

        {/* ペットについて */}
        <section>
          <h2 className="text-sm font-bold text-[#FFB7C5] mb-3 flex items-center gap-2">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            ペットについて
          </h2>
          <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50">
            {[
              { label: 'かかりつけ医', key: 'hospital_name', placeholder: 'にじいろ動物病院' },
              { label: 'かかりつけ医の電話番号', key: 'hospital_phone', placeholder: '03-1234-5678' },
            ].map(item => (
              <div key={item.key} className="px-4 py-3">
                <label className="text-xs text-gray-400 block mb-1">{item.label}</label>
                <input
                  type="text"
                  value={form[item.key as keyof typeof form] as string}
                  onChange={e => set(item.key, e.target.value)}
                  placeholder={item.placeholder}
                  className="w-full text-sm text-gray-700 bg-transparent focus:outline-none"
                />
              </div>
            ))}
            <div className="px-4 py-3">
              <label className="text-xs text-gray-400 block mb-1">緊急時のメッセージ</label>
              <textarea
                value={form.message}
                onChange={e => set('message', e.target.value)}
                placeholder="ご飯は朝晩1回ずつ。ビビりなので優しく接してください。"
                rows={3}
                className="w-full text-sm text-gray-700 bg-transparent focus:outline-none resize-none"
              />
            </div>
          </div>
        </section>

        {/* 緊急連絡先 */}
        <section>
          <h2 className="text-sm font-bold text-[#FFB7C5] mb-3 flex items-center gap-2">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.99 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.92 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
            緊急連絡先
          </h2>
          <p className="text-xs text-gray-400 mb-2">もしもの時に連絡する方の情報を登録してください。</p>
          <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50">
            {[
              { label: '名前', key: 'proxy_name', placeholder: '佐藤 太郎', type: 'text' },
              { label: '電話番号', key: 'proxy_phone', placeholder: '090-0000-0000', type: 'tel' },
              { label: 'メールアドレス', key: 'proxy_email', placeholder: 'taro@example.com', type: 'email' },
            ].map(item => (
              <div key={item.key} className="px-4 py-3">
                <label className="text-xs text-gray-400 block mb-1">{item.label}</label>
                <input
                  type={item.type}
                  value={form[item.key as keyof typeof form] as string}
                  onChange={e => set(item.key, e.target.value)}
                  placeholder={item.placeholder}
                  className="w-full text-sm text-gray-700 bg-transparent focus:outline-none"
                />
              </div>
            ))}
          </div>
        </section>

        {/* アラート設定 */}
        <section>
          <h2 className="text-sm font-bold text-[#FFB7C5] mb-3 flex items-center gap-2">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            緊急アラート設定
          </h2>
          <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50">
            {/* オン/オフ */}
            <div className="px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-700 font-medium">アラートを有効にする</p>
                <p className="text-xs text-gray-400 mt-0.5">一定時間記録がない場合に緊急連絡先へメールを送信</p>
              </div>
              <button
                onClick={() => set('alert_enabled', !form.alert_enabled)}
                className={`w-12 h-6 rounded-full transition-all relative shrink-0 ml-3 ${
                  form.alert_enabled ? 'bg-[#FFB7C5]' : 'bg-gray-200'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow absolute top-0.5 transition-all ${
                  form.alert_enabled ? 'left-6' : 'left-0.5'
                }`} />
              </button>
            </div>

            {/* 時間選択 */}
            {form.alert_enabled && (
              <div className="px-4 py-3">
                <p className="text-sm text-gray-700 font-medium mb-2">アラートを送るまでの時間</p>
                <div className="flex gap-3">
                  {[24, 48].map(h => (
                    <button
                      key={h}
                      onClick={() => set('alert_hours', h)}
                      className={`flex-1 py-3 rounded-xl border-2 text-sm font-bold transition-all ${
                        form.alert_hours === h
                          ? 'bg-[#FFB7C5] border-[#FFB7C5] text-white'
                          : 'bg-white border-gray-100 text-gray-400'
                      }`}
                    >
                      {h}時間
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  最後の記録から{form.alert_hours}時間以上更新がない場合、{form.proxy_name || '緊急連絡先'}へメールを送信します
                </p>
              </div>
            )}
          </div>
        </section>

        {message && (
          <p className={`text-xs text-center ${message.includes('保存') ? 'text-green-500' : 'text-pink-400'}`}>
            {message}
          </p>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-[#FFB7C5] text-white font-bold py-4 rounded-2xl text-base disabled:opacity-50"
        >
          {saving ? '保存中...' : '保存する'}
        </button>
      </div>
    </div>
  )
}