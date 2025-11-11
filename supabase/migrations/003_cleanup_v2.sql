-- Aggressive cleanup script for saved searches migration
-- This will completely remove everything related to the migration

-- Drop all policies first
DROP POLICY IF EXISTS "Clients can view their own saved searches" ON saved_searches;
DROP POLICY IF EXISTS "Clients can create their own saved searches" ON saved_searches;
DROP POLICY IF EXISTS "Clients can update their own saved searches" ON saved_searches;
DROP POLICY IF EXISTS "Clients can delete their own saved searches" ON saved_searches;
DROP POLICY IF EXISTS "Clients can view their own property favorites" ON property_favorites;
DROP POLICY IF EXISTS "Clients can create their own property favorites" ON property_favorites;
DROP POLICY IF EXISTS "Clients can update their own property favorites" ON property_favorites;
DROP POLICY IF EXISTS "Clients can delete their own property favorites" ON property_favorites;
DROP POLICY IF EXISTS "Clients can view their own notification history" ON search_notifications_log;
DROP POLICY IF EXISTS "Clients can view their own click history" ON property_clicks;
DROP POLICY IF EXISTS "Clients can log their own clicks" ON property_clicks;

-- Drop all triggers
DROP TRIGGER IF EXISTS update_saved_searches_updated_at ON saved_searches;
DROP TRIGGER IF EXISTS update_property_favorites_updated_at ON property_favorites;

-- Drop all indexes
DROP INDEX IF EXISTS idx_saved_searches_client_id;
DROP INDEX IF EXISTS idx_saved_searches_active;
DROP INDEX IF EXISTS idx_saved_searches_frequency;
DROP INDEX IF EXISTS idx_property_favorites_client_id;
DROP INDEX IF EXISTS idx_property_favorites_category;
DROP INDEX IF EXISTS idx_property_favorites_client_category;
DROP INDEX IF EXISTS idx_property_favorites_mls;
DROP INDEX IF EXISTS idx_search_notifications_search_id;
DROP INDEX IF EXISTS idx_search_notifications_client_id;
DROP INDEX IF EXISTS idx_search_notifications_sent_at;
DROP INDEX IF EXISTS idx_property_clicks_client_id;
DROP INDEX IF EXISTS idx_property_clicks_mls;
DROP INDEX IF EXISTS idx_property_clicks_notification;
DROP INDEX IF EXISTS idx_property_clicks_clicked_at;

-- Drop all tables with CASCADE (this removes all constraints)
DROP TABLE IF EXISTS property_clicks CASCADE;
DROP TABLE IF EXISTS search_notifications_log CASCADE;
DROP TABLE IF EXISTS property_favorites CASCADE;
DROP TABLE IF EXISTS saved_searches CASCADE;

-- Drop the function
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Success message
SELECT 'Cleanup completed successfully. Now run the main migration.' AS status;
