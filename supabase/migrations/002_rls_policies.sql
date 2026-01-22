-- STEP 2: Run this after tables are created
-- Row Level Security policies

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qada ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prayer_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quran_reading_sessions ENABLE ROW LEVEL SECURITY;

-- Favorites policies
CREATE POLICY "Users can view own favorites" ON public.favorites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites" ON public.favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites" ON public.favorites
  FOR DELETE USING (auth.uid() = user_id);

-- Qada policies
CREATE POLICY "Users can view own qada" ON public.qada
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own qada" ON public.qada
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own qada" ON public.qada
  FOR UPDATE USING (auth.uid() = user_id);

-- Settings policies
CREATE POLICY "Users can view own settings" ON public.settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings" ON public.settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings" ON public.settings
  FOR UPDATE USING (auth.uid() = user_id);

-- Prayer progress policies
CREATE POLICY "Users can view own prayer progress" ON public.prayer_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own prayer progress" ON public.prayer_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own prayer progress" ON public.prayer_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- Quran sessions policies
CREATE POLICY "Users can view own quran sessions" ON public.quran_reading_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quran sessions" ON public.quran_reading_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own quran sessions" ON public.quran_reading_sessions
  FOR UPDATE USING (auth.uid() = user_id);
