'use client'
import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/AuthProvider'
import Image from 'next/image'

function InviteInner() {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const [status, setStatus] = useState<'loading' | 'ready' | 'done' | 'error'>('loading')
  const [inviterName, setInviterName] = useState('')

  useEffect(() => {
    if (!token) { setStatus('error'); return }
    supabase
      .from('proxy_invitations')
      .select('inviter_user_id, accepted_at, moshimo_info(full_name)')
      .eq('token', token)
      .single()
      .then(({ data, error }) => {
        if (error || !data) { setStatus('error'); return }
        if (data.accepted_at) { setStatus('done'); return }
        setInviterName((data.moshimo_info as any)?.full_name ?? 'ユーザー')
        setStatus('ready')
      })
  }, [token])

  const handleAccept = async () => {
    if (!token) return
    if (!user) {
      router.push(`/auth?redirect=/invite?token=${token}`)
      return
    }
    const { data: inv } = await supabase
      .from('proxy_invitations')
      .select('inviter_user_id')
      .eq('token', token)
      .single()
    if (!inv) return

    await supabase
      .from('proxy_invitations')
      .update({ accepted_at: new Date().toISOString(), proxy_user_id: user.id })
      .eq('token', token)

    setStatus('done')
    setTimeout(() => router.push('/'), 2000)
  }

  if (status === 'loading') return (
    <div className="min-h-screen bg-[#FFFBFC] flex items-center justify-center">
      <p className="text-sm text-gray-400">読み込み中...</p>
    </div>
  )

  if (status === 'error') return (
    <div className="min-h-screen bg-[#FFFBFC] flex flex-col items-center justify-center px-8 text-center">
      <p className="text-sm text-gray-500 mb-6">招待リンクが無効または期限切れです。</p>
      <button onClick={() => router.push('/')} className="text-sm text-[#FFB7C5]">トップへ戻る</button>
    </div>
  )

  if (status === 'done') return (
    <div className="min-h-screen bg-[#FFFBFC] flex flex-col items-center justify-center px-8 text-center">
      <div className="w-16 h-16 rounded-full bg-pink-50 flex items-center justify-center mb-6">
        <svg viewBox="0 0 24 24" fill="none" stroke="#FFB7C5" strokeWidth={2} className="w-8 h-8">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </div>
      <h2 className="text-lg font-bold text-gray-700 mb-2">登録が完了しました</h2>
      <p className="text-sm text-gray-500">ホームへ移動します...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#FFFBFC] flex flex-col">
      <div className="bg-[#FFB7C5] px-6 pt-14 pb-8 text-center">
        <Image src="/logo.png" alt="もしも手帳" width={160} height={32} className="mx-auto mb-3" />
      </div>
      <div className="flex-1 flex flex-col px-8 pt-8 pb-10 text-center">
        <h1 className="text-xl font-bold text-gray-700 mb-3">
          {inviterName}さんから代理人の依頼が届いています
        </h1>
        <p className="text-sm text-gray-500 leading-relaxed mb-6">
          「ペットもしも手帳」は、飼い主に万が一のことがあった際にペットを守るためのアプリです。<br/><br/>
          飼い主が毎日記録をつけることで生存確認を行い、一定時間記録が途絶えた場合に代理人へ自動で通知が届きます。<br/><br/>
          {inviterName}さんのペットをもしもの時に助けてあげてください。
        </p>
        <div className="mt-auto space-y-3">
          <button
            onClick={handleAccept}
            className="w-full bg-[#FFB7C5] text-white font-bold py-4 rounded-2xl text-base"
          >
            {user ? '代理人として登録する' : '新規登録して代理人になる'}
          </button>
          {!user && (
            <button
              onClick={() => router.push(`/auth?redirect=/invite?token=${token}&mode=login`)}
              className="w-full text-sm text-gray-400 py-2"
            >
              すでにアカウントをお持ちの方はこちら
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function InvitePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FFFBFC]" />}>
      <InviteInner />
    </Suspense>
  )
}