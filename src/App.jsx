'use client'

import { useEffect, useMemo, useState } from 'react'
import { gsap } from 'gsap'
import * as Svgl from '@ridemountainpig/svgl-react'
import {
  IconChevronDown,
  IconLayoutDashboard,
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
  MultiSelect as TremorMultiSelect,
  MultiSelectItem,
  Select as TremorSelect,
  SelectItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  Text,
  TextInput,
  Textarea as TremorTextarea,
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
const adminTree = [
  {
    label: 'Dashboard',
    children: [
      { label: 'Overview', id: 'dashboard-overview' },
      { label: 'Recent Updates', id: 'dashboard-recent' },
      { label: 'Categories', id: 'dashboard-categories' },
      { label: 'Quick Actions', id: 'dashboard-actions' },
      { label: 'Recent Activity', id: 'dashboard-activity' },
      { label: 'Activity Timeline', id: 'dashboard-timeline' },
    ],
  },
  { label: 'Add a New App', children: [] },
  { label: 'Update Apps', children: [] },
]
const themeModes = ['system', 'dark', 'light']

function ThemeToggle({ themeMode, onThemeChange }) {
  return (
    <div className="theme-toggle" role="group" aria-label="Theme">
      {themeModes.map((mode) => (
        <button
          key={mode}
          type="button"
          className={themeMode === mode ? 'is-active' : ''}
          onClick={() => onThemeChange(mode)}
          aria-label={mode}
        >
          {mode === 'dark' ? <IconMoon size={16} stroke={1.8} /> : mode === 'light' ? <IconSun size={16} stroke={1.8} /> : <span>SYS</span>}
        </button>
      ))}
    </div>
  )
}

function AutoGrowTextarea(props) {
  return (
    <textarea
      {...props}
      onInput={(event) => {
        event.currentTarget.style.height = '0px'
        event.currentTarget.style.height = `${event.currentTarget.scrollHeight}px`
        props.onInput?.(event)
      }}
    />
  )
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

function TokenGlyph({ label, registry = stackMeta }) {
  const meta = registry[label] || { short: label.slice(0, 2).toUpperCase(), tone: '#c2ff29' }
  const Logo = logoComponents[label]

  return (
    <span className={`stack-glyph ${Logo ? 'has-logo' : ''}`} style={{ '--stack-tone': meta.tone }} aria-hidden="true">
      {Logo ? <Logo className="stack-logo-svg" /> : meta.short}
    </span>
  )
}

function MultiSelect({ value, onChange, options, registry, emptyLabel, countLabel = 'selected' }) {
  const [isOpen, setIsOpen] = useState(false)

  const toggleValue = (label) => {
    onChange(value.includes(label) ? value.filter((item) => item !== label) : [...value, label])
  }

  return (
    <div className={`stack-selector ${isOpen ? 'is-open' : ''}`}>
      <button type="button" className="stack-selector-trigger" onClick={() => setIsOpen((current) => !current)}>
        <span>{value.length ? `${value.length} ${countLabel}` : emptyLabel}</span>
        <IconChevronDown className={isOpen ? 'is-open' : ''} size={18} stroke={1.8} />
      </button>

      {value.length ? (
        <div className="stack-selection-row">
          {value.map((item) => (
            <button key={item} type="button" className="stack-selection-chip" onClick={() => toggleValue(item)}>
              <TokenGlyph label={item} registry={registry} />
              <span>{item}</span>
            </button>
          ))}
        </div>
      ) : null}

      {isOpen ? (
        <div className="stack-selector-menu">
          {options.map((item) => (
            <button
              key={item.id}
              className={`stack-option ${value.includes(item.label) ? 'is-selected' : ''}`}
              type="button"
              onClick={() => toggleValue(item.label)}
            >
              <TokenGlyph label={item.label} registry={registry} />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}

function SingleSelect({ value, onChange, options, placeholder = 'Choose an option' }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className={`single-select ${isOpen ? 'is-open' : ''}`}>
      <button type="button" className="single-select-trigger" onClick={() => setIsOpen((current) => !current)}>
        <span>{value || placeholder}</span>
        <IconChevronDown className={isOpen ? 'is-open' : ''} size={18} stroke={1.8} />
      </button>
      {isOpen ? (
        <div className="single-select-menu">
          {options.map((option) => (
            <button
              key={option}
              type="button"
              className={`single-select-option ${value === option ? 'is-selected' : ''}`}
              onClick={() => {
                onChange(option)
                setIsOpen(false)
              }}
            >
              {option}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}

function CategorySelect({ value, onChange, categories, onAddCategory }) {
  const [draft, setDraft] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  const submitCategory = () => {
    const next = draft.trim()
    if (!next) return
    onAddCategory(next)
    onChange(next)
    setDraft('')
    setIsOpen(false)
  }

  return (
    <div className={`single-select ${isOpen ? 'is-open' : ''}`}>
      <button type="button" className="single-select-trigger" onClick={() => setIsOpen((current) => !current)}>
        <span>{value || 'Select category'}</span>
        <IconChevronDown className={isOpen ? 'is-open' : ''} size={18} stroke={1.8} />
      </button>
      {isOpen ? (
        <div className="single-select-menu">
          {categories.map((option) => (
            <button
              key={option}
              type="button"
              className={`single-select-option ${value === option ? 'is-selected' : ''}`}
              onClick={() => {
                onChange(option)
                setIsOpen(false)
              }}
            >
              {option}
            </button>
          ))}
          <div className="category-create-row">
            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Add category"
              autoComplete="off"
            />
            <button type="button" className="ghost-button" onClick={submitCategory}>Add</button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

const formatDate = (value) =>
  new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

const buildPath = () => (typeof window === 'undefined' ? '/' : window.location.pathname.replace(/\/+$/, '') || '/')
const buildHost = () => (typeof window === 'undefined' ? '' : window.location.hostname.toLowerCase())

const parsePath = (pathname, hostname) => {
  if (pathname === '/admin') {
    return { view: 'admin' }
  }

  if (pathname.startsWith('/apps/')) {
    return { view: 'detail', slug: pathname.replace('/apps/', '') }
  }

  if (pathname === '/directory' || hostname === 'app.creai.co') {
    return { view: 'directory' }
  }

  return { view: 'landing' }
}

const landingScanLines = [
  { left: '10%', duration: '8.8s', delay: '1.7s', strength: 0.62 },
  { left: '30%', duration: '10.4s', delay: '0.4s', strength: 0.78 },
  { left: '50%', duration: '7.6s', delay: '2.9s', strength: 0.52 },
  { left: '70%', duration: '9.2s', delay: '1.1s', strength: 0.72 },
  { left: '90%', duration: '8.1s', delay: '3.6s', strength: 0.58 },
]

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
    if (!isSupabaseConfigured || !supabase) {
      return undefined
    }

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

  return {
    apps,
    session,
    loading,
    error,
    setApps,
    setSession,
  }
}

function Sidebar({ onNavigate, themeMode, onThemeChange }) {
  return (
    <aside className="sidebar">
      <button className="brand-lockup" onClick={() => onNavigate('/')}>
        <img src="/creailogo.svg" alt="CREAI" />
        <span>
          <strong>CREAI</strong>
          <small>app.creai.co</small>
        </span>
      </button>

      <div className="sidebar-block">
        <p className="sidebar-label">{brandContent.eyebrow}</p>
        <h1>{brandContent.title}</h1>
        <p>{brandContent.subtitle}</p>
      </div>

      <div className="sidebar-footer">
        <ThemeToggle themeMode={themeMode} onThemeChange={onThemeChange} />
        {brandContent.socialLinks.map((item) => (
          <a key={item.label} href={item.url} target="_blank" rel="noreferrer" aria-label={item.label}>
            <span className="social-icon">{socialIcons[item.label]}</span>
          </a>
        ))}
      </div>
    </aside>
  )
}

function AdminSidebar({ activeSection, activeDashboardBlock, onSectionChange, onDashboardBlockChange, onNavigate, themeMode, onThemeChange }) {
  const sectionIcons = {
    Dashboard: IconLayoutDashboard,
    'Add a New App': IconPlus,
    'Update Apps': IconTable,
  }

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-top">
        <button className="brand-lockup" onClick={() => onNavigate('/directory')}>
          <img src="/creailogo.svg" alt="CREAI" />
          <span>
            <strong>CREAI</strong>
            <small>admin panel</small>
          </span>
        </button>
        <div className="admin-sidebar-search">
          <span>Quick search...</span>
          <small>⌘K</small>
        </div>
        <ThemeToggle themeMode={themeMode} onThemeChange={onThemeChange} />
      </div>

      <div className="admin-sidebar-nav">
        {adminTree.map((section) => (
          <div key={section.label} className="admin-tree-group">
            <button
              type="button"
              className={activeSection === section.label ? 'is-active' : ''}
              onClick={() => onSectionChange(section.label)}
            >
              {(() => {
                const Icon = sectionIcons[section.label]
                return Icon ? <Icon size={17} stroke={1.8} /> : null
              })()}
              {section.label}
            </button>

            {section.children.length && activeSection === section.label ? (
              <div className="admin-tree-children">
                {section.children.map((child) => (
                  <button
                    key={child.id}
                    type="button"
                    className={activeDashboardBlock === child.id ? 'is-active' : ''}
                    onClick={() => onDashboardBlockChange(child.id)}
                  >
                    {child.label}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </aside>
  )
}

function AppSocialLinks({ links }) {
  if (!links?.length) return null

  return (
    <div className="icon-link-row">
      {links.map((item) => (
        <a key={`${item.label}-${item.url}`} href={item.url} target="_blank" rel="noreferrer" className="icon-link-chip" aria-label={item.label}>
          <span className="social-icon">{socialIcons[item.label] || socialIcons.Website}</span>
        </a>
      ))}
    </div>
  )
}

function StoreBadges({ links }) {
  if (!links?.length) return null

  return (
    <div className="store-badge-row">
      {links.map((item) => (
        <a key={`${item.label}-${item.url}`} href={item.url} target="_blank" rel="noreferrer" className="store-badge">
          <span>{item.label}</span>
        </a>
      ))}
    </div>
  )
}

function AdminStatCard({ label, value, tone = 'lime' }) {
  return (
    <Card decoration="top" decorationColor={tone} className="border !border-[var(--line)] !bg-[var(--panel)] shadow-none">
      <Text>{label}</Text>
      <Metric>{value}</Metric>
    </Card>
  )
}

function AdminSectionHeader({ eyebrow, title, description }) {
  return (
    <div className="panel-heading">
      <p className="eyebrow-copy">{eyebrow}</p>
      <Title>{title}</Title>
      {description ? <Text>{description}</Text> : null}
    </div>
  )
}

function AdminFormFields({ form, updateField, categories, addCategory, disabled = false }) {
  const [categoryDraft, setCategoryDraft] = useState('')

  const submitCategory = () => {
    const nextCategory = categoryDraft.trim()
    if (!nextCategory) return
    addCategory(nextCategory)
    updateField('category', nextCategory)
    setCategoryDraft('')
  }

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2">
          <Text>App name</Text>
          <TextInput
            value={form.name}
            onChange={(event) => updateField('name', event.target.value)}
            placeholder="Signal Deck"
            disabled={disabled}
            required
          />
        </label>
        <label className="grid gap-2">
          <Text>Slug</Text>
          <TextInput
            value={form.slug}
            onChange={(event) => updateField('slug', event.target.value)}
            placeholder="signal-deck"
            disabled={disabled}
            required
          />
        </label>
      </div>

      <label className="grid gap-2">
        <Text>Description</Text>
        <TremorTextarea
          value={form.summary}
          onChange={(event) => updateField('summary', event.target.value)}
          placeholder="Short explanation for the public detail page."
          rows={5}
          disabled={disabled}
          required
        />
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2">
          <Text>Stacks</Text>
          <TremorMultiSelect
            value={form.stacks}
            onValueChange={(value) => updateField('stacks', value)}
            placeholder="Select stacks"
            disabled={disabled}
          >
            {stackOptions.map((item) => (
              <MultiSelectItem key={item.id} value={item.label}>
                <span className="flex items-center gap-2">
                  <TokenGlyph label={item.label} registry={stackMeta} />
                  <span>{item.label}</span>
                </span>
              </MultiSelectItem>
            ))}
          </TremorMultiSelect>
        </label>

        <label className="grid gap-2">
          <Text>Frameworks</Text>
          <TremorMultiSelect
            value={form.frameworks}
            onValueChange={(value) => updateField('frameworks', value)}
            placeholder="Select frameworks"
            disabled={disabled}
          >
            {frameworkOptions.map((item) => (
              <MultiSelectItem key={item.id} value={item.label}>
                <span className="flex items-center gap-2">
                  <TokenGlyph label={item.label} registry={frameworkMeta} />
                  <span>{item.label}</span>
                </span>
              </MultiSelectItem>
            ))}
          </TremorMultiSelect>
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <Text>Category</Text>
          <TremorSelect
            value={form.category}
            onValueChange={(value) => updateField('category', value)}
            placeholder="Select a category"
            disabled={disabled}
          >
            {categories.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </TremorSelect>
          <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
            <TextInput
              value={categoryDraft}
              onChange={(event) => setCategoryDraft(event.target.value)}
              placeholder="Add a new category"
              disabled={disabled}
            />
            <Button type="button" variant="secondary" onClick={submitCategory} disabled={disabled || !categoryDraft.trim()}>
              Add category
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2">
            <Text>Status</Text>
            <TremorSelect
              value={form.status}
              onValueChange={(value) => updateField('status', value)}
              placeholder="Select status"
              disabled={disabled}
            >
              {['Live', 'Beta', 'Internal', 'Concept'].map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </TremorSelect>
          </label>
          <label className="grid gap-2">
            <Text>Audience</Text>
            <TremorSelect
              value={form.audience}
              onValueChange={(value) => updateField('audience', value)}
              placeholder="Select audience"
              disabled={disabled}
            >
              {['Public', 'Client-facing', 'Internal', 'Studio'].map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </TremorSelect>
          </label>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_180px]">
        <label className="grid gap-2">
          <Text>App URL</Text>
          <TextInput
            value={form.url}
            onChange={(event) => updateField('url', event.target.value)}
            placeholder="https://app.creai.co/signal-deck"
            disabled={disabled}
          />
        </label>
        <label className="grid gap-2">
          <Text>Accent color</Text>
          <TextInput value={form.accent} onChange={(event) => updateField('accent', event.target.value)} disabled={disabled} />
        </label>
        <label className="grid gap-2">
          <Text>Preview</Text>
          <input type="color" value={form.accent} onChange={(event) => updateField('accent', event.target.value)} disabled={disabled} />
        </label>
      </div>

      <Divider />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border !border-[var(--line)] !bg-[var(--panel)] shadow-none">
          <AdminSectionHeader eyebrow="Social" title="Social links" description="Only filled links appear on the public detail page." />
          <div className="social-column">
            <label className="grid gap-2">
              <Text>Website</Text>
              <TextInput value={form.website} onChange={(event) => updateField('website', event.target.value)} placeholder="https://..." disabled={disabled} />
            </label>
            <label className="grid gap-2">
              <Text>X</Text>
              <TextInput value={form.x} onChange={(event) => updateField('x', event.target.value)} placeholder="https://x.com/..." disabled={disabled} />
            </label>
            <label className="grid gap-2">
              <Text>Instagram</Text>
              <TextInput value={form.instagram} onChange={(event) => updateField('instagram', event.target.value)} placeholder="https://instagram.com/..." disabled={disabled} />
            </label>
            <label className="grid gap-2">
              <Text>GitHub</Text>
              <TextInput value={form.github} onChange={(event) => updateField('github', event.target.value)} placeholder="https://github.com/..." disabled={disabled} />
            </label>
          </div>
        </Card>

        <Card className="border !border-[var(--line)] !bg-[var(--panel)] shadow-none">
          <AdminSectionHeader eyebrow="Badges" title="Store badges" description="Show store badges only when URLs are available." />
          <div className="social-column">
            <label className="grid gap-2">
              <Text>Web App</Text>
              <TextInput value={form.webApp} onChange={(event) => updateField('webApp', event.target.value)} placeholder="https://app.creai.co/..." disabled={disabled} />
            </label>
            <label className="grid gap-2">
              <Text>App Store</Text>
              <TextInput value={form.appStore} onChange={(event) => updateField('appStore', event.target.value)} placeholder="https://apps.apple.com/..." disabled={disabled} />
            </label>
            <label className="grid gap-2">
              <Text>Google Play</Text>
              <TextInput value={form.googlePlay} onChange={(event) => updateField('googlePlay', event.target.value)} placeholder="https://play.google.com/..." disabled={disabled} />
            </label>
          </div>
        </Card>
      </div>

      <div className="flex flex-wrap gap-3">
        <button type="button" className={`ghost-button ${form.featured ? 'toggle-active' : ''}`} onClick={() => updateField('featured', !form.featured)} disabled={disabled}>
          {form.featured ? 'Featured enabled' : 'Mark as featured'}
        </button>
        <button type="button" className={`ghost-button ${form.published ? 'toggle-active' : ''}`} onClick={() => updateField('published', !form.published)} disabled={disabled}>
          {form.published ? 'Published' : 'Keep as draft'}
        </button>
      </div>
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
    if (reducedMotion) {
      return undefined
    }

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

function DirectoryView({ apps, category, onCategoryChange, loading }) {
  const visibleApps = useMemo(() => {
    return apps.filter((app) => {
      const categoryMatch = category === 'All' || app.category === category
      return categoryMatch && app.published
    })
  }, [apps, category])

  const recentApps = useMemo(
    () =>
      [...apps]
        .filter((app) => app.published)
        .sort((left, right) => new Date(right.updatedAt) - new Date(left.updatedAt))
        .slice(0, 4),
    [apps],
  )

  const categoryStats = useMemo(
    () =>
      appCategories
        .filter((item) => item !== 'All')
        .map((item) => ({
          name: item,
          count: apps.filter((app) => app.published && app.category === item).length,
        }))
        .filter((item) => item.count > 0),
    [apps],
  )

  return (
    <section className="content-shell">
      <div className="content-hero">
        <div>
          <p className="eyebrow-copy">Directory</p>
          <h2>Launch-ready apps, prototypes, and internal products.</h2>
        </div>
        <div className="hero-metrics">
          <div>
            <strong>{apps.filter((app) => app.published).length}</strong>
            <span>Published apps</span>
          </div>
          <div>
            <strong>{apps.filter((app) => app.category === 'AI Workspace' && app.published).length}</strong>
            <span>AI workspaces</span>
          </div>
        </div>
      </div>

      <div className="detail-grid">
        <section className="detail-panel">
          <div className="panel-heading">
            <h3>Category map</h3>
            <p>Browse the public inventory by launch type and operating context.</p>
          </div>
          <div className="category-row">
            {appCategories.map((item) => (
              <button
                key={item}
                className={category === item ? 'is-active' : ''}
                onClick={() => onCategoryChange(item)}
              >
                {item}
              </button>
            ))}
          </div>
          <div className="stat-stack">
            {categoryStats.map((item) => (
              <article key={item.name} className="mini-stat">
                <strong>{item.count}</strong>
                <span>{item.name}</span>
              </article>
            ))}
          </div>
        </section>

        <section className="detail-panel">
          <div className="panel-heading">
            <h3>Recently updated</h3>
            <p>The latest movements across tools, experiments, and internal systems.</p>
          </div>
          <div className="stack-list">
            {recentApps.map((app) => (
              <article key={app.id} className="stack-item compact">
                <div>
                  <strong>{app.name}</strong>
                  <p>{app.category}</p>
                </div>
                <span>{formatDate(app.updatedAt)}</span>
              </article>
            ))}
          </div>
        </section>
      </div>

      {loading ? <div className="empty-state">Loading app inventory...</div> : null}

      <div className="card-grid">
        {visibleApps.map((app) => (
          <article key={app.id} className="app-card" style={{ '--accent-glow': app.accent }}>
            <div className="card-topline">
              <span>{app.category}</span>
              <span className={`status-badge status-${app.status.toLowerCase()}`}>{app.status}</span>
            </div>
            <div className="card-title-row">
              <h3>{app.name}</h3>
              <span className="app-audience">{app.audience}</span>
            </div>
            <p>{app.summary}</p>
            <div className="stack-row">
              {app.stacks?.slice(0, 3).map((stack) => (
                <span key={stack} className="stack-chip">{stack}</span>
              ))}
            </div>
            <div className="card-footer">
              <span>{formatDate(app.updatedAt)}</span>
              <a href={`/apps/${app.slug}`}>View details</a>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

function DetailView({ app, relatedApps, onNavigate }) {
  if (!app) {
    return (
      <section className="content-shell">
        <div className="empty-state">
          This app could not be found or is not published yet.
        </div>
      </section>
    )
  }

  return (
    <section className="content-shell">
      <button className="back-button" onClick={() => onNavigate('/')}>Back to directory</button>

      <article className="detail-hero" style={{ '--accent-glow': app.accent }}>
        <div className="detail-hero-copy">
          <p className="eyebrow-copy">{app.category}</p>
          <AppSocialLinks links={app.socialLinks} />
          <h2>{app.name}</h2>
          <p>{app.summary}</p>
          <StoreBadges links={app.storeLinks} />
          <div className="featured-meta">
            <span>{app.status}</span>
            <span>{app.audience}</span>
            <span>Updated {formatDate(app.updatedAt)}</span>
          </div>
        </div>
      </article>

      <section className="detail-panel">
        <div className="panel-heading">
          <h3>Stack</h3>
          <p>The tools and systems behind this app.</p>
        </div>
        <div className="stack-row">
          {app.stacks?.length ? app.stacks.map((stack) => <span key={stack} className="stack-chip">{stack}</span>) : <span className="helper-copy">No stack information yet.</span>}
        </div>
        <div className="panel-heading">
          <h3>Frameworks</h3>
          <p>Primary frameworks used across the product build.</p>
        </div>
        <div className="stack-row">
          {app.frameworks?.length ? app.frameworks.map((framework) => <span key={framework} className="stack-chip">{framework}</span>) : <span className="helper-copy">No frameworks listed yet.</span>}
        </div>
      </section>

      <section className="detail-panel">
        <div className="panel-heading">
          <h3>More from CREAI</h3>
          <p>Related releases and systems from the directory.</p>
        </div>
        <div className="card-grid compact-grid">
          {relatedApps.map((item) => (
            <article key={item.id} className="app-card" style={{ '--accent-glow': item.accent }}>
              <div className="card-topline">
                <span>{item.category}</span>
                <span className={`status-badge status-${item.status.toLowerCase()}`}>{item.status}</span>
              </div>
              <div className="card-title-row">
                <h3>{item.name}</h3>
              </div>
              <p>{item.summary}</p>
              <div className="card-footer">
                <span>{formatDate(item.updatedAt)}</span>
                <a href={`/apps/${item.slug}`}>View details</a>
              </div>
            </article>
          ))}
        </div>
      </section>
    </section>
  )
}

function SetupPanel() {
  return (
    <section className="content-shell">
      <div className="content-hero">
        <div>
          <p className="eyebrow-copy">Supabase Setup</p>
          <h2>Connect the directory to a real backend.</h2>
        </div>
      </div>

      <div className="admin-panel setup-panel">
        <h3>Required environment variables</h3>
        <p>Add these variables in Cloudflare Pages and your local `.env.local` file:</p>
        <code>NEXT_PUBLIC_SUPABASE_URL</code>
        <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>
        <p>The SQL starter schema is included in `supabase/schema.sql`.</p>
      </div>
    </section>
  )
}

function AdminSignIn({ onSignedIn }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  const signIn = async (event) => {
    event.preventDefault()
    if (!supabase) {
      setMessage('Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Cloudflare Pages, then redeploy.')
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
      if (error.message.toLowerCase().includes('invalid login credentials')) {
        setMessage('Invalid credentials. Check that `root-admin@creai.co` exists in Supabase Auth and that the password matches.')
      } else {
        setMessage(error.message)
      }
    } else {
      setMessage('Signed in successfully.')
    }

    if (!error) onSignedIn()
  }

  return (
    <main className="admin-auth-shell">
      <div className="admin-auth-noise" aria-hidden="true" />
      <div className="admin-auth-ambient admin-auth-ambient-one" aria-hidden="true" />
      <div className="admin-auth-ambient admin-auth-ambient-two" aria-hidden="true" />
      <div className="admin-auth-ambient admin-auth-ambient-three" aria-hidden="true" />
      <div className="admin-auth-grid" aria-hidden="true" />
      <div className="admin-auth-line-cluster" aria-hidden="true">
        {landingScanLines.map((line, index) => (
          <span
            key={`auth-${line.left}-${index}`}
            className="admin-auth-scan-line"
            style={{
              '--line-left': line.left,
              '--line-duration': `${7 + index * 0.9}s`,
              '--line-delay': `${index * 0.8}s`,
              '--line-opacity': 0.52 + index * 0.06,
            }}
          />
        ))}
      </div>
      <div className="admin-auth-orbit admin-auth-orbit-one" aria-hidden="true" />
      <div className="admin-auth-orbit admin-auth-orbit-two" aria-hidden="true" />
      <Card className="admin-auth-card border !border-[var(--line)] !bg-[var(--panel-strong)] shadow-none">
        <AdminSectionHeader
          eyebrow="Admin Access"
          title="Sign in to manage the app directory."
          description="Use the static credentials configured for the CREAI dashboard."
        />
        <form className="auth-form admin-auth-form" onSubmit={signIn}>
          <label className="grid gap-2">
            <Text>Username</Text>
            <TextInput
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Username"
              autoComplete="new-password"
              autoCapitalize="none"
              spellCheck="false"
              required
            />
          </label>
          <label className="grid gap-2">
            <Text>Password</Text>
            <TextInput
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••••"
              autoComplete="new-password"
              required
            />
          </label>
          <Button type="submit" size="lg" className="admin-primary-button justify-center">
            Sign in
          </Button>
        </form>
        {message ? <Text className="helper-copy">{message}</Text> : null}
      </Card>
    </main>
  )
}

function AdminView({ apps, setApps, session, setSession, loading, error, activeSection, activeDashboardBlock, onDashboardBlockChange, onSectionChange, onNavigate }) {
  const [form, setForm] = useState(initialForm)
  const [selectedAppId, setSelectedAppId] = useState('')
  const [feedback, setFeedback] = useState('')
  const [customCategories, setCustomCategories] = useState([])

  const categories = useMemo(() => {
    const catalog = new Set([
      ...appCategories.filter((item) => item !== 'All'),
      ...customCategories,
      ...apps.map((app) => app.category).filter(Boolean),
    ])
    return [...catalog]
  }, [apps, customCategories])

  const selectedApp = useMemo(() => apps.find((app) => app.id === selectedAppId) || null, [apps, selectedAppId])
  const recentAddedApps = useMemo(() => [...apps].slice(0, 5), [apps])
  const recentUpdatedApps = useMemo(() => [...apps].sort((left, right) => new Date(right.updatedAt) - new Date(left.updatedAt)).slice(0, 5), [apps])
  const categoryBreakdown = useMemo(() => categories.map((name) => ({ name, count: apps.filter((app) => app.category === name).length })).sort((a, b) => b.count - a.count), [apps, categories])
  const activityFeed = useMemo(() => [...apps].sort((left, right) => new Date(right.updatedAt) - new Date(left.updatedAt)).slice(0, 8).map((app, index) => ({
    id: `${app.id}-${index}`,
    title: index % 2 === 0 ? `${app.name} updated` : `${app.name} reviewed`,
    detail: `${app.category} / ${app.status}`,
    date: formatDate(app.updatedAt),
  })), [apps])
  const showDashboardBlock = (blockId) => activeDashboardBlock === blockId

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const addCategory = (category) => {
    setCustomCategories((current) => (current.includes(category) ? current : [...current, category]))
  }

  const buildPayload = () => {
    const socialLinks = [
      form.website ? { label: 'Website', url: form.website } : null,
      form.x ? { label: 'X', url: form.x } : null,
      form.instagram ? { label: 'Instagram', url: form.instagram } : null,
      form.github ? { label: 'GitHub', url: form.github } : null,
    ].filter(Boolean)

    const storeLinks = [
      form.webApp ? { label: 'Web App', url: form.webApp } : null,
      form.appStore ? { label: 'App Store', url: form.appStore } : null,
      form.googlePlay ? { label: 'Google Play', url: form.googlePlay } : null,
    ].filter(Boolean)

    return {
      name: form.name,
      slug: form.slug,
      category: form.category,
      status: form.status,
      summary: form.summary,
      audience: form.audience,
      stacks: form.stacks,
      frameworks: form.frameworks,
      social_links: socialLinks,
      store_links: storeLinks,
      url: form.url,
      accent: form.accent,
      featured: form.featured,
      published: form.published,
    }
  }

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

    const { data, error: updateError } = await supabase
      .from('apps')
      .update(buildPayload())
      .eq('id', selectedAppId)
      .select()
      .single()

    if (updateError) {
      setFeedback(updateError.message)
      return
    }

    setApps((current) => current.map((app) => (app.id === selectedAppId ? mapAppRow(data) : app)))
    setFeedback('App updated successfully.')
  }

  const toggleField = async (id, field, currentValue) => {
    if (!supabase) return

    const { data, error: updateError } = await supabase
      .from('apps')
      .update({ [field]: !currentValue })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      setFeedback(updateError.message)
      return
    }

    setApps((current) => current.map((app) => (app.id === id ? mapAppRow(data) : app)))
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

  if (!isSupabaseConfigured) {
    return <SetupPanel />
  }

  if (!session) {
    return <AdminSignIn onSignedIn={() => setFeedback('')} />
  }

  const totals = {
    total: apps.length,
    published: apps.filter((app) => app.published).length,
    featured: apps.filter((app) => app.featured).length,
    categories: categories.length,
  }

  return (
    <section className="content-shell">
      <div className="content-hero">
        <div>
          <p className="eyebrow-copy">Admin</p>
          <h2>
            {activeSection === 'Dashboard'
              ? 'Monitor the directory and recent changes.'
              : activeSection === 'Add a New App'
                ? 'Create a new app entry with structured metadata.'
                : 'Update existing apps and their content.'}
          </h2>
        </div>
        <div className="hero-actions">
          <span className="session-chip">{staticAdminUsername}</span>
          <button className="ghost-button" onClick={signOut}>Sign out</button>
        </div>
      </div>

      {loading ? <div className="empty-state">Syncing dashboard...</div> : null}
      {error ? <div className="empty-state">{error}</div> : null}

      {activeSection === 'Dashboard' ? (
        <div className="admin-dashboard-grid">
          {showDashboardBlock('dashboard-overview') ? <section id="dashboard-overview" className="detail-panel">
            <AdminSectionHeader eyebrow="Dashboard" title="Overview" description="High-level view of your current app catalog." />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              <AdminStatCard label="Total apps" value={totals.total} tone="lime" />
              <AdminStatCard label="Published" value={totals.published} tone="emerald" />
              <AdminStatCard label="Featured" value={totals.featured} tone="amber" />
              <AdminStatCard label="Categories" value={totals.categories} tone="cyan" />
            </div>
            <div className="grid gap-4 xl:grid-cols-2">
              <Card className="border !border-[var(--line)] !bg-[var(--panel)] shadow-none">
                <Title>Publishing snapshot</Title>
                <div className="mt-4 grid gap-3">
                  <div className="mini-stat">
                    <strong>{apps.filter((app) => !app.published).length}</strong>
                    <span>Draft items</span>
                  </div>
                  <div className="mini-stat">
                    <strong>{apps.filter((app) => app.status === 'Live').length}</strong>
                    <span>Live status</span>
                  </div>
                </div>
              </Card>
              <Card className="border !border-[var(--line)] !bg-[var(--panel)] shadow-none">
                <Title>Coverage snapshot</Title>
                <div className="mt-4 grid gap-3">
                  <div className="mini-stat">
                    <strong>{apps.filter((app) => app.socialLinks?.length).length}</strong>
                    <span>Apps with social links</span>
                  </div>
                  <div className="mini-stat">
                    <strong>{apps.filter((app) => app.storeLinks?.length).length}</strong>
                    <span>Apps with store badges</span>
                  </div>
                </div>
              </Card>
            </div>
          </section> : null}

          {showDashboardBlock('dashboard-recent') ? <section id="dashboard-recent" className="detail-panel">
              <AdminSectionHeader eyebrow="Dashboard" title="Recent updates" description="Latest added and recently updated app records." />
              <div className="grid gap-4 xl:grid-cols-2">
                <Card className="border !border-[var(--line)] !bg-[var(--panel)] shadow-none">
                  <Title>Recently added</Title>
                  <div className="mt-4 stack-list">
                    {recentAddedApps.map((app) => (
                      <article key={`added-${app.id}`} className="stack-item compact">
                        <div>
                          <strong>{app.name}</strong>
                          <p>Added to directory / {app.category}</p>
                        </div>
                        <span>{formatDate(app.updatedAt)}</span>
                      </article>
                    ))}
                  </div>
                </Card>
                <Card className="border !border-[var(--line)] !bg-[var(--panel)] shadow-none">
                  <Title>Recently updated</Title>
                  <div className="mt-4 stack-list">
                    {recentUpdatedApps.map((app) => (
                      <article key={`updated-${app.id}`} className="stack-item compact">
                        <div>
                          <strong>{app.name}</strong>
                          <p>Last updated / {app.category}</p>
                        </div>
                        <span>{formatDate(app.updatedAt)}</span>
                      </article>
                    ))}
                  </div>
                </Card>
              </div>
            </section> : null}

          {showDashboardBlock('dashboard-categories') ? <section id="dashboard-categories" className="detail-panel">
              <AdminSectionHeader eyebrow="Dashboard" title="Category distribution" description="How apps are distributed across your current taxonomy." />
              <div className="stack-list">
                {categoryBreakdown.map((item) => (
                  <article key={item.name} className="stack-item compact">
                    <div>
                      <strong>{item.name}</strong>
                      <p>Apps in this category</p>
                    </div>
                    <span>{item.count}</span>
                  </article>
                ))}
              </div>
            </section> : null}

          {showDashboardBlock('dashboard-actions') ? <section id="dashboard-actions" className="detail-panel">
              <AdminSectionHeader eyebrow="Dashboard" title="Quick actions" description="Jump straight into common admin flows." />
              <div className="flex flex-wrap gap-3">
                <Button type="button" onClick={() => onSectionChange?.('Add a New App')}>
                  Add a new app
                </Button>
                <Button type="button" variant="secondary" onClick={() => onSectionChange?.('Update Apps')}>
                  Update apps
                </Button>
                <Button type="button" variant="light" onClick={() => onNavigate('/directory')}>
                  Open directory
                </Button>
              </div>
            </section> : null}

          {showDashboardBlock('dashboard-activity') ? <section id="dashboard-activity" className="detail-panel">
              <AdminSectionHeader eyebrow="Dashboard" title="Recent admin actions" description="A quick feed of the latest content movements." />
              <div className="stack-list">
                {activityFeed.slice(0, 5).map((item) => (
                  <article key={item.id} className="stack-item compact">
                    <div>
                      <strong>{item.title}</strong>
                      <p>{item.detail}</p>
                    </div>
                    <span>{item.date}</span>
                  </article>
                ))}
              </div>
            </section> : null}

          {showDashboardBlock('dashboard-timeline') ? <section id="dashboard-timeline" className="detail-panel">
            <AdminSectionHeader eyebrow="Dashboard" title="Activity timeline" description="Chronological feed of recent admin-side content events." />
            <div className="timeline-list">
              {activityFeed.map((item) => (
                <article key={`timeline-${item.id}`} className="timeline-item">
                  <span className="timeline-dot" aria-hidden="true" />
                  <div>
                    <strong>{item.title}</strong>
                    <p>{item.detail}</p>
                  </div>
                  <span>{item.date}</span>
                </article>
              ))}
            </div>
          </section> : null}
        </div>
      ) : null}

      {activeSection === 'Add a New App' ? (
        <div className="admin-form-shell">
          <Card className="admin-panel form-panel admin-editor-panel border !border-[var(--line)] !bg-[var(--panel)] shadow-none">
            <form className="grid gap-6" onSubmit={submitForm}>
              <AdminSectionHeader eyebrow="Admin" title="Add new app" description="Create a new directory entry for app.creai.co." />
              <AdminFormFields form={form} updateField={updateField} categories={categories} addCategory={addCategory} />
              <div className="flex flex-wrap gap-3">
                <Button type="submit" size="lg" className="admin-primary-button">
                  Create app entry
                </Button>
                <Button type="button" variant="secondary" onClick={() => setForm(initialForm)}>
                  Reset
                </Button>
              </div>
              {feedback ? <Text className="helper-copy">{feedback}</Text> : null}
            </form>
          </Card>
        </div>
      ) : null}

      {activeSection === 'Update Apps' ? (
        <div className="admin-layout">
          <Card className="admin-panel list-panel border !border-[var(--line)] !bg-[var(--panel)] shadow-none">
            <AdminSectionHeader eyebrow="Admin" title="Update apps" description="Choose an existing app to edit or remove." />
            <Table className="table-shell">
              <TableHead>
                <TableRow>
                  <TableHeaderCell>App</TableHeaderCell>
                  <TableHeaderCell>Category</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                  <TableHeaderCell>Audience</TableHeaderCell>
                  <TableHeaderCell>Actions</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {apps.map((app) => (
                  <TableRow key={app.id} className={selectedAppId === app.id ? 'is-selected' : ''}>
                    <TableCell>{app.name}</TableCell>
                    <TableCell>{app.category}</TableCell>
                    <TableCell>
                      <Badge color={app.status === 'Live' ? 'emerald' : app.status === 'Beta' ? 'amber' : 'gray'}>
                        {app.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{app.audience}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="secondary"
                          size="xs"
                          onClick={() => {
                            setSelectedAppId(app.id)
                            fillFormFromApp(app)
                          }}
                        >
                          Update
                        </Button>
                        <Button type="button" variant="light" color="red" size="xs" onClick={() => deleteApp(app.id)}>
                          Remove
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          <Card className="admin-panel form-panel admin-editor-panel border !border-[var(--line)] !bg-[var(--panel)] shadow-none">
            <form className="grid gap-6" onSubmit={updateApp}>
              <AdminSectionHeader
                eyebrow="Admin"
                title="Update selected app"
                description={selectedApp ? `Editing ${selectedApp.name}` : 'Select an app from the table to begin editing.'}
              />
              <AdminFormFields form={form} updateField={updateField} categories={categories} addCategory={addCategory} disabled={!selectedApp} />
              <div className="flex flex-wrap gap-3">
                <Button type="submit" size="lg" className="admin-primary-button" disabled={!selectedApp}>
                  Save changes
                </Button>
                <Button type="button" variant="secondary" disabled={!selectedApp} onClick={() => selectedApp && fillFormFromApp(selectedApp)}>
                  Reset fields
                </Button>
              </div>
              {feedback ? <Text className="helper-copy">{feedback}</Text> : null}
            </form>
          </Card>
        </div>
      ) : null}
    </section>
  )
}

export default function App({ initialPath = '/', initialHost = '' }) {
  const [path, setPath] = useState(initialPath)
  const [host, setHost] = useState(initialHost)
  const [category, setCategory] = useState('All')
  const [adminSection, setAdminSection] = useState('Dashboard')
  const [adminDashboardBlock, setAdminDashboardBlock] = useState('dashboard-overview')
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
      document.title = current ? `${current.name} | CREAI Apps` : 'CREAI App | Imagine Beyond'
      return
    }

    document.title = 'CREAI Apps | Imagine Beyond'
  }, [route, apps])

  useEffect(() => {
    const shouldLockScroll = route.view === 'admin'
    document.body.style.overflow = shouldLockScroll ? 'hidden' : ''

    return () => {
      document.body.style.overflow = ''
    }
  }, [route.view, session])

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: light)')
    const applyTheme = () => {
      const resolved = themeMode === 'system' ? (media.matches ? 'light' : 'dark') : themeMode
      document.documentElement.dataset.theme = resolved
      window.localStorage.setItem('creai-theme', themeMode)
    }

    applyTheme()
    media.addEventListener('change', applyTheme)
    return () => media.removeEventListener('change', applyTheme)
  }, [themeMode])

  useEffect(() => {
    if (route.view !== 'admin' || adminSection !== 'Dashboard') return
    const target = document.getElementById(adminDashboardBlock)
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [route.view, adminSection, adminDashboardBlock])

  const navigate = (nextPath) => {
    if (typeof window === 'undefined') return
    if (nextPath === path) return
    window.history.pushState({}, '', nextPath)
    setPath(nextPath)
  }

  if (route.view === 'landing') {
    return <LandingView />
  }

  if (route.view === 'admin' && !isSupabaseConfigured) {
    return <SetupPanel />
  }

  if (route.view === 'admin' && loading && isSupabaseConfigured && !session) {
    return (
      <main className="admin-auth-shell">
        <div className="admin-auth-ambient admin-auth-ambient-one" aria-hidden="true" />
        <div className="admin-auth-ambient admin-auth-ambient-two" aria-hidden="true" />
        <div className="admin-auth-grid" aria-hidden="true" />
        <section className="admin-auth-card">
          <div className="panel-heading admin-auth-heading">
            <p className="eyebrow-copy">Admin Access</p>
            <h3>Checking your session.</h3>
          </div>
        </section>
      </main>
    )
  }

  if (route.view === 'admin' && !session) {
    return <AdminSignIn onSignedIn={() => {}} />
  }

  if (route.view === 'admin') {
    return (
      <main className="admin-shell">
        <div className="ambient ambient-one" aria-hidden="true" />
        <div className="ambient ambient-two" aria-hidden="true" />
        <div className="ambient ambient-three" aria-hidden="true" />
        <div className="surface-grid" aria-hidden="true" />

        <AdminSidebar
          activeSection={adminSection}
          activeDashboardBlock={adminDashboardBlock}
          onSectionChange={setAdminSection}
          onDashboardBlockChange={setAdminDashboardBlock}
          onNavigate={navigate}
          themeMode={themeMode}
          onThemeChange={setThemeMode}
        />


        <section className="admin-page-frame">
          <AdminView
            apps={apps}
            setApps={setApps}
            session={session}
            setSession={setSession}
            loading={loading}
            error={error}
            activeSection={adminSection}
            activeDashboardBlock={adminDashboardBlock}
            onDashboardBlockChange={setAdminDashboardBlock}
            onSectionChange={setAdminSection}
            onNavigate={navigate}
          />
        </section>
      </main>
    )
  }

  return (
    <main className="app-shell">
      <div className="ambient ambient-one" aria-hidden="true" />
      <div className="ambient ambient-two" aria-hidden="true" />
      <div className="ambient ambient-three" aria-hidden="true" />
      <div className="surface-grid" aria-hidden="true" />

      <Sidebar onNavigate={navigate} themeMode={themeMode} onThemeChange={setThemeMode} />


      <section className="page-frame">
        {route.view === 'detail' ? (
          <DetailView
            app={apps.find((app) => app.slug === route.slug && app.published)}
            relatedApps={apps.filter((app) => app.slug !== route.slug && app.published).slice(0, 2)}
            onNavigate={navigate}
          />
        ) : (
          <DirectoryView
            apps={apps}
            category={category}
            onCategoryChange={setCategory}
            loading={loading}
          />
        )}
      </section>
    </main>
  )
}
