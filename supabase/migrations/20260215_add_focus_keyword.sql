-- Add focus_keyword column to jobs and blog_posts
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS focus_keyword TEXT;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS focus_keyword TEXT;

-- Update existing records to use the first tag as focus_keyword if available
UPDATE jobs 
SET focus_keyword = tags[1] 
WHERE focus_keyword IS NULL AND tags IS NOT NULL AND array_length(tags, 1) > 0;

UPDATE blog_posts 
SET focus_keyword = tags[1] 
WHERE focus_keyword IS NULL AND tags IS NOT NULL AND array_length(tags, 1) > 0;
