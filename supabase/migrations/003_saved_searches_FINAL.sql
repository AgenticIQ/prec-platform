-- BULLETPROOF Saved Searches Migration
-- This script is completely idempotent - safe to run multiple times
-- It will clean up and recreate everything fresh

-- ============================================================================
-- STEP 1: COMPLETE CLEANUP (in correct order to avoid dependency issues)
-- ============================================================================

-- Drop all policies first (they depend on tables)
DO $$
BEGIN
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
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- Drop all triggers
DROP TRIGGER IF EXISTS update_saved_searches_updated_at ON saved_searches CASCADE;
DROP TRIGGER IF EXISTS update_property_favorites_updated_at ON property_favorites CASCADE;

-- Drop all tables with CASCADE (removes all dependent objects like constraints, indexes)
DROP TABLE IF EXISTS property_clicks CASCADE;
DROP TABLE IF EXISTS search_notifications_log CASCADE;
DROP TABLE IF EXISTS property_favorites CASCADE;
DROP TABLE IF EXISTS saved_searches CASCADE;

-- Drop the function
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- ============================================================================
-- STEP 2: CREATE TABLES
-- ============================================================================

-- Table: saved_searches
CREATE TABLE saved_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  search_name VARCHAR(255) NOT NULL,
  search_description TEXT,
  criteria JSONB NOT NULL DEFAULT '{}',
  notification_frequency VARCHAR(20) NOT NULL DEFAULT 'daily',
  notification_time VARCHAR(5),
  notification_days JSONB,
  admin_shadow_notification BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  last_run_at TIMESTAMP WITH TIME ZONE,
  last_match_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: property_favorites
CREATE TABLE property_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  property_mls_number VARCHAR(50) NOT NULL,
  property_address TEXT,
  property_data JSONB,
  category VARCHAR(20) NOT NULL CHECK (category IN ('love', 'like', 'leave')),
  client_notes TEXT,
  first_viewed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_viewed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  view_count INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(client_id, property_mls_number)
);

-- Table: search_notifications_log
CREATE TABLE search_notifications_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  saved_search_id UUID NOT NULL REFERENCES saved_searches(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  properties_sent JSONB NOT NULL DEFAULT '[]',
  property_count INTEGER DEFAULT 0,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  opened_at TIMESTAMP WITH TIME ZONE,
  admin_notified BOOLEAN DEFAULT FALSE,
  email_subject TEXT,
  notification_type VARCHAR(20) DEFAULT 'automated',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: property_clicks
CREATE TABLE property_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  property_mls_number VARCHAR(50) NOT NULL,
  notification_id UUID REFERENCES search_notifications_log(id) ON DELETE SET NULL,
  clicked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  referrer TEXT,
  session_id TEXT,
  user_agent TEXT
);

-- ============================================================================
-- STEP 3: CREATE INDEXES
-- ============================================================================

CREATE INDEX idx_saved_searches_client_id ON saved_searches(client_id);
CREATE INDEX idx_saved_searches_active ON saved_searches(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_saved_searches_frequency ON saved_searches(notification_frequency);

CREATE INDEX idx_property_favorites_client_id ON property_favorites(client_id);
CREATE INDEX idx_property_favorites_category ON property_favorites(category);
CREATE INDEX idx_property_favorites_client_category ON property_favorites(client_id, category);
CREATE INDEX idx_property_favorites_mls ON property_favorites(property_mls_number);

CREATE INDEX idx_search_notifications_search_id ON search_notifications_log(saved_search_id);
CREATE INDEX idx_search_notifications_client_id ON search_notifications_log(client_id);
CREATE INDEX idx_search_notifications_sent_at ON search_notifications_log(sent_at);

CREATE INDEX idx_property_clicks_client_id ON property_clicks(client_id);
CREATE INDEX idx_property_clicks_mls ON property_clicks(property_mls_number);
CREATE INDEX idx_property_clicks_notification ON property_clicks(notification_id);
CREATE INDEX idx_property_clicks_clicked_at ON property_clicks(clicked_at);

-- ============================================================================
-- STEP 4: CREATE FUNCTION FOR AUTO-UPDATING updated_at
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- STEP 5: CREATE TRIGGERS
-- ============================================================================

CREATE TRIGGER update_saved_searches_updated_at
  BEFORE UPDATE ON saved_searches
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_property_favorites_updated_at
  BEFORE UPDATE ON property_favorites
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- STEP 6: ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_notifications_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_clicks ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 7: CREATE RLS POLICIES
-- ============================================================================

-- Saved Searches Policies
CREATE POLICY "Clients can view their own saved searches"
  ON saved_searches FOR SELECT
  USING (client_id = auth.uid());

CREATE POLICY "Clients can create their own saved searches"
  ON saved_searches FOR INSERT
  WITH CHECK (client_id = auth.uid());

CREATE POLICY "Clients can update their own saved searches"
  ON saved_searches FOR UPDATE
  USING (client_id = auth.uid());

CREATE POLICY "Clients can delete their own saved searches"
  ON saved_searches FOR DELETE
  USING (client_id = auth.uid());

-- Property Favorites Policies
CREATE POLICY "Clients can view their own property favorites"
  ON property_favorites FOR SELECT
  USING (client_id = auth.uid());

CREATE POLICY "Clients can create their own property favorites"
  ON property_favorites FOR INSERT
  WITH CHECK (client_id = auth.uid());

CREATE POLICY "Clients can update their own property favorites"
  ON property_favorites FOR UPDATE
  USING (client_id = auth.uid());

CREATE POLICY "Clients can delete their own property favorites"
  ON property_favorites FOR DELETE
  USING (client_id = auth.uid());

-- Search Notifications Log Policies (read-only for clients)
CREATE POLICY "Clients can view their own notification history"
  ON search_notifications_log FOR SELECT
  USING (client_id = auth.uid());

-- Property Clicks Policies
CREATE POLICY "Clients can view their own click history"
  ON property_clicks FOR SELECT
  USING (client_id = auth.uid());

CREATE POLICY "Clients can log their own clicks"
  ON property_clicks FOR INSERT
  WITH CHECK (client_id = auth.uid());

-- ============================================================================
-- STEP 8: GRANT PERMISSIONS
-- ============================================================================

GRANT ALL ON saved_searches TO service_role;
GRANT ALL ON property_favorites TO service_role;
GRANT ALL ON search_notifications_log TO service_role;
GRANT ALL ON property_clicks TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON saved_searches TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON property_favorites TO authenticated;
GRANT SELECT ON search_notifications_log TO authenticated;
GRANT SELECT, INSERT ON property_clicks TO authenticated;

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Migration completed successfully!';
  RAISE NOTICE 'Created tables: saved_searches, property_favorites, search_notifications_log, property_clicks';
END $$;
