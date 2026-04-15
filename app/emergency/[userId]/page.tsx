'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type Step = 1 | 2 | 3 | 4

type OwnerInfo = {
  full_name: string
  address: string
  key_location: string
  hospital_name: string
  hospital_phone: string
  proxy_phone: string
  alert_hours: number
  last_checked_at: string
  message: string
}

type Pet = {
  id: string
  name: string
  species: string
  image_url: string | null
  birth_month: number | null
  birth_day: number | null
}

type PetRecord = {
  id: string
  date: string
  mood: 'good' | 'normal' | 'bad'
  memo: string | null
  image_url: string | null
  no_appetite: boolean | null
  vomit: boolean | null
  abnormal_excretion: boolean | null
  weight: number | null
  temperature: number | null
}

const MOOD_LABEL = { good: '良い', normal: 'ふつう', bad: '悪い' }
const MOOD_COLOR = { good: '#86EFAC', normal: '#FCD34D', bad: '#FCA5A5' }

function MoodDot({ mood }: { mood: 'good' | 'normal' | 'bad' }) {
  return (
    <span
      className="inline-block w-3 h-3 rounded-full flex-shrink-0"
      style={{ backgroundColor: MOOD_COLOR[mood] }}
    />
  )
}

function EmergencyContacts({ userId }: { userId: string }) {
  const [contacts, setContacts] = useState<any[]>([])
  useEffect(() => {
    supabase
      .from('emergency_contacts')
      .select('name, relationship, phone')
      .eq('user_id', userId)
      .order('priority')
      .then(({ data }) => setContacts(data ?? []))
  }, [userId])
  if (contacts.length === 0) {
    return <p className="text-sm text-gray-400">未登録</p>
  }
  return (
    <div className="space-y-2">
      {contacts.map((c, i) => (
        <div key={i} className="flex items-center justify-between">
          <div>
            <span className="text-sm text-gray-700 font-medium">{c.name}</span>
            {c.relationship && (
              <span className="text-xs text-gray-400 ml-1">（{c.relationship}）</span>
            )}
          </div>
          {c.phone && (
            <a href={'tel:' + c.phone} className="text-green-600 text-xs font-medium">
              {c.phone}
            </a>
          )}
        </div>
      ))}
    </div>
  )
}

