'use client'
import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/AuthProvider'
import Image from 'next/image'

const STEPS_OWNER = ['welcome', 'mode', 'pet', 'owner', 'alert', 'tutorial1', 'tutorial2', 'tutorial3', 'tutorial4', 'done'] as const
const STEPS_WATCHER = ['welcome', 'mode', 'watcher_tutorial1', 'watcher_tutorial2', 'watcher_tutorial3', 'watcher_tutorial4', 'watcher_register', 'watcher_done'] as const
type Step = typeof STEPS_OWNER[number] | typeof STEPS_WATCHER[number]

const tutorialSlides = [
  {
    image: '/tutorial-record.png',
    image2: '/tutorial-record2.png',
    title: '毎日の記録をつけよう',
    desc: '「見守り記録」からペットのごきげんと写真を毎日記録しましょう。ペットを選んで、ごきげんを選んで、提出するだけ！',
    color: 'bg-pink-50',
  },
  {
    image: '/tutorial-calendar.png',
    title: 'カレンダーで振り返ろう',
    desc: '記録した日はカレンダーにピンクのドットが付きます。日付をタップするとその日の記録が確認できます。',
    color: 'bg-blue-50',
  },
  {
    image: '/tutorial-gallery.png',
    title: '思い出フォトで写真を楽しもう',
    desc: '記録した写真は「思い出」にまとめて表示されます。ペット名で絞り込みもできます。',
    color: 'bg-yellow-50',
  },
  {
    image: '/tutorial-homeadd.gif',
    title: 'ホーム画面に追加しよう',
    desc: 'Safariの共有ボタンから「ホーム画面に追加」でアプリのように使えます。毎日開きやすくなります！',
    color: 'bg-green-50',
  },
]

const watcherSlides = (inviterName: string) => [
  {
    title: 'あなたが必要とされています',
    desc: `${inviterName}があなたを信頼して、このアプリに登録しました。大切な人からの、小さくて大事な頼み事です。`,
    color: 'bg-pink-50',
    icon: (
      <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center mx-auto mb-6 shadow-sm">
        <svg viewBox="0 0 24 24" fill="none" stroke="#FFB7C5" strokeWidth={1.5} className="w-12 h-12">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
      </div>
    ),
  },
  {
    title: 'このアプリの仕組み',
    desc: `${inviterName}は毎日このアプリで記録をつけています。もし記録が一定時間途絶えたら、あなたにメールが届きます。それだけです。`,
    color: 'bg-blue-50',
    icon: (
      <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center mx-auto mb-6 shadow-sm">
        <svg viewBox="0 0 24 24" fill="none" stroke="#FFB7C5" strokeWidth={1.5} className="w-12 h-12">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6.13 6.13l1.27-.87a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
        </svg>
      </div>
    ),
  },
  {
    title: 'あなたが最初の砦です',
    desc: `万が一の時、最初に気づけるのはあなたかもしれません。通知が届いたら、まず${inviterName}に連絡を取ってみてください。あなたの一報が、大きな助けになります。`,
    color: 'bg-yellow-50',
    icon: (
      <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center mx-auto mb-6 shadow-sm">
        <svg viewBox="0 0 24 24" fill="none" stroke="#FFB7C5" strokeWidth={1.5} className="w-12 h-12">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
      </div>
    ),
  },
  {
    title: '通知はこんな時だけ',
    desc: `通知が届くのは、記録が一定時間途絶えた時と、アプリの重要なお知らせのみ。日常的に通知が来ることはありません。`,
    color: 'bg-green-50',
    icon: (
      <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center mx-auto mb-6 shadow-sm">
        <svg viewBox="0 0 24 24" fill="none" stroke="#FFB7C5" strokeWidth={1.5} className="w-12 h-12">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
      </div>
    ),
  },
]

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FFFBFC]" />}>
      <OnboardingInner />
    </Suspense>
  )
}

