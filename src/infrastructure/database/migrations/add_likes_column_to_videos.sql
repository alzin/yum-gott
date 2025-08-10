-- Add likes_count column to videos table
ALTER TABLE IF EXISTS videos 
ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0;

-- Update existing videos to have 0 likes
UPDATE videos SET likes_count = 0 WHERE likes_count IS NULL;
