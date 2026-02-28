# 🐈 猫のもしも手帳 - セットアップ手順

## ファイル構成

```
/
├── app/
│   ├── auth/page.tsx          # ログイン・新規登録
│   ├── page.tsx               # ホーム
│   ├── record/page.tsx        # 見守り記録
│   ├── calendar/page.tsx      # カレンダー
│   ├── gallery/page.tsx       # 思い出フォト
│   ├── pets/page.tsx          # うちの子リスト
│   ├── pets/new/page.tsx      # ペット追加
│   ├── settings/owner/page.tsx     # 飼い主情報編集
│   ├── settings/contacts/page.tsx  # 緊急連絡先編集
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── AuthProvider.tsx
│   └── BottomNav.tsx
├── lib/
│   └── supabase.ts
├── types/
│   └── index.ts
├── middleware.ts
└── supabase-init.sql  ← Supabaseで実行するSQL
```

## セットアップ手順

### 1. Supabaseの設定

1. Supabase SQL Editorを開く
2. `supabase-init.sql` の内容をコピー＆ペーストして実行
3. Storageで `pet-photos` という名前のバケットを作成（publicにする）

### 2. 環境変数の設定

`.env.local.example` をコピーして `.env.local` を作成し、値を入力：

```
NEXT_PUBLIC_SUPABASE_URL=https://あなたのプロジェクトID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...あなたのanonキー
```

### 3. ローカル起動

```bash
npm install
npm run dev
```

### 4. Vercelデプロイ

1. GitHubにプッシュ
2. VercelでプロジェクトのSettings → Environment Variables に上記2つを追加
3. Redeploy

### 5. Supabase URL Configuration

Authentication → URL Configuration で：
- Site URL: `https://あなたのvercelドメイン.vercel.app`
- Redirect URLs: `https://あなたのvercelドメイン.vercel.app/**`

## 画像ファイル（publicフォルダに置く）

- `logo.png` - ロゴ画像
- `main.png` - ホーム画面の猫イラスト
