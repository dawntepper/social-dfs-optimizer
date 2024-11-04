-- Add historical weather table
create table if not exists public.historical_weather (
  id uuid primary key default uuid_generate_v4(),
  team text not null unique,
  data jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add index for team lookups
create index if not exists historical_weather_team_idx on public.historical_weather(team);

-- Enable RLS
alter table public.historical_weather enable row level security;

-- Create read-only policy
create policy "Allow public read access to historical_weather"
  on public.historical_weather for select
  to anon
  using (true);