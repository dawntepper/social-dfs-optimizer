-- Update ai_analysis_cache table with improved structure
create table if not exists public.ai_analysis_cache (
  id uuid primary key default uuid_generate_v4(),
  cache_key text not null,
  analysis_type text not null,
  analysis jsonb not null,
  context_data jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  expires_at timestamp with time zone not null,
  confidence numeric(3,2) default 0.7
);

-- Add indexes for better query performance
create index if not exists ai_analysis_cache_key_idx on public.ai_analysis_cache(cache_key);
create index if not exists ai_analysis_cache_type_idx on public.ai_analysis_cache(analysis_type);
create index if not exists ai_analysis_cache_expires_idx on public.ai_analysis_cache(expires_at);

-- Enable RLS
alter table public.ai_analysis_cache enable row level security;

-- Create read-only policy
create policy "Allow public read access to ai_analysis_cache"
  on public.ai_analysis_cache for select
  to anon
  using (true);

-- Add function to clean expired cache entries
create or replace function clean_expired_ai_cache() returns trigger as $$
begin
  delete from public.ai_analysis_cache
  where expires_at < now();
  return new;
end;
$$ language plpgsql;

-- Create trigger to clean expired cache entries
create trigger clean_expired_ai_cache_trigger
  after insert on public.ai_analysis_cache
  execute function clean_expired_ai_cache();