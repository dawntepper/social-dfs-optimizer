-- Create slate table first
CREATE TABLE IF NOT EXISTS slate (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  site TEXT NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create player_pool table with proper foreign key
CREATE TABLE IF NOT EXISTS player_pool (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  position TEXT NOT NULL,
  team TEXT NOT NULL,
  opponent TEXT NOT NULL,
  salary INTEGER NOT NULL,
  projected_points DECIMAL(10,2) NOT NULL,
  ownership DECIMAL(10,2),
  slate_id UUID NOT NULL REFERENCES slate(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_player_pool_slate ON player_pool(slate_id);
CREATE INDEX IF NOT EXISTS idx_player_pool_team ON player_pool(team);
CREATE INDEX IF NOT EXISTS idx_player_pool_position ON player_pool(position);

-- Enable RLS
ALTER TABLE player_pool ENABLE ROW LEVEL SECURITY;
ALTER TABLE slate ENABLE ROW LEVEL SECURITY;

-- Create policies with unique names
CREATE POLICY "player_pool_read_policy" 
  ON player_pool
  FOR SELECT 
  TO authenticated, anon 
  USING (true);

CREATE POLICY "player_pool_insert_policy" 
  ON player_pool
  FOR INSERT 
  TO authenticated, anon 
  WITH CHECK (true);

CREATE POLICY "slate_read_policy" 
  ON slate
  FOR SELECT 
  TO authenticated, anon 
  USING (true);

CREATE POLICY "slate_insert_policy" 
  ON slate
  FOR INSERT 
  TO authenticated, anon 
  WITH CHECK (true);

-- Add triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_slate_updated_at
  BEFORE UPDATE ON slate
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_player_pool_updated_at
  BEFORE UPDATE ON player_pool
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();