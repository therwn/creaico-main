# CREAI Apps Deployment

## Cloudflare Pages

Use the GitHub repo connected to Pages and set:

- Framework preset: `Vite`
- Build command: `npm run build`
- Build output directory: `dist`
- Root directory: leave empty

Set the production custom domain to:

- `app.creai.co`

Add these environment variables in Cloudflare Pages:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Because the app uses client-side routing, keep [`public/_redirects`](/Users/onedio/Desktop/CREAI/Landing/public/_redirects) in place so `/admin` and `/apps/:slug` resolve to the SPA.

## Supabase

Create a Supabase project and run [`supabase/schema.sql`](/Users/onedio/Desktop/CREAI/Landing/supabase/schema.sql) in the SQL editor.

If the `apps` table already exists from an older setup, run this migration before the full schema file:

```sql
alter table public.apps
  add column if not exists stacks text[] not null default '{}',
  add column if not exists social_links jsonb not null default '[]'::jsonb,
  add column if not exists store_links jsonb not null default '[]'::jsonb;
```

In Supabase Auth:

- Enable Email auth
- Enable email/password sign-in
- Set the site URL to `https://app.creai.co`
- Add redirect URLs:
  - `https://app.creai.co/admin`
  - `http://localhost:5174/admin`
  - `http://localhost:5173/admin`
- Create a user in Supabase Auth:
  - Email: `root-admin@creai.co`
  - Password: `7410Abc+++`

The admin UI accepts:

- Username: `root-admin`
- Password: `7410Abc+++`

Internally, the username maps to `root-admin@creai.co` and signs in through Supabase Auth.

## What The Admin Needs

The `/admin` screen expects:

- authenticated Supabase users
- insert/update permission on `public.apps`
- realtime enabled for `public.apps` if you want live sync without refresh

## Notes

- Public directory only shows apps where `published = true`
- Detail pages live at `/apps/:slug`
- Social icons on detail pages only render when social links were added from admin
- Store badges only render when links were added from admin
