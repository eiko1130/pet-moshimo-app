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

{/* 説明バナー */}
{displayId && (
  <div className="bg-pink-50 rounded-2xl p-4 mt-2">
    <p className="text-xs text-gray-600 leading-relaxed mb-3">
      相手もアプリをインストールしていれば、メールとアプリのダブル通知で安心。登録時に相手のIDを入力するか、QRコードで新規登録してもらうだけです。
    </p>
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
  </div>
)}