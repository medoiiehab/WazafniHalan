-- Migration to add hide_placeholders column to adsense_settings table

ALTER TABLE adsense_settings 
ADD COLUMN IF NOT EXISTS hide_placeholders BOOLEAN DEFAULT FALSE;

-- Optional: Update existing records to have this set to false explicitly (though default handles it)
UPDATE adsense_settings SET hide_placeholders = FALSE WHERE hide_placeholders IS NULL;
