-- PREC Real Estate Platform Database Schema
-- For use with Supabase PostgreSQL

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Clients table
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50) NOT NULL,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login_at TIMESTAMP WITH TIME ZONE,
  expiry_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'suspended')),
  accepted_tou BOOLEAN DEFAULT FALSE,
  accepted_tou_date TIMESTAMP WITH TIME ZONE,
  notification_email BOOLEAN DEFAULT TRUE,
  notification_sms BOOLEAN DEFAULT FALSE,
  notification_frequency VARCHAR(20) DEFAULT 'daily' CHECK (notification_frequency IN ('immediate', 'daily', 'weekly'))
);

-- Saved searches table
CREATE TABLE saved_searches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  cities TEXT[], -- Array of city names
  neighborhoods TEXT[], -- Array of neighborhood names
  min_price INTEGER,
  max_price INTEGER,
  property_types TEXT[], -- Array of property types
  min_bedrooms INTEGER,
  min_bathrooms INTEGER,
  min_square_feet INTEGER,
  max_square_feet INTEGER,
  features TEXT[], -- Array of desired features
  keywords TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_notified_at TIMESTAMP WITH TIME ZONE,
  active BOOLEAN DEFAULT TRUE
);

-- Listings cache table (stores IDX data locally for 24-hour refresh cycle)
CREATE TABLE listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mls_number VARCHAR(50) UNIQUE NOT NULL,
  listing_brokerage VARCHAR(255) NOT NULL,
  address VARCHAR(255) NOT NULL,
  city VARCHAR(100) NOT NULL,
  province VARCHAR(50) DEFAULT 'BC',
  postal_code VARCHAR(10),
  price INTEGER NOT NULL,
  property_type VARCHAR(100) NOT NULL,
  bedrooms INTEGER,
  bathrooms NUMERIC(3,1),
  square_feet INTEGER,
  lot_size INTEGER,
  year_built INTEGER,
  description TEXT,
  features TEXT[],
  photos JSONB, -- Array of photo objects
  latitude NUMERIC(10, 8),
  longitude NUMERIC(11, 8),
  status VARCHAR(20) NOT NULL CHECK (status IN ('Active', 'Pending', 'Sold', 'Expired', 'Withdrawn')),
  listing_date TIMESTAMP WITH TIME ZONE,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  permit_idx BOOLEAN DEFAULT FALSE,
  raw_data JSONB -- Store full API response for reference
);

-- Notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  search_id UUID NOT NULL REFERENCES saved_searches(id) ON DELETE CASCADE,
  listing_ids TEXT[], -- Array of MLS numbers
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  type VARCHAR(10) CHECK (type IN ('email', 'sms')),
  error_message TEXT
);

-- Client activity log
CREATE TABLE client_activity (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  details TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin users table
CREATE TABLE admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'agent' CHECK (role IN ('admin', 'agent')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_clients_email ON clients(email);
CREATE INDEX idx_clients_status ON clients(status);
CREATE INDEX idx_clients_expiry_date ON clients(expiry_date);
CREATE INDEX idx_saved_searches_client_id ON saved_searches(client_id);
CREATE INDEX idx_saved_searches_active ON saved_searches(active);
CREATE INDEX idx_listings_mls_number ON listings(mls_number);
CREATE INDEX idx_listings_status ON listings(status);
CREATE INDEX idx_listings_city ON listings(city);
CREATE INDEX idx_listings_price ON listings(price);
CREATE INDEX idx_listings_last_updated ON listings(last_updated);
CREATE INDEX idx_notifications_client_id ON notifications(client_id);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_client_activity_client_id ON client_activity(client_id);

-- Functions for auto-expiry management
CREATE OR REPLACE FUNCTION check_expired_clients()
RETURNS void AS $$
BEGIN
  UPDATE clients
  SET status = 'expired'
  WHERE expiry_date < NOW()
  AND status = 'active';
END;
$$ LANGUAGE plpgsql;

-- Function to clean old listings (older than 24 hours)
CREATE OR REPLACE FUNCTION clean_stale_listings()
RETURNS void AS $$
BEGIN
  DELETE FROM listings
  WHERE last_updated < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;

-- Row Level Security (RLS) Policies
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_activity ENABLE ROW LEVEL SECURITY;

-- Clients can only see their own data
CREATE POLICY "Clients can view own data" ON clients
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Clients can update own data" ON clients
  FOR UPDATE
  USING (auth.uid() = id);

-- Saved searches policies
CREATE POLICY "Clients can view own searches" ON saved_searches
  FOR SELECT
  USING (client_id = auth.uid());

CREATE POLICY "Clients can update own searches" ON saved_searches
  FOR UPDATE
  USING (client_id = auth.uid());

-- Notifications policies
CREATE POLICY "Clients can view own notifications" ON notifications
  FOR SELECT
  USING (client_id = auth.uid());

-- Activity log policies
CREATE POLICY "Clients can view own activity" ON client_activity
  FOR SELECT
  USING (client_id = auth.uid());

-- Admins have full access (requires custom auth setup)
-- Note: This is a simplified version. In production, use proper admin role checking
