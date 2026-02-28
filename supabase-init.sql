-- =============================================
-- 猫のもしも手帳 - データベース初期化SQL
-- Supabase SQL Editorで実行してください
-- =============================================

-- 1. プロフィールテーブル
CREATE TABLE IF NOT EXISTS profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_own" ON profiles FOR ALL USING (auth.uid() = id);

-- 2. ペットテーブル
CREATE TABLE IF NOT EXISTS my_pets (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  species text DEFAULT '猫',
  birthday date,
  photo_url text,
  notes text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE my_pets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pets_own" ON my_pets FOR ALL USING (auth.uid() = user_id);

-- 3. 記録テーブル
CREATE TABLE IF NOT EXISTS pet_records (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  pet_id uuid REFERENCES my_pets ON DELETE CASCADE NOT NULL,
  type text CHECK (type IN ('medical', 'daily', 'memory')) DEFAULT 'daily',
  mood text CHECK (mood IN ('good', 'normal', 'bad')),
  content text,
  image_url text,
  date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE pet_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "records_own" ON pet_records FOR ALL USING (auth.uid() = user_id);

-- 4. 飼い主情報テーブル
CREATE TABLE IF NOT EXISTS owner_info (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL UNIQUE,
  full_name text,
  address text,
  emergency_msg text,
  key_location text,
  vet_name text,
  vet_phone text,
  insurance_company text,
  insurance_number text,
  vaccine_date date,
  vaccine_type text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE owner_info ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner_own" ON owner_info FOR ALL USING (auth.uid() = user_id);

-- 5. 緊急連絡先テーブル
CREATE TABLE IF NOT EXISTS emergency_contacts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  relationship text,
  phone text,
  email text,
  priority integer DEFAULT 1,
  consent boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "contacts_own" ON emergency_contacts FOR ALL USING (auth.uid() = user_id);

-- 6. ストレージバケット（Storageタブで手動作成してもOK）
-- INSERT INTO storage.buckets (id, name, public) VALUES ('pet-photos', 'pet-photos', true);
-- CREATE POLICY "photos_own_upload" ON storage.objects FOR INSERT WITH CHECK (auth.uid()::text = (storage.foldername(name))[1]);
-- CREATE POLICY "photos_public_read" ON storage.objects FOR SELECT USING (bucket_id = 'pet-photos');

-- 7. 新規ユーザー登録時にprofilesを自動作成するトリガー
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, email)
  VALUES (new.id, new.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();
