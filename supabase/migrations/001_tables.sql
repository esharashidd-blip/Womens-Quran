-- STEP 1: Run this first to create tables
-- Supabase Migration: Tables for Women's Quran App

-- ============================================
-- TABLES
-- ============================================

-- Favorites table
CREATE TABLE IF NOT EXISTS public.favorites (
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
CREATE TABLE IF NOT EXISTS public.qada (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prayer_name TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  UNIQUE(user_id, prayer_name)
);

-- Settings table
CREATE TABLE IF NOT EXISTS public.settings (
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
CREATE TABLE IF NOT EXISTS public.prayer_progress (
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
CREATE TABLE IF NOT EXISTS public.quran_reading_sessions (
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

CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_qada_user_id ON public.qada(user_id);
CREATE INDEX IF NOT EXISTS idx_prayer_progress_user_id ON public.prayer_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_prayer_progress_date ON public.prayer_progress(date);
CREATE INDEX IF NOT EXISTS idx_quran_sessions_user_id ON public.quran_reading_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_quran_sessions_date ON public.quran_reading_sessions(date);
