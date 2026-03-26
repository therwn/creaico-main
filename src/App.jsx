'use client'

import { useEffect, useMemo, useState } from 'react'
import { gsap } from 'gsap'
import * as Svgl from '@ridemountainpig/svgl-react'
import {
  IconArrowLeft,
  IconHome,
  IconLayoutDashboard,
  IconLayoutGrid,
  IconMoon,
  IconPlus,
  IconSun,
  IconTable,
} from '@tabler/icons-react'
import {
  Badge,
  Button,
  Card,
  Divider,
  Metric,
  MultiSelect,
  MultiSelectItem,
  Select,
  SelectItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  Text,
  TextInput,
  Textarea,
  Title,
} from '@tremor/react'
import { appCategories, brandContent, frameworkOptions, seedApps, stackOptions } from './content'
import { isSupabaseConfigured, supabase } from './lib/supabase'
import CreaiLogo from './CreaiLogo'

const initialForm = {
  name: '',
  slug: '',
  category: 'AI Workspace',
  status: 'Beta',
  summary: '',
  audience: 'Public',
  stacks: [],
  frameworks: [],
  url: '',
  website: '',
  x: '',
  instagram: '',
  github: '',
  webApp: '',
  appStore: '',
  googlePlay: '',
  accent: '#c2ff29',
  featured: false,
  published: true,
}

const staticAdminUsername = 'root-admin'
const staticAdminEmail = 'root-admin@creai.co'

const landingScanLines = [
  { left: '10%', duration: '8.8s', delay: '1.7s', strength: 0.62 },
  { left: '30%', duration: '10.4s', delay: '0.4s', strength: 0.78 },
  { left: '50%', duration: '7.6s', delay: '2.9s', strength: 0.52 },
  { left: '70%', duration: '9.2s', delay: '1.1s', strength: 0.72 },
  { left: '90%', duration: '8.1s', delay: '3.6s', strength: 0.58 },
]

const adminSections = [
  { id: 'dashboard', label: 'Dashboard', icon: IconLayoutDashboard },
  { id: 'create', label: 'Add New App', icon: IconPlus },
  { id: 'update', label: 'Update Apps', icon: IconTable },
]

const formatDate = (value) =>
  new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

const buildPath = () => (typeof window === 'undefined' ? '/' : window.location.pathname.replace(/\/+$/, '') || '/')
const buildHost = () => (typeof window === 'undefined' ? '' : window.location.hostname.toLowerCase())

const parsePath = (pathname, hostname) => {
  if (pathname === '/admin') return { view: 'admin' }
  if (pathname.startsWith('/apps/')) return { view: 'detail', slug: pathname.replace('/apps/', '') }
  if (pathname === '/directory' || hostname === 'app.creai.co') return { view: 'directory' }
  return { view: 'landing' }
}

const socialIcons = {
  Instagram: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3.25" y="3.25" width="17.5" height="17.5" rx="5.25" />
      <circle cx="12" cy="12" r="4.25" />
      <circle cx="17.25" cy="6.75" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  ),
  X: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 4L10.8 13.1L4.7 20H7.4L12 14.8L15.9 20H20L12.8 10.4L18.5 4H15.8L11.6 8.7L8.1 4Z" />
    </svg>
  ),
  GitHub: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2.75C6.89 2.75 2.75 6.89 2.75 12C2.75 16.08 5.39 19.54 9.05 20.76C9.51 20.84 9.67 20.57 9.67 20.34V18.72C6.98 19.31 6.42 17.57 6.42 17.57C5.98 16.45 5.34 16.15 5.34 16.15C4.46 15.55 5.41 15.56 5.41 15.56C6.38 15.63 6.9 16.55 6.9 16.55C7.77 18.03 9.17 17.6 9.73 17.34C9.82 16.71 10.07 16.28 10.35 16.03C8.2 15.79 5.95 14.95 5.95 11.19C5.95 10.12 6.33 9.24 6.95 8.56C6.85 8.32 6.51 7.34 7.05 6.02C7.05 6.02 7.88 5.76 9.65 6.96C10.44 6.74 11.29 6.63 12.14 6.63C12.99 6.63 13.84 6.74 14.63 6.96C16.4 5.76 17.23 6.02 17.23 6.02C17.77 7.34 17.43 8.32 17.33 8.56C17.95 9.24 18.33 10.12 18.33 11.19C18.33 14.96 16.07 15.78 13.92 16.02C14.27 16.33 14.58 16.95 14.58 17.9V20.34C14.58 20.57 14.74 20.84 15.2 20.76C18.86 19.54 21.5 16.08 21.5 12C21.5 6.89 17.36 2.75 12 2.75Z" />
    </svg>
  ),
  Website: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="8.25" />
      <path d="M3.75 12H20.25M12 3.75C14.34 6.02 15.67 8.94 15.75 12C15.67 15.06 14.34 17.98 12 20.25C9.66 17.98 8.33 15.06 8.25 12C8.33 8.94 9.66 6.02 12 3.75Z" />
    </svg>
  ),
}

const stackMeta = Object.fromEntries(stackOptions.map((item) => [item.label, item]))
const frameworkMeta = Object.fromEntries(frameworkOptions.map((item) => [item.label, item]))

const logoComponents = {
  React: Svgl.ReactLight,
  'Next.js': Svgl.Nextjs,
  TypeScript: Svgl.TypeScript,
  'Tailwind CSS': Svgl.TailwindCSS,
  Supabase: Svgl.Supabase,
  'Node.js': Svgl.Nodejs,
  OpenAI: Svgl.OpenAIDark,
  'Cloudflare Workers': Svgl.CloudflareWorkers,
  Cloudflare: Svgl.Cloudflare,
  'Framer Motion': Svgl.FramerLight,
  Stripe: Svgl.Stripe,
  Postgres: Svgl.PostgreSQL,
  Swift: Svgl.Swift,
  Firebase: Svgl.Firebase,
  Flutter: Svgl.Flutter,
  Expo: Svgl.Expo,
}

const mapAppRow = (row) => ({
  id: row.id,
  name: row.name,
  slug: row.slug,
  category: row.category,
  status: row.status,
  summary: row.summary,
  audience: row.audience,
  updatedAt: row.updated_at,
  url: row.url,
  stacks: row.stacks || [],
  frameworks: row.frameworks || [],
  socialLinks: row.social_links || [],
  storeLinks: row.store_links || [],
  featured: row.featured,
  accent: row.accent,
  published: row.published,
})

