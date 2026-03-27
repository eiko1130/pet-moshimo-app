'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/AuthProvider'

const FIXED_ITEMS = [
  { key: 'weight', label: '体重' },
  { key: 'temperature', label: '体温' },
  { key: 'no_appetite', label: '食欲がない' },
  { key: 'abnormal_excretion', label: '排泄の異常' },
  { key: 'vomit', label: '嘔吐' },
  { key: 'nail_trimming', label: '爪切り' },
]

export default function RecordItemsSettingPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [weightUnit, setWeightUnit] = useState<'kg' | 'g'>('kg')
  const [freeLabels, setFreeLabels] = useState({ free1: '', free2: '', free3: '' })

  useEffect(() => {
    if (!user) return
    supabase.from('moshimo_info').select('record_items, weight_unit, free_item1_label, free_item2_label, free_item3_label')
      .eq('user_id', user.id).single().then(({ data }) => {
        if (data) {
          setSelectedItems(data.record_items ?? [])
          setWeightUnit(data.weight_unit ?? 'kg')
          setFreeLabels({
            free1: data.free_item1_label ?? '',
            free2: data.free_item2_label ?? '',
            free3: data.free_item3_label ?? '',
          })
        }
        setLoading(false)
      })
  }, [user])

  const toggleItem = (key: string) => {
    setSelectedItems(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    )
  }

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    try {
      const { error } = await supabase.from('moshimo_info').update({
        record_items: selectedItems,
        weight_unit: weightUnit,
        free_item1_label: freeLabels.free1 || null,
        free_item2_label: freeLabels.free2 || null,
        free_item3_label: freeLabels.free3 || null,
      }).eq('user_id', user.id)
      if (error) throw error
      setMessage('保存しました！')
      setTimeout(() => { setMessage(''); router.back() }, 1000)
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
        <span className="font-bold">日記の項目設定</span>
        <div className="w-6" />
      </header>

      <div className="px-5 py-5 space-y-5">
        <p className="text-xs text-gray-400">毎日の記録でつける項目を選んでください。あとからでも変更できます。</p>

        {/* ごきげん（必須） */}
        <section>
          <h2 className="text-sm font-bold text-[#FFB7C5] mb-3">基本項目</h2>
          <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50">
            <div className="px-4 py-3 flex items-center justify-between">
              <span className="text-sm text-gray-700">ごきげん</span>
              <span className="text-xs bg-pink-100 text-pink-400 px-2 py-0.5 rounded-full">必須</span>
            </div>
          </div>
        </section>

        {/* 選択項目 */}
        <section>
          <h2 className="text-sm font-bold text-[#FFB7C5] mb-3">追加項目</h2>
          <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50">
            {FIXED_ITEMS.map(item => (
              <div key={item.key} className="px-4 py-3 flex items-center justify-between">
                <span className="text-sm text-gray-700">{item.label}</span>
                <button
                  onClick={() => toggleItem(item.key)}
                  className={`relative w-12 h-6 rounded-full transition-colors overflow-hidden ${selectedItems.includes(item.key) ? 'bg-[#FFB7C5]' : 'bg-gray-200'}`}
                >
                  <span
                    className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform"
                    style={{ transform: selectedItems.includes(item.key) ? 'translateX(20px)' : 'translateX(0px)' }}
                  />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* 体重単位（体重が選択されている時のみ） */}
        {selectedItems.includes('weight') && (
          <section>
            <h2 className="text-sm font-bold text-[#FFB7C5] mb-3">体重の単位</h2>
            <div className="bg-white rounded-2xl border border-gray-100 px-4 py-3">
              <div className="flex gap-3">
                {(['kg', 'g'] as const).map(unit => (
                  <button
                    key={unit}
                    onClick={() => setWeightUnit(unit)}
                    className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-all ${
                      weightUnit === unit ? 'bg-[#FFB7C5] border-[#FFB7C5] text-white' : 'bg-white border-gray-200 text-gray-500'
                    }`}
                  >
                    {unit}
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* フリー項目 */}
        <section>
          <h2 className="text-sm font-bold text-[#FFB7C5] mb-1">フリー項目</h2>
          <p className="text-xs text-gray-400 mb-3">独自の項目名を入力してください（例：脱皮、散歩）</p>
          <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50">
            {([
              { key: 'free1', label: 'フリー項目1' },
              { key: 'free2', label: 'フリー項目2' },
              { key: 'free3', label: 'フリー項目3' },
            ] as const).map(item => (
              <div key={item.key} className="px-4 py-3">
                <label className="text-xs text-gray-400 block mb-1">{item.label}</label>
                <input
                  type="text"
                  value={freeLabels[item.key]}
                  onChange={e => setFreeLabels(f => ({ ...f, [item.key]: e.target.value }))}
                  placeholder="項目名を入力（例：脱皮）"
                  className="w-full text-sm text-gray-700 bg-transparent focus:outline-none"
                />
              </div>
            ))}
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