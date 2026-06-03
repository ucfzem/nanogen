import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://YOUR_PROJECT.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_ANON_KEY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const isSupabaseConfigured = () => {
  return supabaseUrl !== 'https://YOUR_PROJECT.supabase.co' && 
         supabaseAnonKey !== 'YOUR_ANON_KEY'
}

export const SETUP_SQL = `
create table posts (
  id uuid default gen_random_uuid() primary key,
  author text not null,
  email text,
  content text not null,
  image_url text,
  tags text[] default '{}',
  likes integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

create table comments (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references posts(id) on delete cascade,
  author text not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

create table emails (
  id uuid default gen_random_uuid() primary key,
  email text unique not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table posts enable row level security;
alter table comments enable row level security;
alter table emails enable row level security;

create policy "Public read on posts" on posts for select using (true);
create policy "Public insert on posts" on posts for insert with check (true);
create policy "Public update on posts" on posts for update using (true);

create policy "Public read on comments" on comments for select using (true);
create policy "Public insert on comments" on comments for insert with check (true);

create policy "Public insert on emails" on emails for insert with check (true);
create policy "Public read on emails" on emails for select using (true);
`
