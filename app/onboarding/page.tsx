'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/AuthProvider'
import Image from 'next/image'

const STEPS = ['welcome', 'pet', 'owner', 'moshimo', 'tutorial1', 'tutorial2', 'tutorial3', 'done'] as const
type Step = typeof STEPS[number]

const tutorialSlides = [
  {
    emoji: '📝',
    title: '毎日の記録をつけよう',
    desc: 'ホーム画面の「きょうの健康記録」から、ペットの様子を毎日記録しましょう。写真も一緒に残せます。',
    color: 'bg-pink-50',
  },
  {
    emoji: '📅',
    title: 'カレンダーで振り返ろう',
    desc: '記録した日はカレンダーにマークが付きます。過去の記録をいつでも確認できます。',
    color: 'bg-blue-50',
  },
  {
    emoji: '🖼️',
    title: '思い出フォトで写真を楽しもう',
    desc: '記録した写真は「思い出」にまとめて表示されます。大切な瞬間を振り返りましょう。',
    color: 'bg-yellow-50',
  },
]

export default function OnboardingPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [step, setStep] = useState<Step>('welcome')
  const [saving, setSaving] = useState(false)

  // ペット
  const [petName, setPetName] = useState('')
  const [petSpecies, setPetSpecies] = useState('')
  const [petFile, setPetFile] = useState<File | null>(null)
  const [petPreview, setPetPreview] = useState<string | null>(null)

  // 自分の情報
  const [fullName, setFullName] = useState('')
  const [address, setAddress] = useState('')
  const [keyLocation, setKeyLocation] = useState('')
  const [hospitalName, setHospitalName] = useState('')
  const [hospitalPhone, setHospitalPhone] = useState('')
  const [message, setMessage] = useState('')

  // 緊急連絡先
  const [proxyName, setProxyName] = useState('')
  const [proxyPhone, setProxyPhone] = useState('')
  const [proxyEmail, setProxyEmail] = useState('')

  const completeOnboarding = async () => {
    if (!user) return
    const { data: existing } = await supabase
      .from('moshimo_info')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (existing) {
      await supabase.from('moshimo_info')
        .update({ onboarding_completed: true })
        .eq('user_id', user.id)
    } else {
      await supabase.from('moshimo_info')
        .insert({ user_id: user.id, onboarding_completed: true })
    }
    router.push('/')
  }

  const handlePetSave = async () => {
    if (!petName) { setStep('owner'); return }
    if (!user) return
    setSaving(true)
    try {
      let image_url = null
      if (petFile) {
        const ext = petFile.name.split('.').pop()
        const path = `${user.id}/${Date.now()}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('pet-images').upload(path, petFile)
        if (!uploadError) {
          const { data } = supabase.storage.from('pet-images').getPublicUrl(path)
          image_url = data.publicUrl
        }
      }
      await supabase.from('my_pets').insert({
        user_id: user.id,
        name: petName,
        species: petSpecies || null,
        image_url,
      })
    } finally {
      setSaving(false)
      setStep('owner')
    }
  }

  const handleOwnerSave = async (skip = false) => {
    if (!user) return
    if (skip) { setStep('moshimo'); return }
    setSaving(true)
    try {
      const { data: existing } = await supabase
        .from('moshimo_info')
        .select('id')
        .eq('user_id', user.id)
        .single()

      const payload = {
        full_name: fullName || null,
        address: address || null,
        key_location: keyLocation || null,
        hospital_name: hospitalName || null,
        hospital_phone: hospitalPhone || null,
        message: message || null,
        user_id: user.id,
      }

      if (existing) {
        await supabase.from('moshimo_info').update(payload).eq('user_id', user.id)
      } else {
        await supabase.from('moshimo_info').insert(payload)
      }
    } finally {
      setSaving(false)
      setStep('moshimo')
    }
  }

  const handleMoshimoSave = async (skip = false) => {
    if (!user) return
    if (skip) { setStep('tutorial1'); return }
    setSaving(true)
    try {
      const { data: existing } = await supabase
        .from('moshimo_info')
        .select('id')
        .eq('user_id', user.id)
        .single()

      const payload = {
        proxy_name: proxyName || null,
        proxy_phone: proxyPhone || null,
        proxy_email: proxyEmail || null,
        user_id: user.id,
      }

      if (existing) {
        await supabase.from('moshimo_info').update(payload).eq('user_id', user.id)
      } else {
        await supabase.from('moshimo_info').insert(payload)
      }
    } finally {
      setSaving(false)
      setStep('tutorial1')
    }
  }

  const progressSteps: Step[] = ['pet', 'owner', 'moshimo']
  const currentProgressIndex = progressSteps.indexOf(step)

  return (
    <div className="min-h-screen bg-[#FFFBFC] flex flex-col">

      {/* プログレスバー */}
      {currentProgressIndex >= 0 && (
        <div className="flex gap-1.5 px-5 pt-5">
          {progressSteps.map((s, i) => (
            <div key={s} className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${
              i <= currentProgressIndex ? 'bg-[#FFB7C5]' : 'bg-gray-200'
            }`} />
          ))}
        </div>
      )}

      {/* ようこそ */}
      {step === 'welcome' && (
        <div className="flex flex-col items-center justify-center flex-1 px-8 text-center">
          <Image src="/logo.png" alt="もしも手帳" width={220} height={44} className="mb-6" priority />
          <Image src="/main.png" alt="猫" width={180} height={180} className="mb-8" />
          <h1 className="text-xl font-bold text-gray-700 mb-4">ようこそ！</h1>
          <p className="text-sm text-gray-500 leading-relaxed mb-3">
            このアプリは、飼い主に万が一のことがあった際に<strong>ペットを守るための備え</strong>です。
          </p>
          <p className="text-sm text-gray-500 leading-relaxed mb-10">
            毎日の健康記録を続けることで、24〜48時間以内に生存確認が取れなかった場合、登録した代理人へ自動的に情報が共有されます。
          </p>
          <button
            onClick={() => setStep('pet')}
            className="w-full bg-[#FFB7C5] text-white font-bold py-4 rounded-2xl text-base mb-3"
          >
            はじめる
          </button>
          <button onClick={completeOnboarding} className="text-sm text-gray-400 py-2">
            後でする
          </button>
        </div>
      )}

      {/* ペット登録 */}
      {step === 'pet' && (
        <div className="flex flex-col flex-1 px-5 pt-6 pb-10">
          <h2 className="text-xl font-bold text-gray-700 mb-1">うちの子を登録しよう</h2>
          <p className="text-sm text-gray-400 mb-6">あとで追加・編集できます</p>

          <div className="flex justify-center mb-5">
            <label className="cursor-pointer">
              <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-pink-100 bg-pink-50">
                {petPreview ? (
                  <img src={petPreview} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-1">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-8 h-8">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                      <circle cx="12" cy="13" r="4"/>
                    </svg>
                    <span className="text-xs">写真を追加</span>
                  </div>
                )}
              </div>
              <input type="file" accept="image/*" className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) { setPetFile(f); setPetPreview(URL.createObjectURL(f)) }
                }}
              />
            </label>
          </div>

          <div className="space-y-3">
            <div className="bg-white rounded-2xl border border-gray-100 px-4 py-3">
              <label className="text-xs text-gray-400 block mb-1">名前</label>
              <input
                type="text"
                value={petName}
                onChange={e => setPetName(e.target.value)}
                placeholder="しらす"
                className="w-full text-sm text-gray-700 bg-transparent focus:outline-none"
              />
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 px-4 py-3">
              <label className="text-xs text-gray-400 block mb-2">種類</label>
              <div className="flex gap-2">
                {['猫', '犬', 'その他'].map(s => (
                  <button key={s} onClick={() => setPetSpecies(s)}
                    className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      petSpecies === s ? 'bg-[#FFB7C5] border-[#FFB7C5] text-white' : 'bg-white border-gray-200 text-gray-500'
                    }`}
                  >{s}</button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-auto pt-8 space-y-3">
            <button onClick={handlePetSave} disabled={saving}
              className="w-full bg-[#FFB7C5] text-white font-bold py-4 rounded-2xl text-base disabled:opacity-50"
            >
              {saving ? '登録中...' : '次へ'}
            </button>
            <button onClick={() => setStep('owner')} className="w-full text-sm text-gray-400 py-2">
              後で登録する
            </button>
          </div>
        </div>
      )}

      {/* 自分の情報 */}
      {step === 'owner' && (
        <div className="flex flex-col flex-1 px-5 pt-6 pb-10">
          <h2 className="text-xl font-bold text-gray-700 mb-1">あなたの情報を登録しよう</h2>
          <p className="text-sm text-gray-400 mb-5">もしもの時に代理人が参照する情報です</p>

          <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50">
            {[
              { label: '氏名', value: fullName, set: setFullName, placeholder: '山田 花子', type: 'text' },
              { label: '住所', value: address, set: setAddress, placeholder: '東京都渋谷区...', type: 'text' },
              { label: '鍵の場所', value: keyLocation, set: setKeyLocation, placeholder: '玄関右の植木鉢の下', type: 'text' },
              { label: 'かかりつけ医', value: hospitalName, set: setHospitalName, placeholder: 'にじいろ動物病院', type: 'text' },
              { label: 'かかりつけ医の電話', value: hospitalPhone, set: setHospitalPhone, placeholder: '03-1234-5678', type: 'tel' },
            ].map(item => (
              <div key={item.label} className="px-4 py-3">
                <label className="text-xs text-gray-400 block mb-1">{item.label}</label>
                <input type={item.type} value={item.value} onChange={e => item.set(e.target.value)}
                  placeholder={item.placeholder}
                  className="w-full text-sm text-gray-700 bg-transparent focus:outline-none"
                />
              </div>
            ))}
            <div className="px-4 py-3">
              <label className="text-xs text-gray-400 block mb-1">緊急時のメッセージ</label>
              <textarea value={message} onChange={e => setMessage(e.target.value)}
                placeholder="ご飯は朝晩1回ずつ。優しく接してください。"
                rows={3}
                className="w-full text-sm text-gray-700 bg-transparent focus:outline-none resize-none"
              />
            </div>
          </div>

          <div className="mt-auto pt-6 space-y-3">
            <button onClick={() => handleOwnerSave(false)} disabled={saving}
              className="w-full bg-[#FFB7C5] text-white font-bold py-4 rounded-2xl text-base disabled:opacity-50"
            >
              {saving ? '保存中...' : '次へ'}
            </button>
            <button onClick={() => handleOwnerSave(true)} className="w-full text-sm text-gray-400 py-2">
              後で登録する
            </button>
          </div>
        </div>
      )}

      {/* 緊急連絡先 */}
      {step === 'moshimo' && (
        <div className="flex flex-col flex-1 px-5 pt-6 pb-10">
          <h2 className="text-xl font-bold text-gray-700 mb-1">緊急連絡先を登録しよう</h2>
          <p className="text-sm text-gray-400 mb-5">もしもの時に連絡する方の情報を登録してください</p>

          <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50">
            {[
              { label: '名前', value: proxyName, set: setProxyName, placeholder: '佐藤 太郎', type: 'text' },
              { label: '電話番号', value: proxyPhone, set: setProxyPhone, placeholder: '090-0000-0000', type: 'tel' },
              { label: 'メールアドレス', value: proxyEmail, set: setProxyEmail, placeholder: 'taro@example.com', type: 'email' },
            ].map(item => (
              <div key={item.label} className="px-4 py-3">
                <label className="text-xs text-gray-400 block mb-1">{item.label}</label>
                <input type={item.type} value={item.value} onChange={e => item.set(e.target.value)}
                  placeholder={item.placeholder}
                  className="w-full text-sm text-gray-700 bg-transparent focus:outline-none"
                />
              </div>
            ))}
          </div>

          <div className="mt-auto pt-6 space-y-3">
            <button onClick={() => handleMoshimoSave(false)} disabled={saving}
              className="w-full bg-[#FFB7C5] text-white font-bold py-4 rounded-2xl text-base disabled:opacity-50"
            >
              {saving ? '保存中...' : '次へ'}
            </button>
            <button onClick={() => handleMoshimoSave(true)} className="w-full text-sm text-gray-400 py-2">
              後で登録する
            </button>
          </div>
        </div>
      )}

      {/* チュートリアル1・2・3 */}
      {(step === 'tutorial1' || step === 'tutorial2' || step === 'tutorial3') && (() => {
        const index = step === 'tutorial1' ? 0 : step === 'tutorial2' ? 1 : 2
        const slide = tutorialSlides[index]
        const nextStep: Step = step === 'tutorial1' ? 'tutorial2' : step === 'tutorial2' ? 'tutorial3' : 'done'
        return (
          <div className={`flex flex-col items-center justify-center flex-1 px-8 text-center ${slide.color}`}>
            {/* ドット */}
            <div className="flex gap-2 mb-10">
              {tutorialSlides.map((_, i) => (
                <div key={i} className={`w-2 h-2 rounded-full transition-all ${i === index ? 'bg-[#FFB7C5] w-6' : 'bg-gray-300'}`} />
              ))}
            </div>

            <div className="text-8xl mb-8 animate-bounce">{slide.emoji}</div>
            <h2 className="text-xl font-bold text-gray-700 mb-4">{slide.title}</h2>
            <p className="text-sm text-gray-500 leading-relaxed mb-12">{slide.desc}</p>

            <button onClick={() => setStep(nextStep)}
              className="w-full bg-[#FFB7C5] text-white font-bold py-4 rounded-2xl text-base flex items-center justify-center gap-2"
            >
              {step === 'tutorial3' ? 'さっそく始める' : '次へ'}
              {step !== 'tutorial3' && (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-5 h-5">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              )}
            </button>
            <button onClick={completeOnboarding} className="text-sm text-gray-400 py-3 mt-2">
              スキップ
            </button>
          </div>
        )
      })()}

      {/* 完了 */}
      {step === 'done' && (
        <div className="flex flex-col items-center justify-center flex-1 px-8 text-center">
          <div className="text-7xl mb-6">🐾</div>
          <h2 className="text-xl font-bold text-gray-700 mb-4">準備完了！</h2>
          <p className="text-sm text-gray-500 leading-relaxed mb-10">
            毎日の記録が大切なペットを守ります。<br/>さっそく今日の記録をつけてみましょう！
          </p>
          <button onClick={completeOnboarding}
            className="w-full bg-[#FFB7C5] text-white font-bold py-4 rounded-2xl text-base"
          >
            はじめる 🐱
          </button>
        </div>
      )}
    </div>
  )
}