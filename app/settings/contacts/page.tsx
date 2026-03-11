'use client'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/AuthProvider'
import BottomNav from '@/components/BottomNav'
import type { EmergencyContact } from '@/types'
import QRCode from 'qrcode'

export default function ContactsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [contacts, setContacts] = useState<EmergencyContact[]>([])
  const [loading, setLoading] = useState(true)
  const [displayId, setDisplayId] = useState<string | null>(null)
  const [showIdModal, setShowIdModal] = useState(false)
  const [showQrModal, setShowQrModal] = useState(false)
  const [copied, setCopied] = useState(false)
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

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

  const handleOpenQr = async () => {
    if (!displayId) return
    const url = await QRCode.toDataURL(displayId, { width: 300, margin: 2 })
    setQrDataUrl(url)
    setShowQrModal(true)
  }

  const handleSaveQr = () => {
    if (!qrDataUrl) return
    const a = document.createElement('a')
    a.href = qrDataUrl
    a.download = `moshimo-id-${displayId}.png`
    a.click()
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

      {/* 説明バナー */}
      <div className="mx-5 mt-5 bg-pink-50 rounded-2xl p-4">
        <p className="text-xs text-gray-600 leading-relaxed mb-3">
          相手もアプリをインストールしていれば、メールとアプリのダブル通知で安心。登録時に相手のIDを入力するか、紹介してインストールしてもらうだけです。
        </p>
        {displayId && (
          <div className="flex gap-2">
            <button
              onClick={() => setShowIdModal(true)}
              className="flex-1 flex items-center justify-center gap-1.5 bg-white border border-pink-200 text-[#FFB7C5] text-xs font-bold py-2 rounded-xl"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
              </svg>
              あなたのID
            </button>
            <button
              onClick={handleOpenQr}
              className="flex-1 flex items-center justify-center gap-1.5 bg-white border border-pink-200 text-[#FFB7C5] text-xs font-bold py-2 rounded-xl"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
                <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/>
                <path d="M14 14h3v3h-3zM17 17h3v3h-3zM14 20h3"/>
              </svg>
              紹介QRコード
            </button>
          </div>
        )}
      </div>

      <p className="text-center text-xs text-gray-400 mt-4 mb-3 px-6">
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

      {/* IDモーダル */}
      {showIdModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-8">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <p className="text-sm font-bold text-gray-700 mb-1">あなたのID</p>
            <p className="text-xs text-gray-400 mb-4">代理人に伝えて、連絡先登録時に入力してもらいましょう</p>
            <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 mb-4">
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
            <button
              onClick={() => setShowIdModal(false)}
              className="w-full text-sm text-gray-400 py-2"
            >
              閉じる
            </button>
          </div>
        </div>
      )}

      {/* QRモーダル */}
      {showQrModal && qrDataUrl && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-8">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm text-center">
            <p className="text-sm font-bold text-gray-700 mb-1">紹介QRコード</p>
            <p className="text-xs text-gray-400 mb-4">このQRコードをスキャンしてもらうとあなたのIDが伝わります</p>
            <img src={qrDataUrl} alt="QRコード" className="mx-auto mb-4 rounded-xl" />
            <button
              onClick={handleSaveQr}
              className="w-full bg-[#FFB7C5] text-white font-bold py-3 rounded-2xl text-sm mb-2"
            >
              画像として保存
            </button>
            <button
              onClick={() => setShowQrModal(false)}
              className="w-full text-sm text-gray-400 py-2"
            >
              閉じる
            </button>
          </div>
        </div>
      )}
    </div>
  )
}