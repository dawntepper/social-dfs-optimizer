-- Create API requests table
CREATE TABLE IF NOT EXISTS api_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  api_name TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  status_code INTEGER NOT NULL,
  response_time INTEGER NOT NULL,
  cost DECIMAL(10,4) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_api_requests_api_name ON api_requests(api_name);
CREATE INDEX IF NOT EXISTS idx_api_requests_created_at ON api_requests(created_at);

-- Create view for daily usage aggregation
CREATE OR REPLACE VIEW daily_api_usage AS
SELECT 
  DATE_TRUNC('day', created_at) AS date,
  api_name,
  COUNT(*) AS request_count,
  SUM(cost) AS total_cost,
  AVG(response_time) AS avg_response_time
FROM api_requests
GROUP BY DATE_TRUNC('day', created_at), api_name;

-- Add function to clean old data
CREATE OR REPLACE FUNCTION clean_old_api_requests(days_to_keep INTEGER)
RETURNS void AS $$
BEGIN
  DELETE FROM api_requests
  WHERE created_at < CURRENT_TIMESTAMP - (days_to_keep || ' days')::INTERVAL;
END;
$$ LANGUAGE plpgsql;