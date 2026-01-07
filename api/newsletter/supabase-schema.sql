-- Nomada Newsletter Deals Schema
-- Run this in your Supabase SQL Editor

-- Table: newsletter_deals
-- Stores parsed deals from email newsletters
CREATE TABLE IF NOT EXISTS newsletter_deals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Deal identification
  type VARCHAR(20) NOT NULL CHECK (type IN ('flight', 'hotel', 'cruise')),
  source VARCHAR(100) NOT NULL,  -- Newsletter source (e.g., "Scott's Cheap Flights")
  source_type VARCHAR(20),       -- airline, aggregator, agency, cruise, hotel

  -- Route info (for flights)
  origin_code VARCHAR(10),
  origin_name VARCHAR(100),
  destination_code VARCHAR(10),
  destination_name VARCHAR(100),

  -- Pricing
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  discount_percent INTEGER,
  currency VARCHAR(3) DEFAULT 'USD',

  -- Travel details
  is_round_trip BOOLEAN DEFAULT true,
  travel_dates_start DATE,
  travel_dates_end DATE,

  -- Hotel specific
  hotel_name VARCHAR(200),
  nights INTEGER,
  stars INTEGER,

  -- Cruise specific
  cruise_line VARCHAR(100),
  destinations TEXT[],  -- Array of ports
  departure_port VARCHAR(100),

  -- Links and tracking
  deal_url TEXT,
  affiliate_url TEXT,

  -- Metadata
  email_subject TEXT,
  email_message_id VARCHAR(200),
  raw_text TEXT,

  -- Status
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,

  -- Timestamps
  expires_at TIMESTAMP WITH TIME ZONE,
  parsed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_deals_type ON newsletter_deals(type);
CREATE INDEX IF NOT EXISTS idx_deals_active ON newsletter_deals(is_active);
CREATE INDEX IF NOT EXISTS idx_deals_destination ON newsletter_deals(destination_code);
CREATE INDEX IF NOT EXISTS idx_deals_origin ON newsletter_deals(origin_code);
CREATE INDEX IF NOT EXISTS idx_deals_price ON newsletter_deals(price);
CREATE INDEX IF NOT EXISTS idx_deals_expires ON newsletter_deals(expires_at);
CREATE INDEX IF NOT EXISTS idx_deals_created ON newsletter_deals(created_at DESC);

-- Table: newsletter_sources
-- Track subscribed newsletter sources
CREATE TABLE IF NOT EXISTS newsletter_sources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  domain VARCHAR(100) NOT NULL UNIQUE,
  type VARCHAR(20) NOT NULL,
  email_pattern VARCHAR(200),  -- Regex pattern to identify emails
  is_active BOOLEAN DEFAULT true,
  deals_count INTEGER DEFAULT 0,
  last_email_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: processed_emails
-- Track which emails have been processed to avoid duplicates
CREATE TABLE IF NOT EXISTS processed_emails (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id VARCHAR(200) UNIQUE NOT NULL,
  from_address VARCHAR(200),
  subject TEXT,
  deals_extracted INTEGER DEFAULT 0,
  processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: deal_clicks
-- Track affiliate clicks for analytics
CREATE TABLE IF NOT EXISTS deal_clicks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  deal_id UUID REFERENCES newsletter_deals(id),
  user_agent TEXT,
  referer TEXT,
  ip_hash VARCHAR(64),  -- Hashed IP for privacy
  clicked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger: Auto-update updated_at
DROP TRIGGER IF EXISTS update_deals_updated_at ON newsletter_deals;
CREATE TRIGGER update_deals_updated_at
  BEFORE UPDATE ON newsletter_deals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function: Increment view count
CREATE OR REPLACE FUNCTION increment_deal_views(deal_uuid UUID)
RETURNS void AS $$
BEGIN
  UPDATE newsletter_deals
  SET view_count = view_count + 1
  WHERE id = deal_uuid;
END;
$$ LANGUAGE plpgsql;

-- Function: Increment click count
CREATE OR REPLACE FUNCTION increment_deal_clicks(deal_uuid UUID)
RETURNS void AS $$
BEGIN
  UPDATE newsletter_deals
  SET click_count = click_count + 1
  WHERE id = deal_uuid;
END;
$$ LANGUAGE plpgsql;

-- View: Active deals with stats
CREATE OR REPLACE VIEW active_deals AS
SELECT
  d.*,
  s.name as source_display_name,
  CASE
    WHEN d.expires_at IS NULL THEN true
    WHEN d.expires_at > NOW() THEN true
    ELSE false
  END as is_valid
FROM newsletter_deals d
LEFT JOIN newsletter_sources s ON d.source = s.name
WHERE d.is_active = true
  AND (d.expires_at IS NULL OR d.expires_at > NOW())
ORDER BY d.created_at DESC;

-- Insert default newsletter sources
INSERT INTO newsletter_sources (name, domain, type) VALUES
  ('VivaAerobus', 'vivaaerobus.com', 'airline'),
  ('Volaris', 'volaris.com', 'airline'),
  ('Aeromexico', 'aeromexico.com', 'airline'),
  ('Scott''s Cheap Flights', 'scottscheapflights.com', 'aggregator'),
  ('Secret Flying', 'secretflying.com', 'aggregator'),
  ('The Flight Deal', 'theflightdeal.com', 'aggregator'),
  ('Despegar', 'despegar.com', 'agency'),
  ('Best Day', 'bestday.com', 'agency'),
  ('Kayak', 'kayak.com', 'agency'),
  ('Booking.com', 'booking.com', 'hotel'),
  ('Royal Caribbean', 'royalcaribbean.com', 'cruise')
ON CONFLICT (domain) DO NOTHING;

-- RLS Policies (enable Row Level Security)
ALTER TABLE newsletter_deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE processed_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_clicks ENABLE ROW LEVEL SECURITY;

-- Public read access for deals
CREATE POLICY "Public can view active deals" ON newsletter_deals
  FOR SELECT USING (is_active = true);

-- Public read access for sources
CREATE POLICY "Public can view sources" ON newsletter_sources
  FOR SELECT USING (is_active = true);

-- Service role can do everything (for API)
CREATE POLICY "Service role full access deals" ON newsletter_deals
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access sources" ON newsletter_sources
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access emails" ON processed_emails
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access clicks" ON deal_clicks
  FOR ALL USING (auth.role() = 'service_role');