function useSupabaseApps() {
  const [apps, setApps] = useState(seedApps)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(isSupabaseConfigured)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return undefined

    let mounted = true

    const load = async () => {
      setLoading(true)
      const [{ data: authData }, { data, error: appsError }] = await Promise.all([
        supabase.auth.getSession(),
        supabase.from('apps').select('*').order('featured', { ascending: false }).order('updated_at', { ascending: false }),
      ])

      if (!mounted) return

      setSession(authData.session)
      if (appsError) {
        setError(appsError.message)
        setLoading(false)
        return
      }

      setApps(data.map(mapAppRow))
      setLoading(false)
    }

    load()

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
    })

    const channel = supabase
      .channel('creai-apps')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'apps' }, load)
      .subscribe()

    return () => {
      mounted = false
      authListener.subscription.unsubscribe()
      supabase.removeChannel(channel)
    }
  }, [])

  return { apps, session, loading, error, setApps, setSession }
}

function ThemeToggle({ themeMode, onThemeChange }) {
  return (
    <div className="inline-flex rounded-full border border-zinc-800 bg-zinc-950 p-1">
      {['system', 'dark', 'light'].map((mode) => (
        <button
          key={mode}
          type="button"
          onClick={() => onThemeChange(mode)}
          className={`inline-flex h-9 w-9 items-center justify-center rounded-full transition ${
            themeMode === mode ? 'bg-lime-300 text-black' : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100'
          }`}
        >
          {mode === 'dark' ? <IconMoon size={16} /> : mode === 'light' ? <IconSun size={16} /> : <span className="text-[10px] font-bold">SYS</span>}
        </button>
      ))}
    </div>
  )
}

function BrandLockup({ subtitle, onClick }) {
  return (
    <button className="flex w-full items-center gap-4 text-left" onClick={onClick}>
      <img src="/creailogo.svg" alt="CREAI" className="h-11 w-11 rounded-xl bg-zinc-900 p-2" />
      <span className="grid gap-1">
        <strong className="text-sm font-semibold tracking-[0.22em] text-zinc-50">CREAI</strong>
        <small className="text-xs uppercase tracking-[0.24em] text-zinc-500">{subtitle}</small>
      </span>
    </button>
  )
}

function AdminSectionHeader({ eyebrow, title, description }) {
  return (
    <div className="grid gap-2">
      <Badge color="lime">{eyebrow}</Badge>
      <Title>{title}</Title>
      {description ? <Text>{description}</Text> : null}
    </div>
  )
}

function TokenGlyph({ label, registry }) {
  const meta = registry[label] || { short: label.slice(0, 2).toUpperCase(), tone: '#c2ff29' }
  const Logo = logoComponents[label]

  return (
    <span
      className="inline-flex h-6 w-6 items-center justify-center rounded-md border text-[10px] font-bold uppercase"
      style={{ borderColor: `${meta.tone}66`, color: meta.tone, backgroundColor: `${meta.tone}12` }}
    >
      {Logo ? <Logo className="h-3.5 w-3.5" /> : meta.short}
    </span>
  )
}

function AppStatusBadge({ status }) {
  const tone = status === 'Live' ? 'emerald' : status === 'Beta' ? 'amber' : status === 'Internal' ? 'blue' : 'gray'
  return <Badge color={tone}>{status}</Badge>
}

function InfoCard({ children }) {
  return (
    <Card className="border !border-zinc-800/80 !bg-zinc-950 shadow-none">
      <Text>{children}</Text>
    </Card>
  )
}

function openExternal(url) {
  if (typeof window !== 'undefined') {
    window.open(url, '_blank', 'noopener,noreferrer')
  }
}

function SocialButtons({ links }) {
  if (!links?.length) return null

  return (
    <div className="flex flex-wrap gap-2">
      {links.map((item) => (
        <Button key={`${item.label}-${item.url}`} type="button" variant="light" size="xs" onClick={() => openExternal(item.url)}>
          <span className="inline-flex h-4 w-4 items-center justify-center [&_svg]:h-4 [&_svg]:w-4 [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-[1.8]">
            {socialIcons[item.label] || socialIcons.Website}
          </span>
          {item.label}
        </Button>
      ))}
    </div>
  )
}

function StoreButtons({ links }) {
  if (!links?.length) return null

  return (
    <div className="flex flex-wrap gap-2">
      {links.map((item) => (
        <Button key={`${item.label}-${item.url}`} type="button" variant="secondary" size="sm" onClick={() => openExternal(item.url)}>
          {item.label}
        </Button>
      ))}
    </div>
  )
}

