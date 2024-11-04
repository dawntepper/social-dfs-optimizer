-- Enable necessary extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pg_stat_statements";

-- Players table
create table if not exists public.players (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  position text not null,
  team text not null,
  opponent text,
  salary integer,
  projected_points decimal,
  status text default 'ACTIVE',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Player Stats table
create table if not exists public.player_stats (
  id uuid primary key default uuid_generate_v4(),
  player_id uuid references public.players(id),
  game_date date not null,
  stats_data jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Weather Data table
create table if not exists public.weather_data (
  id uuid primary key default uuid_generate_v4(),
  game_id text not null,
  temperature integer,
  wind_speed integer,
  precipitation decimal,
  is_dome boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Vegas Data table
create table if not exists public.vegas_data (
  id uuid primary key default uuid_generate_v4(),
  game_id text not null,
  total decimal,
  spread decimal,
  team_total decimal,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Social Sentiment table
create table if not exists public.social_sentiment (
  id uuid primary key default uuid_generate_v4(),
  player_id uuid references public.players(id),
  sentiment_score decimal,
  beat_writer_sentiment decimal,
  trending_score decimal,
  mention_count integer,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- AI Analysis Cache table
create table if not exists public.ai_analysis_cache (
  id uuid primary key default uuid_generate_v4(),
  player_id uuid references public.players(id),
  game_id text,
  analysis_type text not null,
  analysis_data jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  expires_at timestamp with time zone not null
);

-- Historical Correlations table
create table if not exists public.historical_correlations (
  id uuid primary key default uuid_generate_v4(),
  home_team text not null,
  away_team text not null,
  correlation_data jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Sync Logs table
create table if not exists public.sync_logs (
  id uuid primary key default uuid_generate_v4(),
  service text not null,
  status text not null,
  error_message text,
  started_at timestamp with time zone default timezone('utc'::text, now()) not null,
  completed_at timestamp with time zone
);

-- Enable RLS
alter table public.players enable row level security;
alter table public.player_stats enable row level security;
alter table public.weather_data enable row level security;
alter table public.vegas_data enable row level security;
alter table public.social_sentiment enable row level security;
alter table public.ai_analysis_cache enable row level security;
alter table public.historical_correlations enable row level security;
alter table public.sync_logs enable row level security;

-- Create policies
create policy "Allow public read access to players"
  on public.players for select
  to anon
  using (true);

create policy "Allow public read access to player_stats"
  on public.player_stats for select
  to anon
  using (true);

create policy "Allow public read access to weather_data"
  on public.weather_data for select
  to anon
  using (true);

create policy "Allow public read access to vegas_data"
  on public.vegas_data for select
  to anon
  using (true);

create policy "Allow public read access to social_sentiment"
  on public.social_sentiment for select
  to anon
  using (true);

create policy "Allow public read access to ai_analysis_cache"
  on public.ai_analysis_cache for select
  to anon
  using (true);

create policy "Allow public read access to historical_correlations"
  on public.historical_correlations for select
  to anon
  using (true);

create policy "Allow public read access to sync_logs"
  on public.sync_logs for select
  to anon
  using (true);

-- Create indexes for better performance
create index if not exists players_name_idx on public.players(name);
create index if not exists players_team_idx on public.players(team);
create index if not exists player_stats_player_id_idx on public.player_stats(player_id);
create index if not exists weather_data_game_id_idx on public.weather_data(game_id);
create index if not exists vegas_data_game_id_idx on public.vegas_data(game_id);
create index if not exists social_sentiment_player_id_idx on public.social_sentiment(player_id);
create index if not exists ai_analysis_cache_player_id_idx on public.ai_analysis_cache(player_id);
create index if not exists ai_analysis_cache_game_id_idx on public.ai_analysis_cache(game_id);
create index if not exists historical_correlations_teams_idx on public.historical_correlations(home_team, away_team);