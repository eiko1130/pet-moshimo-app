// @ts-nocheck
'use client';
import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  FaceSmileIcon,
  FaceFrownIcon,
} from '@heroicons/react/24/outline';
import { supabase } from '@/lib/supabase'; // 💡 追加

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());
  const [allRecords, setAllRecords] = useState([]);
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);

  // 💡 1. クラウドから全データを取ってくる
  useEffect(() => {
    async function fetchData() {
      setLoading(true);

      // ペット名簿を取得
      const { data: petsData } = await supabase.from('my_pets').select('*');
      setPets(petsData || []);

      // 見守り記録を取得
      const { data: recordsData } = await supabase
        .from('pet_records')
        .select('*')
        .order('date', { ascending: false });

      setAllRecords(recordsData || []);
      setLoading(false);
    }

    fetchData();
  }, []);

  // カレンダー計算ロジック
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const days = [
    ...Array(firstDayOfMonth).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  // 💡 2. 記録がある日の判定（ハイライト用）
  const recordedDays = allRecords
    .filter((r) => {
      const d = new Date(r.date);
      return d.getFullYear() === year && d.getMonth() === month;
    })
    .map((r) => new Date(r.date).getDate());

  // 💡 3. 選択された日の詳細データを作成
  const displayRecords = allRecords
    .filter((r) => {
      const d = new Date(r.date);
      // カレンダーの日付と一致するかチェック
      return (
        d.getFullYear() === year &&
        d.getMonth() === month &&
        d.getDate() === selectedDay
      );
    })
    .map((record) => {
      const petInfo = pets.find((p) => p.id === record.pet_id); // petId から pet_id に変更
      return {
        ...record,
        name: petInfo?.name || '不明な子',
        petImage: petInfo?.image_url || null, // image から image_url に変更
        moodLabel:
          record.mood === 'good'
            ? 'ごきげん'
            : record.mood === 'normal'
            ? 'ふつう'
            : '元気がいまいち',
      };
    });

  return (
    <div className="min-h-screen bg-[#FFFBFC] pb-24 font-medium text-gray-700">
      <Header title="カレンダー" showMenu={true} />

      <div className="px-6 py-8">
        {/* 月切り替え */}
        <div className="flex items-center justify-between mb-8 px-2">
          <button
            onClick={() => setCurrentDate(new Date(year, month - 1))}
            className="p-2 bg-white rounded-full shadow-sm border border-pink-50"
          >
            <ChevronLeftIcon className="w-5 h-5 text-[#FFB7C5]" />
          </button>
          <h2 className="text-lg font-black tracking-[0.2em] text-gray-600">
            {year}.{String(month + 1).padStart(2, '0')}
          </h2>
          <button
            onClick={() => setCurrentDate(new Date(year, month + 1))}
            className="p-2 bg-white rounded-full shadow-sm border border-pink-50"
          >
            <ChevronRightIcon className="w-5 h-5 text-[#FFB7C5]" />
          </button>
        </div>

        {/* 曜日ヘッダー */}
        <div className="grid grid-cols-7 mb-4">
          {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((d) => (
            <div
              key={d}
              className="text-center text-[10px] font-bold text-gray-300 tracking-widest"
            >
              {d}
            </div>
          ))}
        </div>

        {/* カレンダーグリッド */}
        <div className="grid grid-cols-7 gap-y-2 mb-10">
          {days.map((day, i) => (
            <div
              key={i}
              className="aspect-[4/5] flex flex-col items-center justify-start pt-1 relative"
            >
              {day && (
                <>
                  <button
                    onClick={() => setSelectedDay(day)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                      day === selectedDay
                        ? 'bg-[#FFB7C5] text-white shadow-md shadow-pink-100/50 scale-110'
                        : 'text-gray-600 hover:bg-pink-50/50'
                    }`}
                  >
                    {day}
                  </button>

                  {recordedDays.includes(day) && (
                    <div
                      className={`w-1.5 h-1.5 rounded-full mt-1 ${
                        day === selectedDay
                          ? 'bg-white absolute bottom-2'
                          : 'bg-pink-200'
                      }`}
                    />
                  )}
                </>
              )}
            </div>
          ))}
        </div>

        {/* --- 詳細エリア --- */}
        <div className="space-y-4">
          <p className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-2">
            {selectedDay}日の記録
          </p>

          {loading ? (
            <p className="text-center py-10 text-gray-300 text-xs">
              読み込み中...
            </p>
          ) : displayRecords.length > 0 ? (
            displayRecords.map((record) => (
              <div
                key={record.id}
                className="bg-white rounded-[32px] p-5 shadow-sm border border-pink-50 flex items-start gap-4"
              >
                <div className="w-16 h-16 rounded-2xl bg-pink-50 relative overflow-hidden flex-shrink-0 border border-gray-100">
                  {/* 今日の写真 (image_url) か、ペットの基本写真 (petImage) を表示 */}
                  <img
                    src={record.image_url || record.petImage || '/logo.png'}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-black text-gray-700 text-sm tracking-tighter">
                      {record.name}
                    </span>
                    <div className="flex items-center gap-1">
                      {record.mood === 'bad' ? (
                        <FaceFrownIcon className="w-4 h-4 text-blue-300 stroke-[2.5px]" />
                      ) : (
                        <FaceSmileIcon
                          className={`w-4 h-4 stroke-[2.5px] ${
                            record.mood === 'good'
                              ? 'text-[#FFB7C5]'
                              : 'text-gray-300'
                          }`}
                        />
                      )}
                      <span
                        className={`text-[10px] font-bold ${
                          record.mood === 'good'
                            ? 'text-[#FFB7C5]'
                            : record.mood === 'bad'
                            ? 'text-blue-300'
                            : 'text-gray-400'
                        }`}
                      >
                        {record.moodLabel}
                      </span>
                    </div>
                  </div>
                  <p className="text-[12px] text-gray-500 leading-relaxed">
                    {record.memo || 'メモはありません'}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="py-10 text-center border-2 border-dashed border-gray-50 rounded-[32px]">
              <p className="text-gray-300 text-xs font-bold tracking-widest uppercase">
                No Records
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
