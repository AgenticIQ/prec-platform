-- Cleanup script for saved searches migration
-- Run this FIRST to remove any partially created objects

-- Drop tables if they exist (CASCADE removes all dependent objects)
DROP TABLE IF EXISTS property_clicks CASCADE;
DROP TABLE IF EXISTS search_notifications_log CASCADE;
DROP TABLE IF EXISTS property_favorites CASCADE;
DROP TABLE IF EXISTS saved_searches CASCADE;

-- Drop function if it exists
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Confirmation message
DO $$
BEGIN
  RAISE NOTICE 'Cleanup completed. You can now run the main migration.';
END $$;