function OnboardingInner() {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const isTutorialMode = searchParams.get('mode') === 'tutorial'
  const inviterNameParam = searchParams.get('inviter') ?? '飼い主さん'

  const [step, setStep] = useState<Step>(isTutorialMode ? 'tutorial1' : 'welcome')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // 飼い主モード
  const [petName, setPetName] = useState('')
  const [petSpecies, setPetSpecies] = useState('')
  const [petFile, setPetFile] = useState<File | null>(null)
  const [petPreview, setPetPreview] = useState<string | null>(null)
  const [fullName, setFullName] = useState('')
  const [address, setAddress] = useState('')
  const [alertEnabled, setAlertEnabled] = useState(false)
  const [alertHours, setAlertHours] = useState<24 | 48>(24)
  const [proxyEmail, setProxyEmail] = useState('')

  // 見守るモード
  const [watcherName, setWatcherName] = useState('')

  const inviterName = inviterNameParam

  const completeOnboarding = async () => {
    if (!user) return
    const generateId = () => String(Math.floor(10000 + Math.random() * 90000))
    const { data: existing } = await supabase
      .from('moshimo_info')
      .select('id, display_id')
      .eq('user_id', user.id)
      .single()
    if (existing) {
      const updates: any = { onboarding_completed: true }
      if (!existing.display_id) updates.display_id = generateId()
      await supabase.from('moshimo_info').update(updates).eq('user_id', user.id)
    } else {
      await supabase.from('moshimo_info').insert({
        user_id: user.id,
        onboarding_completed: true,
        display_id: generateId()
      })
    }
    router.push('/')
  }

  const completeWatcherOnboarding = async () => {
    if (!user || !watcherName) { setError('名前を入力してください'); return }
    setSaving(true)
    try {
      const { data: existing } = await supabase
        .from('moshimo_info')
        .select('id')
        .eq('user_id', user.id)
        .single()
      const payload = {
        user_id: user.id,
        full_name: watcherName,
        is_watcher: true,
        onboarding_completed: true,
      }
      if (existing) {
        await supabase.from('moshimo_info').update(payload).eq('user_id', user.id)
      } else {
        await supabase.from('moshimo_info').insert(payload)
      }
      setStep('watcher_done')
    } finally {
      setSaving(false)
    }
  }

  const handlePetSave = async () => {
    if (!petName) { setError('名前を入力してください'); return }
    setError('')
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

  const handleOwnerSave = async () => {
    if (!fullName) { setError('氏名を入力してください'); return }
    if (!address) { setError('住所を入力してください'); return }
    setError('')
    if (!user) return
    setSaving(true)
    try {
      const { data: existing } = await supabase
        .from('moshimo_info')
        .select('id')
        .eq('user_id', user.id)
        .single()
      const payload = { full_name: fullName, address: address, user_id: user.id }
      if (existing) {
        await supabase.from('moshimo_info').update(payload).eq('user_id', user.id)
      } else {
        await supabase.from('moshimo_info').insert(payload)
      }
    } finally {
      setSaving(false)
      setStep('alert')
    }
  }

  const handleAlertSave = async () => {
    if (alertEnabled && !proxyEmail) {
      setError('アラートをオンにする場合はメールアドレスを入力してください')
      return
    }
    setError('')
    if (!user) return
    setSaving(true)
    try {
      const { data: existing } = await supabase
        .from('moshimo_info')
        .select('id')
        .eq('user_id', user.id)
        .single()
      const payload = {
        alert_enabled: alertEnabled,
        alert_hours: alertHours,
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

  const progressSteps = ['pet', 'owner', 'alert'] as Step[]
  const currentProgressIndex = progressSteps.indexOf(step)
  const tutorialSteps = ['tutorial1', 'tutorial2', 'tutorial3', 'tutorial4'] as Step[]
  const isTutorial = tutorialSteps.includes(step)
  const tutorialIndex = tutorialSteps.indexOf(step)
  const watcherTutorialSteps = ['watcher_tutorial1', 'watcher_tutorial2', 'watcher_tutorial3', 'watcher_tutorial4'] as Step[]
  const isWatcherTutorial = watcherTutorialSteps.includes(step)
  const watcherTutorialIndex = watcherTutorialSteps.indexOf(step)
  const watcherSlideList = watcherSlides(inviterName)

  return (
    <div className="min-h-screen bg-[#FFFBFC] flex flex-col">
      {currentProgressIndex >= 0 && (
        <div className="flex gap-1.5 px-5 pt-5">
          {progressSteps.map((s, i) => (
            <div key={s} className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${
              i <= currentProgressIndex ? 'bg-[#FFB7C5]' : 'bg-gray-200'
            }`} />
          ))}
        </div>
      )}

      {step === 'welcome' && (
        <div className="flex flex-col items-center justify-center flex-1 px-8 text-center">
          <Image src="/logo.png" alt="もしも手帳" width={220} height={44} className="mb-6" priority />
          <Image src="/main.png" alt="ペット" width={180} height={180} className="mb-8" />
          <h1 className="text-xl font-bold text-gray-700 mb-4">ようこそ！</h1>
          <p className="text-sm text-gray-500 leading-relaxed mb-3">
            このアプリは、飼い主に万が一のことがあった際に<strong>ペットを守るための備え</strong>です。
          </p>
          <p className="text-sm text-gray-500 leading-relaxed mb-10">
            毎日の健康記録を続けることで、24〜48時間以内に生存確認が取れなかった場合、登録した代理人へ自動的に情報が共有されます。
          </p>
          <button onClick={() => setStep('mode')}
            className="w-full bg-[#FFB7C5] text-white font-bold py-4 rounded-2xl text-base">
            次へ
          </button>
        </div>
      )}

      {step === 'mode' && (
        <div className="flex flex-col flex-1 px-5 pt-8 pb-10">
          <h2 className="text-xl font-bold text-gray-700 mb-2 text-center">どちらのモードで使いますか？</h2>
          <p className="text-xs text-gray-400 text-center mb-8">設定は後から変更できます</p>
          <div className="space-y-4">
            <button
              onClick={() => setStep('pet')}
              className="w-full bg-white border-2 border-pink-200 rounded-2xl p-5 text-left"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-pink-50 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#FFB7C5" strokeWidth={2} className="w-5 h-5">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                    <polyline points="9 22 9 12 15 12 15 22"/>
                  </svg>
                </div>
                <span className="font-bold text-gray-700">飼い主モード</span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed ml-13">
                毎日の記録で、ペットの未来を守る
              </p>
              <p className="text-xs text-gray-400 leading-relaxed mt-1">
                自分に万が一のことがあった時に備えて、毎日記録をつける方はこちら
              </p>
            </button>

            <button
              onClick={() => setStep('watcher_tutorial1')}
              className="w-full bg-white border-2 border-gray-200 rounded-2xl p-5 text-left"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth={2} className="w-5 h-5">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                </div>
                <span className="font-bold text-gray-700">見守るモード</span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                もしもの時に、あなたが頼りです
              </p>
              <p className="text-xs text-gray-400 leading-relaxed mt-1">
                飼い主から頼まれた方・通知を受け取るだけでいい方はこちら
              </p>
            </button>
          </div>
          <p className="text-xs text-gray-400 text-center mt-6 px-4">
            わからない場合はまず飼い主モードを選択してください
          </p>
        </div>
      )}

      {step === 'pet' && (
        <div className="flex flex-col flex-1 px-5 pt-6 pb-10">
          <h2 className="text-xl font-bold text-gray-700 mb-1">うちの子を登録しよう</h2>
          <p className="text-sm text-gray-400 mb-6">2匹目以降は後から追加できます</p>
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
              <label className="text-xs text-gray-400 block mb-1">名前 <span className="text-pink-400">必須</span></label>
              <input type="text" value={petName} onChange={e => { setPetName(e.target.value); setError('') }}
                placeholder="しらす"
                className="w-full text-sm text-gray-700 bg-transparent focus:outline-none" />
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 px-4 py-3">
              <label className="text-xs text-gray-400 block mb-2">種類</label>
              <div className="flex gap-2">
                {['猫', '犬', 'その他'].map(s => (
                  <button key={s} onClick={() => setPetSpecies(s)}
                    className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      petSpecies === s ? 'bg-[#FFB7C5] border-[#FFB7C5] text-white' : 'bg-white border-gray-200 text-gray-500'
                    }`}>{s}</button>
                ))}
              </div>
            </div>
          </div>
          {error && <p className="text-xs text-pink-400 text-center mt-3">{error}</p>}
          <div className="mt-auto pt-8">
            <button onClick={handlePetSave} disabled={saving}
              className="w-full bg-[#FFB7C5] text-white font-bold py-4 rounded-2xl text-base disabled:opacity-50">
              {saving ? '登録中...' : '次へ'}
            </button>
          </div>
        </div>
      )}

      {step === 'owner' && (
        <div className="flex flex-col flex-1 px-5 pt-6 pb-10">
          <h2 className="text-xl font-bold text-gray-700 mb-1">あなたの情報を登録しよう</h2>
          <p className="text-sm text-gray-400 mb-5">もしもの時に代理人が参照する情報です</p>
          <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50">
            <div className="px-4 py-3">
              <label className="text-xs text-gray-400 block mb-1">氏名 <span className="text-pink-400">必須</span></label>
              <input type="text" value={fullName} onChange={e => { setFullName(e.target.value); setError('') }}
                placeholder="山田 花子"
                className="w-full text-sm text-gray-700 bg-transparent focus:outline-none" />
            </div>
            <div className="px-4 py-3">
              <label className="text-xs text-gray-400 block mb-1">住所 <span className="text-pink-400">必須</span></label>
              <input type="text" value={address} onChange={e => { setAddress(e.target.value); setError('') }}
                placeholder="東京都渋谷区..."
                className="w-full text-sm text-gray-700 bg-transparent focus:outline-none" />
            </div>
          </div>
          {error && <p className="text-xs text-pink-400 text-center mt-3">{error}</p>}
          <div className="mt-auto pt-6">
            <button onClick={handleOwnerSave} disabled={saving}
              className="w-full bg-[#FFB7C5] text-white font-bold py-4 rounded-2xl text-base disabled:opacity-50">
              {saving ? '保存中...' : '次へ'}
            </button>
          </div>
        </div>
      )}

      {step === 'alert' && (
        <div className="flex flex-col flex-1 px-5 pt-6 pb-10">
          <h2 className="text-xl font-bold text-gray-700 mb-1">緊急時のアラート設定</h2>
          <p className="text-sm text-gray-400 mb-6">もしもの時に備えた自動メール通知の設定です</p>
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-4">
              <p className="text-sm text-gray-600 mb-3">
                このアプリのペット記録が
                <span className="text-[#FFB7C5] font-bold mx-1">{alertHours}時間</span>
                押されなかった場合、緊急連絡先にメールが届きます。
              </p>
              <div className="flex gap-3">
                {([24, 48] as const).map(h => (
                  <button key={h} onClick={() => setAlertHours(h)}
                    className={`flex-1 py-3 rounded-xl border-2 text-sm font-bold transition-all ${
                      alertHours === h ? 'bg-[#FFB7C5] border-[#FFB7C5] text-white' : 'bg-white border-gray-200 text-gray-500'
                    }`}>
                    {h}時間
                  </button>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-gray-600">アラートを有効にする</span>
                <button onClick={() => { setAlertEnabled(!alertEnabled); setError('') }}
                  className={`relative w-12 h-6 rounded-full transition-colors ${alertEnabled ? 'bg-[#FFB7C5]' : 'bg-gray-200'}`}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${alertEnabled ? 'translate-x-7' : 'translate-x-1'}`} />
                </button>
              </div>
              {alertEnabled && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <label className="text-xs text-gray-400 block mb-1">緊急連絡先のメールアドレス <span className="text-pink-400">必須</span></label>
                  <input type="email" value={proxyEmail} onChange={e => { setProxyEmail(e.target.value); setError('') }}
                    placeholder="taro@example.com"
                    className="w-full text-sm text-gray-700 bg-gray-50 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-pink-200" />
                </div>
              )}
            </div>
            <p className="text-xs text-gray-400 text-center px-4">
              ※後から設定を変更することが可能です
            </p>
          </div>
          {error && <p className="text-xs text-pink-400 text-center mt-3">{error}</p>}
          <div className="mt-auto pt-6">
            <button onClick={handleAlertSave} disabled={saving}
              className="w-full bg-[#FFB7C5] text-white font-bold py-4 rounded-2xl text-base disabled:opacity-50">
              {saving ? '保存中...' : '次へ'}
            </button>
          </div>
        </div>
      )}

      {isTutorial && (() => {
        const slide = tutorialSlides[tutorialIndex]
        const nextStep = tutorialSteps[tutorialIndex + 1] ?? 'done' as Step
        const isLast = tutorialIndex === tutorialSlides.length - 1
        return (
          <div className={`flex flex-col flex-1 ${slide.color}`}>
            <div className="flex justify-center gap-2 pt-6 pb-4">
              {tutorialSlides.map((_, i) => (
                <div key={i} className={`h-2 rounded-full transition-all duration-300 ${
                  i === tutorialIndex ? 'bg-[#FFB7C5] w-6' : 'bg-gray-300 w-2'
                }`} />
              ))}
            </div>
            <div className="flex justify-center gap-2 px-4 flex-1 items-center">
              {'image2' in slide && slide.image2 ? (
                <>
                  <img src={slide.image} alt="" className="w-[47%] rounded-2xl shadow-md object-cover object-top max-h-72" />
                  <img src={(slide as any).image2} alt="" className="w-[47%] rounded-2xl shadow-md object-cover object-top max-h-72" />
                </>
              ) : (
                <img src={slide.image} alt="" className="w-[95%] rounded-2xl shadow-md object-contain" />
              )}
            </div>
            <div className="px-8 pt-5 pb-8 text-center">
              <h2 className="text-lg font-bold text-gray-700 mb-2">{slide.title}</h2>
              <p className="text-sm text-gray-500 leading-relaxed mb-8">{slide.desc}</p>
              <button onClick={() => setStep(nextStep)}
                className="w-full bg-[#FFB7C5] text-white font-bold py-4 rounded-2xl text-base flex items-center justify-center gap-2">
                {isLast ? 'さっそく始める' : '次へ'}
                {!isLast && (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-5 h-5">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                )}
              </button>
            </div>
          </div>
        )
      })()}

      {isWatcherTutorial && (() => {
        const slide = watcherSlideList[watcherTutorialIndex]
        const nextStep = watcherTutorialSteps[watcherTutorialIndex + 1] ?? 'watcher_register' as Step
        const isLast = watcherTutorialIndex === watcherSlideList.length - 1
        return (
          <div className={`flex flex-col flex-1 ${slide.color}`}>
            <div className="flex justify-center gap-2 pt-6 pb-4">
              {watcherSlideList.map((_, i) => (
                <div key={i} className={`h-2 rounded-full transition-all duration-300 ${
                  i === watcherTutorialIndex ? 'bg-[#FFB7C5] w-6' : 'bg-gray-300 w-2'
                }`} />
              ))}
            </div>
            <div className="flex flex-col flex-1 items-center justify-center px-8 text-center">
              {slide.icon}
              <h2 className="text-lg font-bold text-gray-700 mb-3">{slide.title}</h2>
              <p className="text-sm text-gray-500 leading-relaxed">{slide.desc}</p>
            </div>
            <div className="px-8 pb-8">
              <button onClick={() => setStep(nextStep)}
                className="w-full bg-[#FFB7C5] text-white font-bold py-4 rounded-2xl text-base flex items-center justify-center gap-2">
                {isLast ? '登録へ進む' : '次へ'}
                {!isLast && (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-5 h-5">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                )}
              </button>
            </div>
          </div>
        )
      })()}

      {step === 'watcher_register' && (
        <div className="flex flex-col flex-1 px-5 pt-8 pb-10">
          <h2 className="text-xl font-bold text-gray-700 mb-1">あなたの名前を教えてください</h2>
          <p className="text-sm text-gray-400 mb-6">飼い主に通知される名前です</p>
          <div className="bg-white rounded-2xl border border-gray-100 px-4 py-3">
            <label className="text-xs text-gray-400 block mb-1">名前 <span className="text-pink-400">必須</span></label>
            <input
              type="text"
              value={watcherName}
              onChange={e => { setWatcherName(e.target.value); setError('') }}
              placeholder="山田 太郎"
              className="w-full text-sm text-gray-700 bg-transparent focus:outline-none"
            />
          </div>
          {error && <p className="text-xs text-pink-400 text-center mt-3">{error}</p>}
          <div className="mt-auto pt-6">
            <button onClick={completeWatcherOnboarding} disabled={saving}
              className="w-full bg-[#FFB7C5] text-white font-bold py-4 rounded-2xl text-base disabled:opacity-50">
              {saving ? '登録中...' : '登録する'}
            </button>
          </div>
        </div>
      )}

      {step === 'watcher_done' && (
        <div className="flex flex-col items-center justify-center flex-1 px-8 text-center">
          <div className="w-20 h-20 rounded-full bg-pink-50 flex items-center justify-center mb-6">
            <svg viewBox="0 0 24 24" fill="none" stroke="#FFB7C5" strokeWidth={2} className="w-10 h-10">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-700 mb-4">登録完了！</h2>
          <p className="text-sm text-gray-500 leading-relaxed mb-10">
            ありがとうございます。<br/>
            もしもの時はメールでお知らせします。<br/>
            それまでは何もしなくて大丈夫です。
          </p>
          <button onClick={() => router.push('/')}
            className="w-full bg-[#FFB7C5] text-white font-bold py-4 rounded-2xl text-base">
            ホームへ
          </button>
        </div>
      )}

      {step === 'done' && (
        <div className="flex flex-col items-center justify-center flex-1 px-8 text-center">
          <div className="w-20 h-20 rounded-full bg-pink-50 flex items-center justify-center mb-6">
            <svg viewBox="0 0 24 24" fill="none" stroke="#FFB7C5" strokeWidth={2} className="w-10 h-10">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-700 mb-4">準備完了！</h2>
          <p className="text-sm text-gray-500 leading-relaxed mb-10">
            毎日の記録が大切なペットを守ります。<br/>さっそく今日の記録をつけてみましょう！
          </p>
          <button onClick={completeOnboarding}
            className="w-full bg-[#FFB7C5] text-white font-bold py-4 rounded-2xl text-base">
            はじめる
          </button>
        </div>
      )}
    </div>
  )
}