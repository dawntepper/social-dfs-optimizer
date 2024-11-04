-- Create projections test table
CREATE TABLE IF NOT EXISTS projection_tests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id TEXT NOT NULL,
  player_name TEXT NOT NULL,
  position TEXT NOT NULL,
  team TEXT NOT NULL,
  opponent TEXT NOT NULL,
  base_projection DECIMAL(10,2) NOT NULL,
  enhanced_projection DECIMAL(10,2),
  weather_modifier DECIMAL(10,4),
  vegas_modifier DECIMAL(10,4),
  ceiling DECIMAL(10,2),
  floor DECIMAL(10,2),
  confidence DECIMAL(10,4),
  insights JSONB,
  test_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  test_result TEXT,
  test_notes TEXT
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_projection_tests_player ON projection_tests(player_id);
CREATE INDEX IF NOT EXISTS idx_projection_tests_date ON projection_tests(test_date);

-- Create view for test results analysis
CREATE OR REPLACE VIEW projection_test_results AS
SELECT 
  position,
  COUNT(*) as total_tests,
  AVG(enhanced_projection - base_projection) as avg_adjustment,
  AVG(weather_modifier) as avg_weather_impact,
  AVG(vegas_modifier) as avg_vegas_impact,
  AVG(confidence) as avg_confidence
FROM projection_tests
GROUP BY position;