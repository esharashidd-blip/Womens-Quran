-- Add user_id column to qada table for per-user tracking
ALTER TABLE qada ADD COLUMN IF NOT EXISTS user_id TEXT;

-- Update existing rows with a default user_id (empty string for now)
-- In production, you may want to assign these to a specific user or delete them
UPDATE qada SET user_id = '' WHERE user_id IS NULL;

-- Make user_id NOT NULL after updating existing rows
ALTER TABLE qada ALTER COLUMN user_id SET NOT NULL;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_qada_user_id ON qada(user_id);

-- Add unique constraint to prevent duplicate prayer entries per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_qada_user_prayer ON qada(user_id, prayer_name);
