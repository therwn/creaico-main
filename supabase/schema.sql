create extension if not exists pgcrypto;

create table if not exists public.apps (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  category text not null,
  status text not null,
  summary text not null,
  audience text not null,
  stacks text[] not null default '{}',
  social_links jsonb not null default '[]'::jsonb,
  store_links jsonb not null default '[]'::jsonb,
  url text,
  accent text not null default '#c2ff29',
  featured boolean not null default false,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists apps_set_updated_at on public.apps;
create trigger apps_set_updated_at
before update on public.apps
for each row
execute function public.set_updated_at();

alter table public.apps enable row level security;

drop policy if exists "Public can read published apps" on public.apps;
create policy "Public can read published apps"
on public.apps
for select
using (published = true);

drop policy if exists "Authenticated users can manage apps" on public.apps;
create policy "Authenticated users can manage apps"
on public.apps
for all
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');
