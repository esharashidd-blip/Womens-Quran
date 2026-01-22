-- Supabase Migration: Initial Schema for Women's Quran App
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)

-- ============================================
-- TABLES
-- ============================================

-- Favorites table
CREATE TABLE IF NOT EXISTS favorites (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  surah_name TEXT NOT NULL,
  surah_number INTEGER NOT NULL,
  ayah_number INTEGER NOT NULL,
  arabic_text TEXT NOT NULL,
  translation_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Qada (missed prayers) table
CREATE TABLE IF NOT EXISTS qada (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prayer_name TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  UNIQUE(user_id, prayer_name)
);

-- Settings table
CREATE TABLE IF NOT EXISTS settings (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  city TEXT NOT NULL DEFAULT 'Mecca',
  country TEXT NOT NULL DEFAULT 'Saudi Arabia',
  auto_location BOOLEAN NOT NULL DEFAULT FALSE,
  tasbih_count INTEGER NOT NULL DEFAULT 0,
  ramadan_mode BOOLEAN NOT NULL DEFAULT FALSE,
  quran_goal_minutes INTEGER NOT NULL DEFAULT 10,
  prayer_notifications BOOLEAN NOT NULL DEFAULT FALSE
);

-- Prayer progress table
CREATE TABLE IF NOT EXISTS prayer_progress (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  fajr BOOLEAN NOT NULL DEFAULT FALSE,
  dhuhr BOOLEAN NOT NULL DEFAULT FALSE,
  asr BOOLEAN NOT NULL DEFAULT FALSE,
  maghrib BOOLEAN NOT NULL DEFAULT FALSE,
  isha BOOLEAN NOT NULL DEFAULT FALSE,
  UNIQUE(user_id, date)
);

-- Quran reading sessions table
CREATE TABLE IF NOT EXISTS quran_reading_sessions (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  minutes_read INTEGER NOT NULL DEFAULT 0,
  last_surah_number INTEGER,
  last_ayah_number INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_qada_user_id ON qada(user_id);
CREATE INDEX IF NOT EXISTS idx_prayer_progress_user_id ON prayer_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_prayer_progress_date ON prayer_progress(date);
CREATE INDEX IF NOT EXISTS idx_quran_sessions_user_id ON quran_reading_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_quran_sessions_date ON quran_reading_sessions(date);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE qada ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE prayer_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE quran_reading_sessions ENABLE ROW LEVEL SECURITY;

-- Favorites policies
CREATE POLICY "Users can view own favorites" ON favorites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites" ON favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites" ON favorites
  FOR DELETE USING (auth.uid() = user_id);

-- Qada policies
CREATE POLICY "Users can view own qada" ON qada
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own qada" ON qada
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own qada" ON qada
  FOR UPDATE USING (auth.uid() = user_id);

-- Settings policies
CREATE POLICY "Users can view own settings" ON settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings" ON settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings" ON settings
  FOR UPDATE USING (auth.uid() = user_id);

-- Prayer progress policies
CREATE POLICY "Users can view own prayer progress" ON prayer_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own prayer progress" ON prayer_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own prayer progress" ON prayer_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- Quran sessions policies
CREATE POLICY "Users can view own quran sessions" ON quran_reading_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quran sessions" ON quran_reading_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own quran sessions" ON quran_reading_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- FUNCTION: Auto-create settings for new users
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create default settings for new user
  INSERT INTO public.settings (user_id) VALUES (NEW.id);

  -- Create default qada entries for new user
  INSERT INTO public.qada (user_id, prayer_name, count) VALUES
    (NEW.id, 'Fajr', 0),
    (NEW.id, 'Dhuhr', 0),
    (NEW.id, 'Asr', 0),
    (NEW.id, 'Maghrib', 0),
    (NEW.id, 'Isha', 0);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to run when a new user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
