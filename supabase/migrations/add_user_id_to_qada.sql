-- Add user_id column to qada table for per-user tracking
-- Using UUID type to match Supabase auth.users table
ALTER TABLE qada ADD COLUMN IF NOT EXISTS user_id UUID;

-- Delete existing rows since they have no valid user association
-- In production, you may want to assign these to a specific user instead
DELETE FROM qada WHERE user_id IS NULL;

-- Make user_id NOT NULL
ALTER TABLE qada ALTER COLUMN user_id SET NOT NULL;

-- Add foreign key constraint to auth.users
ALTER TABLE qada ADD CONSTRAINT fk_qada_user
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_qada_user_id ON qada(user_id);

-- Add unique constraint to prevent duplicate prayer entries per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_qada_user_prayer ON qada(user_id, prayer_name);
