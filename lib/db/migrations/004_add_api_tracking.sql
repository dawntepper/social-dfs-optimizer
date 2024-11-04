-- Create API tracking table
create table if not exists public.api_requests (
  id uuid primary key default uuid_generate_v4(),
  api_name text not null,
  endpoint text not null,
  status_code integer not null,
  response_time integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  cost numeric(10,4) default 0
);

-- Add indexes for better query performance
create index if not exists api_requests_api_name_idx on public.api_requests(api_name);
create index if not exists api_requests_created_at_idx on public.api_requests(created_at);

-- Add view for daily usage
create or replace view public.daily_api_usage as
select 
  date_trunc('day', created_at) as date,
  api_name,
  count(*) as request_count,
  sum(cost) as total_cost,
  avg(response_time) as avg_response_time
from public.api_requests
group by date_trunc('day', created_at), api_name;