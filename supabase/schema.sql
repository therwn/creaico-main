create extension if not exists pgcrypto;

create table if not exists public.app_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.apps (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  short_description text not null default '',
  description text not null default '',
  category_id uuid references public.app_categories(id) on delete set null,
  category_ids uuid[] not null default '{}',
  logo_url text,
  accent_color text not null default '#c2ff29',
  stacks text[] not null default '{}',
  frameworks text[] not null default '{}',
  social_links jsonb not null default '{}'::jsonb,
  store_links jsonb not null default '{}'::jsonb,
  status text not null default 'draft' check (status in ('draft', 'published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.app_activity (
  id uuid primary key default gen_random_uuid(),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  actor_email text,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
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

alter table public.app_categories enable row level security;
alter table public.apps enable row level security;
alter table public.app_activity enable row level security;

drop policy if exists "public categories read" on public.app_categories;
create policy "public categories read"
on public.app_categories
for select
to public
using (true);

drop policy if exists "authenticated categories manage" on public.app_categories;
create policy "authenticated categories manage"
on public.app_categories
for all
to authenticated
using (true)
with check (true);

drop policy if exists "public apps read published" on public.apps;
create policy "public apps read published"
on public.apps
for select
to public
using (status = 'published');

drop policy if exists "authenticated apps manage" on public.apps;
create policy "authenticated apps manage"
on public.apps
for all
to authenticated
using (true)
with check (true);

drop policy if exists "authenticated activity read" on public.app_activity;
create policy "authenticated activity read"
on public.app_activity
for select
to authenticated
using (true);

drop policy if exists "authenticated activity insert" on public.app_activity;
create policy "authenticated activity insert"
on public.app_activity
for insert
to authenticated
with check (true);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'app-logos',
  'app-logos',
  true,
  5242880,
  array['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']
)
on conflict (id) do nothing;

drop policy if exists "public logo read" on storage.objects;
create policy "public logo read"
on storage.objects
for select
to public
using (bucket_id = 'app-logos');

drop policy if exists "authenticated logo upload" on storage.objects;
create policy "authenticated logo upload"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'app-logos');

drop policy if exists "authenticated logo update" on storage.objects;
create policy "authenticated logo update"
on storage.objects
for update
to authenticated
using (bucket_id = 'app-logos')
with check (bucket_id = 'app-logos');

drop policy if exists "authenticated logo delete" on storage.objects;
create policy "authenticated logo delete"
on storage.objects
for delete
to authenticated
using (bucket_id = 'app-logos');
