-- Saved Searches and Property Favorites System
-- Migration: 003_saved_searches_and_favorites

-- Table: saved_searches
-- Stores client search criteria and notification preferences
CREATE TABLE IF NOT EXISTS saved_searches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,

  -- Search Details
  search_name VARCHAR(255) NOT NULL,
  search_description TEXT,

  -- Search Criteria (stored as JSONB for flexibility)
  criteria JSONB NOT NULL DEFAULT '{}',
  -- Example criteria structure:
  -- {
  --   "cities": ["Victoria", "Oak Bay"],
  --   "minPrice": 500000,
  --   "maxPrice": 800000,
  --   "propertyTypes": ["Single Family", "Townhouse"],
  --   "minBedrooms": 3,
  --   "minBathrooms": 2,
  --   "minSquareFeet": 1500,
  --   "features": ["Pool", "Waterfront"]
  -- }

  -- Notification Settings
  notification_frequency VARCHAR(20) NOT NULL DEFAULT 'daily',
  -- Options: 'realtime', 'daily', 'weekly', 'monthly'

  notification_time VARCHAR(5), -- e.g., '08:00' or '18:00' for AM/PM
  notification_days JSONB, -- e.g., ["monday", "wednesday", "saturday"]
  -- For weekly/monthly schedules

  -- Admin Features
  admin_shadow_notification BOOLEAN DEFAULT FALSE,
  -- When true, admin receives copy of client notifications

  -- Search Management
  is_active BOOLEAN DEFAULT TRUE,
  last_run_at TIMESTAMP WITH TIME ZONE,
  last_match_count INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  -- Indexes for performance
  CONSTRAINT saved_searches_client_id_fkey FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

CREATE INDEX idx_saved_searches_client_id ON saved_searches(client_id);
CREATE INDEX idx_saved_searches_active ON saved_searches(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_saved_searches_frequency ON saved_searches(notification_frequency);

-- Table: property_favorites
-- Stores client property ratings (Love It! / Like It! / Leave It!!!)
CREATE TABLE IF NOT EXISTS property_favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,

  -- Property Reference
  property_mls_number VARCHAR(50) NOT NULL,
  property_address TEXT, -- Cached for display
  property_data JSONB, -- Cache full property data for offline viewing

  -- Client Rating
  category VARCHAR(20) NOT NULL CHECK (category IN ('love', 'like', 'leave')),
  -- 'love' = Love It!
  -- 'like' = Like It!
  -- 'leave' = Leave It!!!

  -- Optional Notes
  client_notes TEXT,

  -- Tracking
  first_viewed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_viewed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  view_count INTEGER DEFAULT 1,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  -- Unique constraint: one rating per client per property
  UNIQUE(client_id, property_mls_number)
);

CREATE INDEX idx_property_favorites_client_id ON property_favorites(client_id);
CREATE INDEX idx_property_favorites_category ON property_favorites(category);
CREATE INDEX idx_property_favorites_client_category ON property_favorites(client_id, category);
CREATE INDEX idx_property_favorites_mls ON property_favorites(property_mls_number);

-- Table: search_notifications_log
-- Tracks all notifications sent to clients
CREATE TABLE IF NOT EXISTS search_notifications_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  saved_search_id UUID NOT NULL REFERENCES saved_searches(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,

  -- Notification Content
  properties_sent JSONB NOT NULL DEFAULT '[]',
  -- Array of MLS numbers sent in this notification

  property_count INTEGER DEFAULT 0,

  -- Tracking
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  opened_at TIMESTAMP WITH TIME ZONE,

  -- Shadow Notification
  admin_notified BOOLEAN DEFAULT FALSE,

  -- Metadata
  email_subject TEXT,
  notification_type VARCHAR(20) DEFAULT 'automated',
  -- 'automated', 'manual', 'test'

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_search_notifications_search_id ON search_notifications_log(saved_search_id);
CREATE INDEX idx_search_notifications_client_id ON search_notifications_log(client_id);
CREATE INDEX idx_search_notifications_sent_at ON search_notifications_log(sent_at);

-- Table: property_clicks
-- Track which properties clients click through to view
CREATE TABLE IF NOT EXISTS property_clicks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  property_mls_number VARCHAR(50) NOT NULL,
  notification_id UUID REFERENCES search_notifications_log(id) ON DELETE SET NULL,

  -- Tracking
  clicked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  referrer TEXT,

  -- SEO Data
  session_id TEXT,
  user_agent TEXT
);

CREATE INDEX idx_property_clicks_client_id ON property_clicks(client_id);
CREATE INDEX idx_property_clicks_mls ON property_clicks(property_mls_number);
CREATE INDEX idx_property_clicks_notification ON property_clicks(notification_id);
CREATE INDEX idx_property_clicks_clicked_at ON property_clicks(clicked_at);

-- Function: Update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_saved_searches_updated_at
  BEFORE UPDATE ON saved_searches
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_property_favorites_updated_at
  BEFORE UPDATE ON property_favorites
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies

-- Enable RLS
ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_notifications_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_clicks ENABLE ROW LEVEL SECURITY;

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

-- Property Clicks Policies (insert and read for clients)
CREATE POLICY "Clients can view their own click history"
  ON property_clicks FOR SELECT
  USING (client_id = auth.uid());

CREATE POLICY "Clients can log their own clicks"
  ON property_clicks FOR INSERT
  WITH CHECK (client_id = auth.uid());

-- Grant permissions to service role (for admin/cron operations)
GRANT ALL ON saved_searches TO service_role;
GRANT ALL ON property_favorites TO service_role;
GRANT ALL ON search_notifications_log TO service_role;
GRANT ALL ON property_clicks TO service_role;

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON saved_searches TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON property_favorites TO authenticated;
GRANT SELECT ON search_notifications_log TO authenticated;
GRANT SELECT, INSERT ON property_clicks TO authenticated;

-- Comments for documentation
COMMENT ON TABLE saved_searches IS 'Client saved searches with notification preferences';
COMMENT ON TABLE property_favorites IS 'Client property ratings (Love/Like/Leave) for easy filtering';
COMMENT ON TABLE search_notifications_log IS 'Audit log of all search notifications sent';
COMMENT ON TABLE property_clicks IS 'Track client property clicks for engagement metrics';

COMMENT ON COLUMN saved_searches.admin_shadow_notification IS 'When enabled, admin receives copy of client notifications';
COMMENT ON COLUMN property_favorites.category IS 'Client rating: love, like, or leave';
COMMENT ON COLUMN search_notifications_log.properties_sent IS 'JSON array of MLS numbers included in notification';
