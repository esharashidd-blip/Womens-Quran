-- Programme Progress table (For You guided programs)
CREATE TABLE IF NOT EXISTS programme_progress (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  programme_id TEXT NOT NULL,
  current_day INTEGER NOT NULL DEFAULT 0,
  completed_days TEXT NOT NULL DEFAULT '[]',
  journal_entries TEXT NOT NULL DEFAULT '{}',
  emotional_check_ins TEXT NOT NULL DEFAULT '{}',
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, programme_id)
);

-- Quran Bookmarks table (one bookmark per user)
CREATE TABLE IF NOT EXISTS quran_bookmarks (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  surah_number INTEGER NOT NULL,
  ayah_number INTEGER NOT NULL,
  surah_name TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_programme_progress_user_id ON programme_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_quran_bookmarks_user_id ON quran_bookmarks(user_id);

-- RLS Policies for programme_progress
ALTER TABLE programme_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own programme progress"
  ON programme_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own programme progress"
  ON programme_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own programme progress"
  ON programme_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for quran_bookmarks
ALTER TABLE quran_bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own bookmarks"
  ON quran_bookmarks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bookmarks"
  ON quran_bookmarks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookmarks"
  ON quran_bookmarks FOR UPDATE
  USING (auth.uid() = user_id);