function LandingView() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const syncPreference = () => setReducedMotion(media.matches)

    syncPreference()
    setIsLoaded(true)
    media.addEventListener('change', syncPreference)

    return () => media.removeEventListener('change', syncPreference)
  }, [])

  useEffect(() => {
    if (reducedMotion) return undefined

    const ctx = gsap.context(() => {
      gsap.to('.landing-ambient-one', {
        xPercent: 10,
        yPercent: 8,
        scale: 1.08,
        rotation: 8,
        duration: 14,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      })

      gsap.to('.landing-ambient-two', {
        xPercent: -12,
        yPercent: -10,
        scale: 1.14,
        rotation: -10,
        duration: 16,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      })

      gsap.to('.landing-ambient-three', {
        xPercent: 6,
        yPercent: -7,
        scale: 1.18,
        opacity: 0.78,
        rotation: 6,
        duration: 12,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      })
    })

    return () => ctx.revert()
  }, [reducedMotion])

  return (
    <main className={`landing-shell ${isLoaded ? 'is-loaded' : ''}`}>
      <div className="landing-noise" aria-hidden="true" />
      <div className="landing-grid-field" aria-hidden="true" />
      <div className="landing-ambient landing-ambient-one" aria-hidden="true" />
      <div className="landing-ambient landing-ambient-two" aria-hidden="true" />
      <div className="landing-ambient landing-ambient-three" aria-hidden="true" />
      <div className="landing-line-cluster" aria-hidden="true">
        {landingScanLines.map((line, index) => (
          <span
            key={`landing-${line.left}-${index}`}
            className="landing-scan-line"
            style={{
              '--line-left': line.left,
              '--line-duration': line.duration,
              '--line-delay': line.delay,
              '--line-opacity': line.strength,
            }}
          />
        ))}
      </div>

      <section className="landing-hero">
        <div className="landing-hero-visual">
          <div className="landing-logo-stage">
            <CreaiLogo />
          </div>
          <p className="landing-hero-eyebrow">{brandContent.eyebrow}</p>
          <p className="landing-logo-caption">{brandContent.caption}</p>
        </div>

        <div className="landing-hero-copy">
          <div className="landing-social-list" aria-label="Social links">
            {brandContent.socialLinks.map((item) => (
              <a key={item.label} href={item.url} target="_blank" rel="noreferrer" aria-label={item.label}>
                <span className="social-icon">{socialIcons[item.label]}</span>
              </a>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}

function WorkspaceSidebar({ admin = false, section, onSectionChange, dashboardView, onDashboardViewChange, onNavigate, themeMode, onThemeChange }) {
  return (
    <aside className="sticky top-0 hidden h-screen flex-col gap-4 overflow-y-auto border-r border-zinc-800/80 bg-black/95 p-5 xl:flex">
      <Card className="border !border-zinc-800/80 !bg-zinc-950 shadow-none">
        <div className="grid gap-5">
          <BrandLockup subtitle={admin ? 'Admin Control' : 'App Directory'} onClick={() => onNavigate(admin ? '/admin' : '/directory')} />
          <div className="flex items-center justify-between gap-3">
            <Badge color="lime">{admin ? 'Tremor Admin' : 'Tremor Directory'}</Badge>
            <ThemeToggle themeMode={themeMode} onThemeChange={onThemeChange} />
          </div>
          <Divider />
          {admin ? (
            <div className="grid gap-3">
              {adminSections.map((item) => {
                const Icon = item.icon
                return (
                  <div key={item.id} className="grid gap-2">
                    <Button type="button" variant={section === item.id ? 'primary' : 'light'} className="justify-start" onClick={() => onSectionChange(item.id)}>
                      <Icon size={16} />
                      {item.label}
                    </Button>
                    {item.id === 'dashboard' && section === 'dashboard' ? (
                      <div className="grid gap-2 pl-3">
                        {[
                          ['overview', 'Overview'],
                          ['recent', 'Recent'],
                          ['taxonomy', 'Taxonomy'],
                        ].map(([id, label]) => (
                          <Button key={id} type="button" variant={dashboardView === id ? 'secondary' : 'light'} className="justify-start" onClick={() => onDashboardViewChange(id)}>
                            {label}
                          </Button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="grid gap-2">
              <Button variant="primary" className="justify-start" onClick={() => onNavigate('/directory')}>
                <IconLayoutGrid size={16} />
                Directory
              </Button>
              <Button variant="light" className="justify-start" onClick={() => onNavigate('/admin')}>
                <IconLayoutDashboard size={16} />
                Admin
              </Button>
              <Button variant="secondary" className="justify-start" onClick={() => onNavigate('/')}>
                <IconHome size={16} />
                CREAI landing
              </Button>
            </div>
          )}
        </div>
      </Card>

      <Card className="border !border-zinc-800/80 !bg-zinc-950 shadow-none">
        <div className="grid gap-3">
          <Text>{admin ? 'Workspace status' : 'Studio channels'}</Text>
          {admin ? (
            <>
              <Metric>{section === 'dashboard' ? 'Focus' : 'Edit'}</Metric>
              <Text>Internal operations, publishing, and catalog management live here.</Text>
            </>
          ) : (
            <div className="flex flex-wrap gap-2">
              {brandContent.socialLinks.map((item) => (
                <Button key={item.label} type="button" variant="light" size="xs" onClick={() => openExternal(item.url)}>
                  {item.label}
                </Button>
              ))}
            </div>
          )}
        </div>
      </Card>
    </aside>
  )
}

function WorkspaceTopBar({ label, onNavigate, themeMode, onThemeChange, admin = false }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-zinc-800/80 bg-zinc-950 p-4 xl:hidden">
      <BrandLockup subtitle={label} onClick={() => onNavigate(admin ? '/admin' : '/directory')} />
      <ThemeToggle themeMode={themeMode} onThemeChange={onThemeChange} />
    </div>
  )
}

function PublicDirectory({ apps, category, onCategoryChange, onNavigate, loading, themeMode, onThemeChange }) {
  const [query, setQuery] = useState('')

  const visibleApps = useMemo(
    () =>
      apps.filter((app) => {
        const categoryMatch = category === 'All' || app.category === category
        const queryMatch = !query.trim() || `${app.name} ${app.summary}`.toLowerCase().includes(query.toLowerCase())
        return app.published && categoryMatch && queryMatch
      }),
    [apps, category, query],
  )

  const recentApps = useMemo(
    () => [...apps].filter((app) => app.published).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 4),
    [apps],
  )

  return (
    <section className="grid gap-6">
      <WorkspaceTopBar label="Directory" onNavigate={onNavigate} themeMode={themeMode} onThemeChange={onThemeChange} />

      <Card className="border !border-zinc-800/80 !bg-zinc-950 shadow-none">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
          <div className="grid gap-4">
            <Badge color="lime">Public Catalog</Badge>
            <Title>Launch-ready apps, prototypes, and internal products.</Title>
            <Text>A fresh Tremor-first directory for the CREAI product ecosystem, separate from the landing page visual system.</Text>
            <TextInput value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search apps, summaries, or internal launches" />
            <div className="flex flex-wrap gap-2">
              {appCategories.map((item) => (
                <Button key={item} type="button" size="xs" variant={category === item ? 'primary' : 'light'} onClick={() => onCategoryChange(item)}>
                  {item}
                </Button>
              ))}
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-2">
            <Card className="border !border-zinc-800/80 !bg-zinc-900 shadow-none">
              <Text>Published apps</Text>
              <Metric>{apps.filter((app) => app.published).length}</Metric>
            </Card>
            <Card className="border !border-zinc-800/80 !bg-zinc-900 shadow-none">
              <Text>AI workspaces</Text>
              <Metric>{apps.filter((app) => app.published && app.category === 'AI Workspace').length}</Metric>
            </Card>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_360px]">
        <Card className="border !border-zinc-800/80 !bg-zinc-950 shadow-none">
          <AdminSectionHeader eyebrow="Taxonomy" title="Category map" description="Active categories across the current published catalog." />
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {appCategories.filter((item) => item !== 'All').map((item) => (
              <Card key={item} className="border !border-zinc-800/80 !bg-zinc-900 shadow-none">
                <Text>{item}</Text>
                <Metric>{apps.filter((app) => app.published && app.category === item).length}</Metric>
              </Card>
            ))}
          </div>
        </Card>

        <Card className="border !border-zinc-800/80 !bg-zinc-950 shadow-none">
          <AdminSectionHeader eyebrow="Recent" title="Recently updated" description="Latest app activity across the CREAI product shelf." />
          <div className="grid gap-3">
            {recentApps.map((app) => (
              <div key={app.id} className="flex items-start justify-between gap-3 rounded-xl border border-zinc-800/80 bg-zinc-900 p-4">
                <div className="grid gap-1">
                  <Text>{app.name}</Text>
                  <Badge color="gray">{app.category}</Badge>
                </div>
                <Text>{formatDate(app.updatedAt)}</Text>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {loading ? <InfoCard>Loading app inventory...</InfoCard> : null}

      <div className="grid gap-4 xl:grid-cols-2">
        {visibleApps.map((app) => (
          <Card key={app.id} className="border !border-zinc-800/80 !bg-zinc-950 shadow-none" style={{ boxShadow: `inset 0 0 0 1px ${app.accent}22` }}>
            <div className="grid gap-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-2">
                  <Badge color="gray">{app.category}</Badge>
                  <AppStatusBadge status={app.status} />
                  <Badge color="stone">{app.audience}</Badge>
                </div>
                {app.featured ? <Badge color="lime">Featured</Badge> : null}
              </div>
              <div className="grid gap-2">
                <Title>{app.name}</Title>
                <Text>{app.summary}</Text>
              </div>
              <div className="flex flex-wrap gap-2">
                {app.stacks.slice(0, 4).map((stack) => (
                  <Badge key={stack} color="gray">
                    {stack}
                  </Badge>
                ))}
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <Text>Updated {formatDate(app.updatedAt)}</Text>
                <Button type="button" variant="secondary" onClick={() => onNavigate(`/apps/${app.slug}`)}>
                  View details
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  )
}

function AppDetail({ app, relatedApps, onNavigate, themeMode, onThemeChange }) {
  if (!app) {
    return (
      <section className="grid gap-6">
        <WorkspaceTopBar label="App Detail" onNavigate={onNavigate} themeMode={themeMode} onThemeChange={onThemeChange} />
        <InfoCard>This app could not be found or is not published yet.</InfoCard>
      </section>
    )
  }

  return (
    <section className="grid gap-6">
      <WorkspaceTopBar label="App Detail" onNavigate={onNavigate} themeMode={themeMode} onThemeChange={onThemeChange} />

      <div className="flex flex-wrap gap-3">
        <Button type="button" variant="light" onClick={() => onNavigate('/directory')}>
          <IconArrowLeft size={16} />
          Back to directory
        </Button>
      </div>

      <Card className="border !border-zinc-800/80 !bg-zinc-950 shadow-none" style={{ boxShadow: `inset 0 0 0 1px ${app.accent}22` }}>
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_340px]">
          <div className="grid gap-4">
            <div className="flex flex-wrap gap-2">
              <Badge color="gray">{app.category}</Badge>
              <AppStatusBadge status={app.status} />
              <Badge color="stone">{app.audience}</Badge>
            </div>
            <Title>{app.name}</Title>
            <Text>{app.summary}</Text>
            <SocialButtons links={app.socialLinks} />
            <StoreButtons links={app.storeLinks} />
          </div>
          <div className="grid gap-4">
            <Card className="border !border-zinc-800/80 !bg-zinc-900 shadow-none">
              <Text>Updated</Text>
              <Metric>{formatDate(app.updatedAt)}</Metric>
            </Card>
            <Card className="border !border-zinc-800/80 !bg-zinc-900 shadow-none">
              <Text>Stack count</Text>
              <Metric>{app.stacks.length}</Metric>
            </Card>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="border !border-zinc-800/80 !bg-zinc-950 shadow-none">
          <AdminSectionHeader eyebrow="Build" title="Stack" description="Core systems behind this app." />
          <div className="flex flex-wrap gap-2">
            {app.stacks.length ? app.stacks.map((stack) => <Badge key={stack} color="gray">{stack}</Badge>) : <Text>No stack information yet.</Text>}
          </div>
        </Card>
        <Card className="border !border-zinc-800/80 !bg-zinc-950 shadow-none">
          <AdminSectionHeader eyebrow="Build" title="Frameworks" description="Primary frameworks used across the product build." />
          <div className="flex flex-wrap gap-2">
            {app.frameworks.length ? app.frameworks.map((framework) => <Badge key={framework} color="gray">{framework}</Badge>) : <Text>No frameworks listed yet.</Text>}
          </div>
        </Card>
      </div>

      <Card className="border !border-zinc-800/80 !bg-zinc-950 shadow-none">
        <AdminSectionHeader eyebrow="Explore" title="More from CREAI" description="Related releases and systems from the directory." />
        <div className="grid gap-4 xl:grid-cols-2">
          {relatedApps.map((item) => (
            <Card key={item.id} className="border !border-zinc-800/80 !bg-zinc-900 shadow-none">
              <div className="grid gap-4">
                <div className="flex flex-wrap gap-2">
                  <Badge color="gray">{item.category}</Badge>
                  <AppStatusBadge status={item.status} />
                </div>
                <div className="grid gap-2">
                  <Title>{item.name}</Title>
                  <Text>{item.summary}</Text>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <Text>{formatDate(item.updatedAt)}</Text>
                  <Button type="button" variant="secondary" onClick={() => onNavigate(`/apps/${item.slug}`)}>
                    View details
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Card>
    </section>
  )
}

function SetupPanel({ onNavigate, themeMode, onThemeChange }) {
  return (
    <section className="grid gap-6">
      <WorkspaceTopBar label="Setup" onNavigate={onNavigate} themeMode={themeMode} onThemeChange={onThemeChange} />
      <Card className="border !border-zinc-800/80 !bg-zinc-950 shadow-none">
        <AdminSectionHeader eyebrow="Supabase Setup" title="Connect the admin workspace to a real backend." description="Add the public Supabase values to Cloudflare Pages and redeploy." />
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border !border-zinc-800/80 !bg-zinc-900 shadow-none">
            <Text>NEXT_PUBLIC_SUPABASE_URL</Text>
          </Card>
          <Card className="border !border-zinc-800/80 !bg-zinc-900 shadow-none">
            <Text>NEXT_PUBLIC_SUPABASE_ANON_KEY</Text>
          </Card>
        </div>
        <Divider />
        <Text>The SQL starter schema is included in `supabase/schema.sql`.</Text>
      </Card>
    </section>
  )
}

function AdminSignIn() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  const signIn = async (event) => {
    event.preventDefault()
    if (!supabase) {
      setMessage('Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY, then redeploy.')
      return
    }
    if (username !== staticAdminUsername) {
      setMessage('Invalid username.')
      return
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: staticAdminEmail,
      password,
    })

    if (error) {
      setMessage(error.message.toLowerCase().includes('invalid login credentials')
        ? 'Invalid credentials. Confirm that root-admin@creai.co exists in Supabase Auth and that the password matches.'
        : error.message)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-4 py-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(194,255,41,0.12),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(194,255,41,0.08),transparent_22%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent)]" aria-hidden="true" />
      <Card className="relative z-10 w-full max-w-md border !border-zinc-800/80 !bg-zinc-950 shadow-none">
        <AdminSectionHeader eyebrow="Admin Access" title="Sign in to the CREAI admin workspace." description="A dedicated Tremor control surface for the app catalog." />
        <form className="grid gap-4" onSubmit={signIn}>
          <label className="grid gap-2">
            <Text>Username</Text>
            <TextInput value={username} onChange={(event) => setUsername(event.target.value)} placeholder="Username" required />
          </label>
          <label className="grid gap-2">
            <Text>Password</Text>
            <TextInput type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••••" required />
          </label>
          <Button type="submit" size="lg">
            Sign in
          </Button>
        </form>
        {message ? <Text className="mt-4">{message}</Text> : null}
      </Card>
    </main>
  )
}

function AdminFormFields({ form, updateField, categories, addCategory, disabled = false }) {
  const [categoryDraft, setCategoryDraft] = useState('')

  const submitCategory = () => {
    const next = categoryDraft.trim()
    if (!next) return
    addCategory(next)
    updateField('category', next)
    setCategoryDraft('')
  }

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2">
          <Text>App name</Text>
          <TextInput value={form.name} onChange={(event) => updateField('name', event.target.value)} placeholder="Signal Deck" disabled={disabled} required />
        </label>
        <label className="grid gap-2">
          <Text>Slug</Text>
          <TextInput value={form.slug} onChange={(event) => updateField('slug', event.target.value)} placeholder="signal-deck" disabled={disabled} required />
        </label>
      </div>

      <label className="grid gap-2">
        <Text>Description</Text>
        <Textarea value={form.summary} onChange={(event) => updateField('summary', event.target.value)} rows={5} disabled={disabled} required />
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2">
          <Text>Stacks</Text>
          <MultiSelect value={form.stacks} onValueChange={(value) => updateField('stacks', value)} placeholder="Select stacks" disabled={disabled}>
            {stackOptions.map((item) => (
              <MultiSelectItem key={item.id} value={item.label}>
                <span className="flex items-center gap-2">
                  <TokenGlyph label={item.label} registry={stackMeta} />
                  <span>{item.label}</span>
                </span>
              </MultiSelectItem>
            ))}
          </MultiSelect>
        </label>
        <label className="grid gap-2">
          <Text>Frameworks</Text>
          <MultiSelect value={form.frameworks} onValueChange={(value) => updateField('frameworks', value)} placeholder="Select frameworks" disabled={disabled}>
            {frameworkOptions.map((item) => (
              <MultiSelectItem key={item.id} value={item.label}>
                <span className="flex items-center gap-2">
                  <TokenGlyph label={item.label} registry={frameworkMeta} />
                  <span>{item.label}</span>
                </span>
              </MultiSelectItem>
            ))}
          </MultiSelect>
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <Text>Category</Text>
          <Select value={form.category} onValueChange={(value) => updateField('category', value)} placeholder="Select category" disabled={disabled}>
            {categories.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </Select>
          <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
            <TextInput value={categoryDraft} onChange={(event) => setCategoryDraft(event.target.value)} placeholder="Add new category" disabled={disabled} />
            <Button type="button" variant="secondary" onClick={submitCategory} disabled={!categoryDraft.trim() || disabled}>
              Add
            </Button>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2">
            <Text>Status</Text>
            <Select value={form.status} onValueChange={(value) => updateField('status', value)} disabled={disabled}>
              {['Live', 'Beta', 'Internal', 'Concept'].map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </Select>
          </label>
          <label className="grid gap-2">
            <Text>Audience</Text>
            <Select value={form.audience} onValueChange={(value) => updateField('audience', value)} disabled={disabled}>
              {['Public', 'Client-facing', 'Internal', 'Studio'].map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </Select>
          </label>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_180px]">
        <label className="grid gap-2">
          <Text>App URL</Text>
          <TextInput value={form.url} onChange={(event) => updateField('url', event.target.value)} placeholder="https://app.creai.co/signal-deck" disabled={disabled} />
        </label>
        <label className="grid gap-2">
          <Text>Accent color</Text>
          <TextInput value={form.accent} onChange={(event) => updateField('accent', event.target.value)} disabled={disabled} />
        </label>
        <label className="grid gap-2">
          <Text>Preview</Text>
          <input type="color" value={form.accent} onChange={(event) => updateField('accent', event.target.value)} disabled={disabled} className="h-11 rounded-xl border border-zinc-800 bg-zinc-900 p-1" />
        </label>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border !border-zinc-800/80 !bg-zinc-900 shadow-none">
          <AdminSectionHeader eyebrow="Social" title="Social links" description="Links only render on the public page when filled." />
          <div className="grid gap-4">
            <label className="grid gap-2">
              <Text>Website</Text>
              <TextInput value={form.website} onChange={(event) => updateField('website', event.target.value)} disabled={disabled} />
            </label>
            <label className="grid gap-2">
              <Text>X</Text>
              <TextInput value={form.x} onChange={(event) => updateField('x', event.target.value)} disabled={disabled} />
            </label>
            <label className="grid gap-2">
              <Text>Instagram</Text>
              <TextInput value={form.instagram} onChange={(event) => updateField('instagram', event.target.value)} disabled={disabled} />
            </label>
            <label className="grid gap-2">
              <Text>GitHub</Text>
              <TextInput value={form.github} onChange={(event) => updateField('github', event.target.value)} disabled={disabled} />
            </label>
          </div>
        </Card>

        <Card className="border !border-zinc-800/80 !bg-zinc-900 shadow-none">
          <AdminSectionHeader eyebrow="Stores" title="Store badges" description="Store links are optional but recommended." />
          <div className="grid gap-4">
            <label className="grid gap-2">
              <Text>Web App</Text>
              <TextInput value={form.webApp} onChange={(event) => updateField('webApp', event.target.value)} disabled={disabled} />
            </label>
            <label className="grid gap-2">
              <Text>App Store</Text>
              <TextInput value={form.appStore} onChange={(event) => updateField('appStore', event.target.value)} disabled={disabled} />
            </label>
            <label className="grid gap-2">
              <Text>Google Play</Text>
              <TextInput value={form.googlePlay} onChange={(event) => updateField('googlePlay', event.target.value)} disabled={disabled} />
            </label>
          </div>
        </Card>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button type="button" variant={form.featured ? 'primary' : 'secondary'} onClick={() => updateField('featured', !form.featured)} disabled={disabled}>
          {form.featured ? 'Featured enabled' : 'Mark as featured'}
        </Button>
        <Button type="button" variant={form.published ? 'primary' : 'secondary'} onClick={() => updateField('published', !form.published)} disabled={disabled}>
          {form.published ? 'Published' : 'Keep as draft'}
        </Button>
      </div>
    </div>
  )
}

function AdminWorkspace({ apps, setApps, setSession, loading, error, onNavigate, themeMode, onThemeChange }) {
  const [section, setSection] = useState('dashboard')
  const [dashboardView, setDashboardView] = useState('overview')
  const [form, setForm] = useState(initialForm)
  const [selectedAppId, setSelectedAppId] = useState('')
  const [feedback, setFeedback] = useState('')
  const [customCategories, setCustomCategories] = useState([])

  const categories = useMemo(() => {
    const catalog = new Set([...appCategories.filter((item) => item !== 'All'), ...customCategories, ...apps.map((app) => app.category).filter(Boolean)])
    return [...catalog]
  }, [apps, customCategories])

  const selectedApp = useMemo(() => apps.find((app) => app.id === selectedAppId) || null, [apps, selectedAppId])
  const recentApps = useMemo(() => [...apps].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 5), [apps])

  const totals = {
    total: apps.length,
    published: apps.filter((app) => app.published).length,
    featured: apps.filter((app) => app.featured).length,
    categories: categories.length,
  }

  const updateField = (field, value) => setForm((current) => ({ ...current, [field]: value }))
  const addCategory = (value) => setCustomCategories((current) => (current.includes(value) ? current : [...current, value]))

  const buildPayload = () => ({
    name: form.name,
    slug: form.slug,
    category: form.category,
    status: form.status,
    summary: form.summary,
    audience: form.audience,
    stacks: form.stacks,
    frameworks: form.frameworks,
    social_links: [
      form.website ? { label: 'Website', url: form.website } : null,
      form.x ? { label: 'X', url: form.x } : null,
      form.instagram ? { label: 'Instagram', url: form.instagram } : null,
      form.github ? { label: 'GitHub', url: form.github } : null,
    ].filter(Boolean),
    store_links: [
      form.webApp ? { label: 'Web App', url: form.webApp } : null,
      form.appStore ? { label: 'App Store', url: form.appStore } : null,
      form.googlePlay ? { label: 'Google Play', url: form.googlePlay } : null,
    ].filter(Boolean),
    url: form.url,
    accent: form.accent,
    featured: form.featured,
    published: form.published,
  })

  const fillFormFromApp = (app) => {
    setForm({
      name: app.name,
      slug: app.slug,
      category: app.category,
      status: app.status,
      summary: app.summary,
      audience: app.audience,
      stacks: app.stacks || [],
      frameworks: app.frameworks || [],
      url: app.url || '',
      website: app.socialLinks?.find((item) => item.label === 'Website')?.url || '',
      x: app.socialLinks?.find((item) => item.label === 'X')?.url || '',
      instagram: app.socialLinks?.find((item) => item.label === 'Instagram')?.url || '',
      github: app.socialLinks?.find((item) => item.label === 'GitHub')?.url || '',
      webApp: app.storeLinks?.find((item) => item.label === 'Web App')?.url || '',
      appStore: app.storeLinks?.find((item) => item.label === 'App Store')?.url || '',
      googlePlay: app.storeLinks?.find((item) => item.label === 'Google Play')?.url || '',
      accent: app.accent || '#c2ff29',
      featured: app.featured,
      published: app.published,
    })
  }

  const submitForm = async (event) => {
    event.preventDefault()
    if (!supabase) return
    const { data, error: insertError } = await supabase.from('apps').insert(buildPayload()).select().single()
    if (insertError) {
      setFeedback(insertError.message)
      return
    }
    setApps((current) => [mapAppRow(data), ...current])
    setForm(initialForm)
    setFeedback('App created successfully.')
  }

  const updateApp = async (event) => {
    event.preventDefault()
    if (!supabase || !selectedAppId) return
    const { data, error: updateError } = await supabase.from('apps').update(buildPayload()).eq('id', selectedAppId).select().single()
    if (updateError) {
      setFeedback(updateError.message)
      return
    }
    setApps((current) => current.map((app) => (app.id === selectedAppId ? mapAppRow(data) : app)))
    setFeedback('App updated successfully.')
  }

  const deleteApp = async (id) => {
    if (!supabase) return
    const { error: deleteError } = await supabase.from('apps').delete().eq('id', id)
    if (deleteError) {
      setFeedback(deleteError.message)
      return
    }
    setApps((current) => current.filter((app) => app.id !== id))
    if (selectedAppId === id) {
      setSelectedAppId('')
      setForm(initialForm)
    }
    setFeedback('App removed successfully.')
  }

  const signOut = async () => {
    if (!supabase) return
    await supabase.auth.signOut()
    setSession(null)
  }

  return (
    <div className="mx-auto grid min-h-screen max-w-[1680px] grid-cols-1 xl:grid-cols-[320px_minmax(0,1fr)]">
      <WorkspaceSidebar admin section={section} onSectionChange={setSection} dashboardView={dashboardView} onDashboardViewChange={setDashboardView} onNavigate={onNavigate} themeMode={themeMode} onThemeChange={onThemeChange} />
      <main className="min-w-0 bg-zinc-100 p-5 text-zinc-950 dark:bg-black dark:text-zinc-50 xl:h-screen xl:overflow-y-auto xl:p-6">
        <section className="grid gap-6">
          <WorkspaceTopBar label="Admin" onNavigate={onNavigate} themeMode={themeMode} onThemeChange={onThemeChange} admin />

          <Card className="border !border-zinc-800/80 !bg-zinc-950 shadow-none">
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_360px]">
              <div className="grid gap-4">
                <Badge color="lime">Admin Workspace</Badge>
                <Title>{section === 'dashboard' ? 'Monitor the catalog and recent changes.' : section === 'create' ? 'Create new apps for the public directory.' : 'Update existing apps and publishing state.'}</Title>
                <Text>A clean Tremor-first admin rebuilt separately from the landing experience.</Text>
              </div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
                <Card className="border !border-zinc-800/80 !bg-zinc-900 shadow-none">
                  <Text>Signed in as</Text>
                  <Metric>{staticAdminUsername}</Metric>
                </Card>
                <div className="flex flex-wrap gap-3">
                  <Button type="button" variant="secondary" onClick={() => onNavigate('/directory')}>
                    Directory
                  </Button>
                  <Button type="button" variant="light" onClick={signOut}>
                    Sign out
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {loading ? <InfoCard>Syncing dashboard...</InfoCard> : null}
          {error ? <InfoCard>{error}</InfoCard> : null}

          {section === 'dashboard' ? (
            <div className="grid gap-4">
              {dashboardView === 'overview' ? (
                <>
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <Card className="border !border-zinc-800/80 !bg-zinc-950 shadow-none"><Text>Total apps</Text><Metric>{totals.total}</Metric></Card>
                    <Card className="border !border-zinc-800/80 !bg-zinc-950 shadow-none"><Text>Published</Text><Metric>{totals.published}</Metric></Card>
                    <Card className="border !border-zinc-800/80 !bg-zinc-950 shadow-none"><Text>Featured</Text><Metric>{totals.featured}</Metric></Card>
                    <Card className="border !border-zinc-800/80 !bg-zinc-950 shadow-none"><Text>Categories</Text><Metric>{totals.categories}</Metric></Card>
                  </div>
                  <div className="grid gap-4 xl:grid-cols-2">
                    <Card className="border !border-zinc-800/80 !bg-zinc-950 shadow-none">
                      <AdminSectionHeader eyebrow="Publishing" title="State snapshot" description="Quick health view of the current catalog." />
                      <div className="grid gap-3">
                        <div className="flex items-center justify-between rounded-xl border border-zinc-800/80 bg-zinc-900 p-4"><Text>Draft items</Text><Metric>{apps.filter((app) => !app.published).length}</Metric></div>
                        <div className="flex items-center justify-between rounded-xl border border-zinc-800/80 bg-zinc-900 p-4"><Text>Live items</Text><Metric>{apps.filter((app) => app.status === 'Live').length}</Metric></div>
                      </div>
                    </Card>
                    <Card className="border !border-zinc-800/80 !bg-zinc-950 shadow-none">
                      <AdminSectionHeader eyebrow="Coverage" title="Link coverage" description="How complete the public app pages are." />
                      <div className="grid gap-3">
                        <div className="flex items-center justify-between rounded-xl border border-zinc-800/80 bg-zinc-900 p-4"><Text>Apps with social links</Text><Metric>{apps.filter((app) => app.socialLinks?.length).length}</Metric></div>
                        <div className="flex items-center justify-between rounded-xl border border-zinc-800/80 bg-zinc-900 p-4"><Text>Apps with store links</Text><Metric>{apps.filter((app) => app.storeLinks?.length).length}</Metric></div>
                      </div>
                    </Card>
                  </div>
                </>
              ) : null}

              {dashboardView === 'recent' ? (
                <Card className="border !border-zinc-800/80 !bg-zinc-950 shadow-none">
                  <AdminSectionHeader eyebrow="Recent" title="Latest app updates" description="Most recent app activity across the admin workspace." />
                  <div className="grid gap-3">
                    {recentApps.map((app) => (
                      <div key={app.id} className="flex items-center justify-between gap-3 rounded-xl border border-zinc-800/80 bg-zinc-900 p-4">
                        <div className="grid gap-1">
                          <Text>{app.name}</Text>
                          <div className="flex gap-2">
                            <Badge color="gray">{app.category}</Badge>
                            <AppStatusBadge status={app.status} />
                          </div>
                        </div>
                        <Text>{formatDate(app.updatedAt)}</Text>
                      </div>
                    ))}
                  </div>
                </Card>
              ) : null}

              {dashboardView === 'taxonomy' ? (
                <Card className="border !border-zinc-800/80 !bg-zinc-950 shadow-none">
                  <AdminSectionHeader eyebrow="Taxonomy" title="Category distribution" description="Current app totals by category." />
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {categories.map((item) => (
                      <Card key={item} className="border !border-zinc-800/80 !bg-zinc-900 shadow-none">
                        <Text>{item}</Text>
                        <Metric>{apps.filter((app) => app.category === item).length}</Metric>
                      </Card>
                    ))}
                  </div>
                </Card>
              ) : null}
            </div>
          ) : null}

          {section === 'create' ? (
            <Card className="border !border-zinc-800/80 !bg-zinc-950 shadow-none">
              <form className="grid gap-6" onSubmit={submitForm}>
                <AdminSectionHeader eyebrow="Create" title="Add new app" description="Create a new directory entry from scratch." />
                <AdminFormFields form={form} updateField={updateField} categories={categories} addCategory={addCategory} />
                <div className="flex flex-wrap gap-3">
                  <Button type="submit" size="lg">
                    Create app entry
                  </Button>
                  <Button type="button" variant="secondary" onClick={() => setForm(initialForm)}>
                    Reset
                  </Button>
                </div>
                {feedback ? <Text>{feedback}</Text> : null}
              </form>
            </Card>
          ) : null}

          {section === 'update' ? (
            <div className="grid gap-4 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
              <Card className="border !border-zinc-800/80 !bg-zinc-950 shadow-none">
                <AdminSectionHeader eyebrow="Update" title="Existing apps" description="Select an app to edit or remove." />
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableHeaderCell>App</TableHeaderCell>
                      <TableHeaderCell>Category</TableHeaderCell>
                      <TableHeaderCell>Status</TableHeaderCell>
                      <TableHeaderCell>Actions</TableHeaderCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {apps.map((app) => (
                      <TableRow key={app.id}>
                        <TableCell>{app.name}</TableCell>
                        <TableCell>{app.category}</TableCell>
                        <TableCell><AppStatusBadge status={app.status} /></TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-2">
                            <Button type="button" variant="secondary" size="xs" onClick={() => { setSelectedAppId(app.id); fillFormFromApp(app) }}>
                              Update
                            </Button>
                            <Button type="button" variant="light" size="xs" onClick={() => deleteApp(app.id)}>
                              Remove
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>

              <Card className="border !border-zinc-800/80 !bg-zinc-950 shadow-none">
                <form className="grid gap-6" onSubmit={updateApp}>
                  <AdminSectionHeader eyebrow="Update" title="Edit selected app" description={selectedApp ? `Editing ${selectedApp.name}` : 'Select an app from the table to begin editing.'} />
                  <AdminFormFields form={form} updateField={updateField} categories={categories} addCategory={addCategory} disabled={!selectedApp} />
                  <div className="flex flex-wrap gap-3">
                    <Button type="submit" size="lg" disabled={!selectedApp}>
                      Save changes
                    </Button>
                    <Button type="button" variant="secondary" disabled={!selectedApp} onClick={() => selectedApp && fillFormFromApp(selectedApp)}>
                      Reset fields
                    </Button>
                  </div>
                  {feedback ? <Text>{feedback}</Text> : null}
                </form>
              </Card>
            </div>
          ) : null}
        </section>
      </main>
    </div>
  )
}

export default function App({ initialPath = '/', initialHost = '' }) {
  const [path, setPath] = useState(initialPath)
  const [host, setHost] = useState(initialHost)
  const [category, setCategory] = useState('All')
  const [themeMode, setThemeMode] = useState(() => (typeof window === 'undefined' ? 'system' : window.localStorage.getItem('creai-theme') || 'system'))
  const { apps, session, loading, error, setApps, setSession } = useSupabaseApps()
  const route = parsePath(path, host)

  useEffect(() => {
    const onPopState = () => {
      setPath(buildPath())
      setHost(buildHost())
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: light)')
    const applyTheme = () => {
      const resolved = themeMode === 'system' ? (media.matches ? 'light' : 'dark') : themeMode
      document.documentElement.dataset.theme = resolved
      document.documentElement.classList.toggle('dark', resolved === 'dark')
      window.localStorage.setItem('creai-theme', themeMode)
    }

    applyTheme()
    media.addEventListener('change', applyTheme)
    return () => media.removeEventListener('change', applyTheme)
  }, [themeMode])

  useEffect(() => {
    if (route.view === 'landing') {
      document.title = 'CREAI | Imagine Beyond'
      return
    }
    if (route.view === 'admin') {
      document.title = 'CREAI Admin | Imagine Beyond'
      return
    }
    if (route.view === 'detail') {
      const current = apps.find((app) => app.slug === route.slug)
      document.title = current ? `${current.name} | CREAI Apps` : 'CREAI Apps | Imagine Beyond'
      return
    }
    document.title = 'CREAI Apps | Imagine Beyond'
  }, [route, apps])

  useEffect(() => {
    document.body.style.overflow = route.view === 'admin' ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [route.view])

  const navigate = (nextPath) => {
    if (typeof window === 'undefined' || nextPath === path) return
    window.history.pushState({}, '', nextPath)
    setPath(nextPath)
  }

  if (route.view === 'landing') return <LandingView />

  if (route.view === 'admin' && !isSupabaseConfigured) {
    return (
      <main className="min-h-screen bg-zinc-100 text-zinc-950 dark:bg-black dark:text-zinc-50">
        <div className="mx-auto grid min-h-screen max-w-[1680px] grid-cols-1 xl:grid-cols-[320px_minmax(0,1fr)]">
          <WorkspaceSidebar admin section="dashboard" dashboardView="overview" onSectionChange={() => {}} onDashboardViewChange={() => {}} onNavigate={navigate} themeMode={themeMode} onThemeChange={setThemeMode} />
          <main className="min-w-0 bg-zinc-100 p-5 text-zinc-950 dark:bg-black dark:text-zinc-50 xl:p-6">
            <SetupPanel onNavigate={navigate} themeMode={themeMode} onThemeChange={setThemeMode} />
          </main>
        </div>
      </main>
    )
  }

  if (route.view === 'admin' && loading && isSupabaseConfigured && !session) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black px-4 py-10">
        <Card className="w-full max-w-md border !border-zinc-800/80 !bg-zinc-950 shadow-none">
          <AdminSectionHeader eyebrow="Admin Access" title="Checking your session." description="Restoring your workspace state and permissions." />
        </Card>
      </main>
    )
  }

  if (route.view === 'admin' && !session) return <AdminSignIn />

  if (route.view === 'admin') {
    return <AdminWorkspace apps={apps} setApps={setApps} setSession={setSession} loading={loading} error={error} onNavigate={navigate} themeMode={themeMode} onThemeChange={setThemeMode} />
  }

  return (
    <main className="min-h-screen bg-zinc-100 text-zinc-950 dark:bg-black dark:text-zinc-50">
      <div className="mx-auto grid min-h-screen max-w-[1680px] grid-cols-1 xl:grid-cols-[320px_minmax(0,1fr)]">
        <WorkspaceSidebar onNavigate={navigate} themeMode={themeMode} onThemeChange={setThemeMode} />
        <main className="min-w-0 bg-zinc-100 p-5 text-zinc-950 dark:bg-black dark:text-zinc-50 xl:p-6">
          {route.view === 'detail' ? (
            <AppDetail
              app={apps.find((app) => app.slug === route.slug && app.published)}
              relatedApps={apps.filter((app) => app.slug !== route.slug && app.published).slice(0, 2)}
              onNavigate={navigate}
              themeMode={themeMode}
              onThemeChange={setThemeMode}
            />
          ) : (
            <PublicDirectory
              apps={apps}
              category={category}
              onCategoryChange={setCategory}
              onNavigate={navigate}
              loading={loading}
              themeMode={themeMode}
              onThemeChange={setThemeMode}
            />
          )}
        </main>
      </div>
    </main>
  )
}
