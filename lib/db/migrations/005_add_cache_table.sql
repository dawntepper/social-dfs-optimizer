-- Create cache table
CREATE TABLE IF NOT EXISTS cache (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add index for expiration cleanup
CREATE INDEX IF NOT EXISTS idx_cache_expires_at ON cache(expires_at);

-- Add function to clean expired cache entries
CREATE OR REPLACE FUNCTION clean_expired_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM cache
  WHERE expires_at <= CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to periodically clean expired cache
CREATE OR REPLACE FUNCTION trigger_clean_expired_cache()
RETURNS trigger AS $$
BEGIN
  IF (SELECT COUNT(*) FROM cache WHERE expires_at <= CURRENT_TIMESTAMP) > 1000 THEN
    PERFORM clean_expired_cache();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER clean_expired_cache_trigger
AFTER INSERT ON cache
EXECUTE FUNCTION trigger_clean_expired_cache();