export default function EmergencyPage() {
  const { userId } = useParams<{ userId: string }>()
  const router = useRouter()
  const [step, setStep] = useState<Step>(1)
  const [owner, setOwner] = useState<OwnerInfo | null>(null)
  const [ownerAvatar, setOwnerAvatar] = useState<string | null>(null)
  const [pets, setPets] = useState<Pet[]>([])
  const [records, setRecords] = useState<PetRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [hoursElapsed, setHoursElapsed] = useState<number>(48)
  const [resolved, setResolved] = useState(false)

  useEffect(() => {
    if (!userId) return
    const fetchAll = async () => {
      const { data: ownerData } = await supabase
        .from('moshimo_info')
        .select('full_name, address, key_location, hospital_name, hospital_phone, proxy_phone, alert_hours, last_checked_at, message')
        .eq('user_id', userId)
        .single()
      if (ownerData) {
        setOwner(ownerData)
        if (ownerData.last_checked_at) {
          const diff = (Date.now() - new Date(ownerData.last_checked_at).getTime()) / 3600000
          setHoursElapsed(Math.floor(diff))
        }
      }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', userId)
        .single()
      if (profileData?.avatar_url) setOwnerAvatar(profileData.avatar_url)

      const { data: petsData } = await supabase
        .from('my_pets')
        .select('id, name, species, image_url, birth_month, birth_day')
        .eq('user_id', userId)
        .order('created_at')
      setPets(petsData ?? [])

      const since = new Date()
      since.setDate(since.getDate() - 7)
      const sinceStr = since.toISOString().slice(0, 10)
      const { data: recordsData } = await supabase
        .from('pet_records')
        .select('id, date, mood, memo, image_url, no_appetite, vomit, abnormal_excretion, weight, temperature')
        .eq('user_id', userId)
        .gte('date', sinceStr)
        .order('date', { ascending: false })
      setRecords(recordsData ?? [])
      setLoading(false)
    }
    fetchAll()
  }, [userId])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFBFC] flex items-center justify-center">
        <p className="text-sm text-gray-400">読み込み中...</p>
      </div>
    )
  }

  const ownerName = owner?.full_name ? owner.full_name + 'さん' : 'この方'

  if (resolved) {
    return (
      <div className="min-h-screen bg-[#FFFBFC] flex flex-col items-center justify-center px-8 gap-5">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <p className="text-base font-bold text-gray-700 text-center">確認ありがとうございました！</p>
        <p className="text-sm text-gray-500 text-center leading-relaxed">緊急モードを解除しました。{ownerName}の無事が確認できてよかったです。</p>
        <button
          onClick={() => router.push('/')}
          className="w-full text-white font-bold py-4 rounded-2xl text-base"
          style={{ backgroundColor: '#FFB7C5' }}
        >
          ホームに戻る
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FFFBFC]">
      <header className="bg-[#FF8FA3] text-white px-5 pt-10 pb-4">
        <div className="flex items-center gap-2 mb-3">
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <span className="text-xs font-medium opacity-90">緊急確認モード</span>
        </div>

        <div className="flex flex-col items-center gap-2 mb-3">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-white/30 flex items-center justify-center">
            {ownerAvatar ? (
              <img src={ownerAvatar} alt={ownerName} className="w-full h-full object-cover" />
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={1.5} className="w-8 h-8">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            )}
          </div>
          <p className="text-lg font-bold">{ownerName}</p>
          <p className="text-xs opacity-80">最終確認から{hoursElapsed}時間以上経過しています</p>
        </div>

        <div className="flex items-center gap-1">
          {([1, 2, 3, 4] as Step[]).map((s) => (
            <div key={s} className="flex items-center gap-1">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                style={{
                  backgroundColor: step >= s ? 'white' : 'rgba(255,255,255,0.3)',
                  color: step >= s ? '#FF8FA3' : 'white',
                }}
              >
                {s}
              </div>
              {s < 4 && (
                <div
                  className="w-6 h-0.5"
                  style={{ backgroundColor: step > s ? 'white' : 'rgba(255,255,255,0.3)' }}
                />
              )}
            </div>
          ))}
        </div>
      </header>

      <div className="px-5 py-6 space-y-4">

        {step === 1 && (
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-100 rounded-2xl p-5">
              <p className="text-sm font-bold text-red-500 mb-2">生存確認が取れていません</p>
              <p className="text-sm text-gray-600 leading-relaxed">
                {ownerName}から
                <span className="font-bold text-red-500">{hoursElapsed}時間以上</span>
                、アプリへのアクセスが確認できていません。
              </p>
              {owner?.message && (
                <div className="mt-3 pt-3 border-t border-red-100">
                  <p className="text-xs text-gray-400 mb-1">本人からのメッセージ</p>
                  <p className="text-sm text-gray-600 leading-relaxed">「{owner.message}」</p>
                </div>
              )}
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl p-4 space-y-2">
              <p className="text-xs font-bold text-gray-500">確認の手順</p>
              {[
                'まず電話で連絡を試みます',
                '連絡が取れない場合、住所・鍵の場所を確認します',
                'ペットの状態と直近の記録を確認します',
              ].map((text, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-pink-100 text-[#FF8FA3] text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-sm text-gray-600">{text}</p>
                </div>
              ))}
            </div>
            <button
              onClick={() => setStep(2)}
              className="w-full text-white font-bold py-4 rounded-2xl text-base"
              style={{ backgroundColor: '#FF8FA3' }}
            >
              確認を開始する
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="bg-white border border-gray-100 rounded-2xl p-5">
              <p className="text-sm font-bold text-gray-700 mb-1">まず連絡を試みてください</p>
              <p className="text-xs text-gray-400 mb-4">電話・メッセージで安否を確認してください</p>
              {owner?.proxy_phone ? (
                
                <a  href={'tel:' + owner.proxy_phone}
                  className="flex items-center gap-3 w-full bg-green-50 border border-green-100 rounded-xl px-4 py-3"
                >
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.1a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.18 6.18l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">電話をかける</p>
                    <p className="text-sm font-bold text-green-600">{owner.proxy_phone}</p>
                  </div>
                </a>
              ) : (
                <div className="bg-gray-50 rounded-xl px-4 py-3">
                  <p className="text-sm text-gray-400">電話番号が登録されていません</p>
                </div>
              )}
            </div>
            <div className="space-y-3">
              <button
                onClick={() => setStep(3)}
                className="w-full bg-red-50 border border-red-100 text-red-500 font-bold py-4 rounded-2xl text-sm"
              >
                連絡が取れなかった
              </button>
              <button
                onClick={() => setResolved(true)}
                className="w-full bg-green-50 border border-green-100 text-green-600 font-bold py-4 rounded-2xl text-sm"
              >
                連絡が取れた・無事を確認できた
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
              <p className="text-xs text-amber-600 font-bold">緊急時のみ開示される情報です</p>
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-50">
                <p className="text-xs font-bold text-gray-400 mb-1">氏名</p>
                <p className="text-sm text-gray-700">{owner?.full_name || '未登録'}</p>
              </div>
              <div className="px-4 py-3 border-b border-gray-50">
                <p className="text-xs font-bold text-gray-400 mb-1">住所</p>
                {owner?.address ? (
                  
                   <a href={'https://maps.google.com/?q=' + encodeURIComponent(owner.address)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between"
                  >
                    <p className="text-sm text-gray-700 leading-relaxed">{owner.address}</p>
                    <svg viewBox="0 0 24 24" fill="none" stroke="#FFB7C5" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 flex-shrink-0 ml-2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </a>
                ) : (
                  <p className="text-sm text-gray-400">未登録</p>
                )}
              </div>
              <div className="px-4 py-3 border-b border-gray-50">
                <p className="text-xs font-bold text-gray-400 mb-1">鍵の場所</p>
                <p className="text-sm text-gray-700 leading-relaxed">{owner?.key_location || '未登録'}</p>
              </div>
              <div className="px-4 py-3 border-b border-gray-50">
                <p className="text-xs font-bold text-gray-400 mb-1">かかりつけ動物病院</p>
                {owner?.hospital_name ? (
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-700">{owner.hospital_name}</p>
                    {owner.hospital_phone && (
                      <a href={'tel:' + owner.hospital_phone} className="text-green-600 text-xs font-medium">
                        {owner.hospital_phone}
                      </a>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">未登録</p>
                )}
              </div>
              <div className="px-4 py-3">
                <p className="text-xs font-bold text-gray-400 mb-2">緊急連絡先</p>
                <EmergencyContacts userId={userId} />
              </div>
            </div>
            <button
              onClick={() => setStep(4)}
              className="w-full text-white font-bold py-4 rounded-2xl text-base"
              style={{ backgroundColor: '#FF8FA3' }}
            >
              ペットの状態を確認する
            </button>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <p className="text-sm font-bold text-gray-700">
              {ownerName}と暮らしているペットとその近況
            </p>
            {pets.length === 0 ? (
              <div className="bg-white border border-gray-100 rounded-2xl p-5 text-center">
                <p className="text-sm text-gray-400">ペット情報が登録されていません</p>
              </div>
            ) : (
              pets.map(pet => (
                <div key={pet.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
                  <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-50">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-pink-50 flex-shrink-0">
                      {pet.image_url ? (
                        <img src={pet.image_url} alt={pet.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg viewBox="0 0 24 24" fill="none" stroke="#FFB7C5" strokeWidth={1.5} className="w-6 h-6">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-700">{pet.name}</p>
                      <p className="text-xs text-gray-400">
                        {pet.species}
                        {pet.birth_month && pet.birth_day ? '　' + pet.birth_month + '/' + pet.birth_day + '生まれ' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="px-4 py-3">
                    <p className="text-xs font-bold text-gray-400 mb-2">直近7日間の記録</p>
                    {records.length === 0 ? (
                      <p className="text-xs text-gray-400">記録がありません</p>
                    ) : (
                      <div className="space-y-2">
                        {records.slice(0, 7).map(record => (
                          <div key={record.id} className="flex items-start gap-2 py-2 border-b border-gray-50 last:border-0">
                            <div className="flex-shrink-0 pt-0.5">
                              <MoodDot mood={record.mood} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-bold text-gray-600">
                                  {record.date.slice(5).replace('-', '/')}
                                </span>
                                <span className="text-xs text-gray-400">{MOOD_LABEL[record.mood]}</span>
                                {record.no_appetite && (
                                  <span className="text-xs bg-red-50 text-red-400 px-1.5 py-0.5 rounded-full">食欲なし</span>
                                )}
                                {record.vomit && (
                                  <span className="text-xs bg-red-50 text-red-400 px-1.5 py-0.5 rounded-full">嘔吐</span>
                                )}
                                {record.abnormal_excretion && (
                                  <span className="text-xs bg-red-50 text-red-400 px-1.5 py-0.5 rounded-full">排泄異常</span>
                                )}
                              </div>
                              {record.memo && (
                                <p className="text-xs text-gray-500 mt-0.5 truncate">{record.memo}</p>
                              )}
                              {record.weight && (
                                <p className="text-xs text-gray-400 mt-0.5">体重 {record.weight}kg</p>
                              )}
                            </div>
                            {record.image_url && (
                              <img src={record.image_url} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
            <div className="bg-pink-50 border border-pink-100 rounded-2xl p-4 text-center">
              <p className="text-sm text-gray-600 leading-relaxed">
                ペットの安全を確認したら、できるだけ早く保護してください。
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}