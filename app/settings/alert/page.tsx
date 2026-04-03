'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/AuthProvider'

export default function AlertSettingPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [alertEnabled, setAlertEnabled] = useState(false)
  const [alertHours, setAlertHours] = useState(48)
  const [proxyName, setProxyName] = useState('')

  useEffect(() => {
    if (!user) return
    supabase
      .from('moshimo_info')
      .select('alert_enabled, alert_hours, proxy_name')
      .eq('user_id', user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setAlertEnabled(data.alert_enabled ?? false)
          setAlertHours(data.alert_hours ?? 48)
          setProxyName(data.proxy_name ?? '')
        }
        setLoading(false)
      })
  }, [user])

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    try {
      await supabase
        .from('moshimo_info')
        .update({ alert_enabled: alertEnabled, alert_hours: alertHours })
        .eq('user_id', user.id)
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
        <span className="font-bold">アラート設定</span>
        <div className="w-6" />
      </header>

      <div className="mx-5 mt-5 bg-pink-50 rounded-2xl p-4">
        <p className="text-xs text-gray-500 leading-relaxed">
          一定時間「今日も元気！」の記録がない場合、緊急連絡先に登録した方へ自動でメールを送信します。
        </p>
      </div>

      <div className="px-5 py-4 space-y-4">
        <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50">

          {/* オン/オフ */}
          <div className="px-4 py-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">アラートを有効にする</p>
              <p className="text-xs text-gray-400 mt-0.5">記録が途絶えたら緊急連絡先へメール送信</p>
            </div>
            <button
              onClick={() => setAlertEnabled(v => !v)}
              className={`w-12 h-6 rounded-full transition-all relative shrink-0 ml-3 ${
                alertEnabled ? 'bg-[#FFB7C5]' : 'bg-gray-200'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow absolute top-0.5 transition-all ${
                alertEnabled ? 'left-6' : 'left-0.5'
              }`} />
            </button>
          </div>

          {/* 時間選択 */}
          {alertEnabled && (
            <div className="px-4 py-4">
              <p className="text-sm font-medium text-gray-700 mb-3">アラートを送るまでの時間</p>
              <div className="flex gap-3">
                {[24, 48, 72].map(h => (
                  <button
                    key={h}
                    onClick={() => setAlertHours(h)}
                    className={`flex-1 py-3 rounded-xl border-2 text-sm font-bold transition-all ${
                      alertHours === h
                        ? 'bg-[#FFB7C5] border-[#FFB7C5] text-white'
                        : 'bg-white border-gray-100 text-gray-400'
                    }`}
                  >
                    {h}時間
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-3">
                最後の記録から{alertHours}時間以上更新がない場合、
                {proxyName ? `「${proxyName}」` : '緊急連絡先'}へメールを送信します
              </p>
            </div>
          )}
        </div>

        {!alertEnabled && (
          <div className="bg-yellow-50 border border-yellow-100 rounded-2xl px-4 py-3">
            <p className="text-xs text-yellow-600">
              アラートがオフになっています。万が一の時のためにオンにすることをおすすめします。
            </p>
          </div>
        )}

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