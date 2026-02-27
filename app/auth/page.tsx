// @ts-nocheck
'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function AuthPage() {
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  // メール＋パスワードでログイン
  const handleEmailAuth = async () => {
    setLoading(true)
    setMessage('')
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        router.push('/')
      } else {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setMessage('確認メールを送りました。メールを確認してください。')
      }
    } catch (error: any) {
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  // Googleでログイン
  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    })
    if (error) setMessage(error.message)
  }

  return (
    <div className="min-h-screen bg-[#FFFBFC] flex flex-col items-center justify-center px-6">
      
      {/* ロゴ */}
      <div className="mb-6">
        <Image src="/logo.png" alt="もしも手帳" width={240} height={48} priority />
      </div>

      <p className="text-gray-400 text-sm mb-8 tracking-wide">ペットの健康と緊急情報を管理する手帳</p>

      {/* カード */}
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-pink-50 p-6">
        
        {/* タブ切り替え */}
        <div className="flex mb-6 bg-gray-50 rounded-xl p-1">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
              isLogin ? 'bg-white text-[#FFB7C5] shadow-sm' : 'text-gray-400'
            }`}
          >
            ログイン
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
              !isLogin ? 'bg-white text-[#FFB7C5] shadow-sm' : 'text-gray-400'
            }`}
          >
            新規登録
          </button>
        </div>

        {/* メール入力 */}
        <div className="mb-3">
          <input
            type="email"
            placeholder="メールアドレス"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink-200 bg-gray-50"
          />
        </div>

        {/* パスワード入力 */}
        <div className="mb-4">
          <input
            type="password"
            placeholder="パスワード（6文字以上）"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink-200 bg-gray-50"
          />
        </div>

        {/* メッセージ */}
        {message && (
          <p className="text-xs text-center text-pink-400 mb-3">{message}</p>
        )}

        {/* メールログインボタン */}
        <button
          onClick={handleEmailAuth}
          disabled={loading}
          className="w-full bg-[#FFB7C5] text-white font-bold py-3 rounded-xl text-sm tracking-wide mb-4 disabled:opacity-50"
        >
          {loading ? '処理中...' : isLogin ? 'ログイン' : '新規登録'}
        </button>

        {/* 区切り線 */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-gray-100" />
          <span className="text-xs text-gray-300">または</span>
          <div className="flex-1 h-px bg-gray-100" />
        </div>

        {/* Googleログインボタン */}
        <button
          onClick={handleGoogleLogin}
          className="w-full border border-gray-200 bg-white text-gray-600 font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Googleでログイン
        </button>
      </div>
    </div>
  )
}
