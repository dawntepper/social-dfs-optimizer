-- First create the historical_weather table
create table if not exists public.historical_weather (
  id uuid primary key default uuid_generate_v4(),
  team text not null unique,
  data jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add index for team lookups
create index if not exists historical_weather_team_idx on public.historical_weather(team);

-- Add RLS policies
alter table public.historical_weather enable row level security;

create policy "Allow public read access to historical_weather"
  on public.historical_weather for select
  to anon
  using (true);

-- Add function to automatically update the updated_at timestamp
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Add trigger for updated_at
create trigger update_historical_weather_updated_at
  before update on public.historical_weather
  for each row
  execute function public.update_updated_at_column();

-- Then update the weather_data table to reference historical_weather
alter table public.weather_data
  add column if not exists historical_id uuid references public.historical_weather(id),
  add column if not exists historical_comparison jsonb;