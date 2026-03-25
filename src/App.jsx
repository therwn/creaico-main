import { useEffect, useMemo, useState } from 'react'
import { gsap } from 'gsap'
import { appCategories, brandContent, seedApps } from './content'
import { isSupabaseConfigured, supabase } from './lib/supabase'
import CreaiLogo from './CreaiLogo'

const initialForm = {
  name: '',
  slug: '',
  category: 'AI Workspace',
  status: 'Beta',
  summary: '',
  audience: 'Public',
  stacks: '',
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

const formatDate = (value) =>
  new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

const buildPath = () => window.location.pathname.replace(/\/+$/, '') || '/'
const buildHost = () => window.location.hostname.toLowerCase()

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

function Sidebar({ onNavigate }) {
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
        {brandContent.socialLinks.map((item) => (
          <a key={item.label} href={item.url} target="_blank" rel="noreferrer" aria-label={item.label}>
            <span className="social-icon">{socialIcons[item.label]}</span>
          </a>
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
        <code>VITE_SUPABASE_URL</code>
        <code>VITE_SUPABASE_ANON_KEY</code>
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
    if (!supabase) return

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
      <div className="admin-auth-ambient admin-auth-ambient-one" aria-hidden="true" />
      <div className="admin-auth-ambient admin-auth-ambient-two" aria-hidden="true" />
      <div className="admin-auth-grid" aria-hidden="true" />
      <section className="admin-auth-card">
        <div className="panel-heading admin-auth-heading">
          <p className="eyebrow-copy">Admin Access</p>
          <h3>Sign in to manage the app directory.</h3>
          <p>Use the static credentials configured for the CREAI dashboard.</p>
        </div>
        <form className="auth-form admin-auth-form" onSubmit={signIn}>
          <label>
            <span>Username</span>
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="root-admin"
              autoComplete="off"
              autoCapitalize="none"
              spellCheck="false"
              required
            />
          </label>
          <label>
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••••"
              autoComplete="off"
              required
            />
          </label>
          <button type="submit" className="primary-button">Sign in</button>
        </form>
        {message ? <p className="helper-copy">{message}</p> : null}
      </section>
    </main>
  )
}

function AdminView({ apps, setApps, session, setSession, loading, error }) {
  const [form, setForm] = useState(initialForm)
  const [feedback, setFeedback] = useState('')

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const submitForm = async (event) => {
    event.preventDefault()
    if (!supabase) return

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

    const payload = {
      name: form.name,
      slug: form.slug,
      category: form.category,
      status: form.status,
      summary: form.summary,
      audience: form.audience,
      stacks: form.stacks.split(',').map((item) => item.trim()).filter(Boolean),
      social_links: socialLinks,
      store_links: storeLinks,
      url: form.url,
      accent: form.accent,
      featured: form.featured,
      published: form.published,
    }

    const { data, error: insertError } = await supabase.from('apps').insert(payload).select().single()
    if (insertError) {
      setFeedback(insertError.message)
      return
    }

    setApps((current) => [mapAppRow(data), ...current])
    setForm(initialForm)
    setFeedback('App created successfully.')
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

  return (
    <section className="content-shell">
      <div className="content-hero">
        <div>
          <p className="eyebrow-copy">Admin</p>
          <h2>Manage directory inventory with Supabase as the source of truth.</h2>
        </div>
        <div className="hero-actions">
          <span className="session-chip">{staticAdminUsername}</span>
          <button className="ghost-button" onClick={signOut}>Sign out</button>
        </div>
      </div>

      {loading ? <div className="empty-state">Syncing dashboard...</div> : null}
      {error ? <div className="empty-state">{error}</div> : null}

      <div className="admin-layout">
        <form className="admin-panel form-panel" onSubmit={submitForm}>
          <div className="panel-heading">
            <h3>Add new app</h3>
            <p>Create a new directory entry that can be published to app.creai.co.</p>
          </div>

          <label>
            <span>App name</span>
            <input value={form.name} onChange={(event) => updateField('name', event.target.value)} required />
          </label>
          <label>
            <span>Slug</span>
            <input value={form.slug} onChange={(event) => updateField('slug', event.target.value)} required />
          </label>
          <label>
            <span>Summary</span>
            <textarea value={form.summary} onChange={(event) => updateField('summary', event.target.value)} rows={4} required />
          </label>
          <label>
            <span>Stacks</span>
            <input value={form.stacks} onChange={(event) => updateField('stacks', event.target.value)} placeholder="React, Supabase, AI Workflow" />
          </label>
          <div className="form-split">
            <label>
              <span>Category</span>
              <select value={form.category} onChange={(event) => updateField('category', event.target.value)}>
                {appCategories.filter((item) => item !== 'All').map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Status</span>
              <select value={form.status} onChange={(event) => updateField('status', event.target.value)}>
                <option>Live</option>
                <option>Beta</option>
                <option>Internal</option>
                <option>Concept</option>
              </select>
            </label>
          </div>
          <div className="form-split">
            <label>
              <span>Audience</span>
              <select value={form.audience} onChange={(event) => updateField('audience', event.target.value)}>
                <option>Public</option>
                <option>Client-facing</option>
                <option>Internal</option>
                <option>Studio</option>
              </select>
            </label>
            <label>
              <span>Accent</span>
              <input type="color" value={form.accent} onChange={(event) => updateField('accent', event.target.value)} />
            </label>
          </div>
          <label>
            <span>URL</span>
            <input value={form.url} onChange={(event) => updateField('url', event.target.value)} placeholder="https://app.creai.co/brief-forge" />
          </label>
          <div className="form-split">
            <label>
              <span>Website</span>
              <input value={form.website} onChange={(event) => updateField('website', event.target.value)} placeholder="https://..." />
            </label>
            <label>
              <span>X</span>
              <input value={form.x} onChange={(event) => updateField('x', event.target.value)} placeholder="https://x.com/..." />
            </label>
          </div>
          <div className="form-split">
            <label>
              <span>Instagram</span>
              <input value={form.instagram} onChange={(event) => updateField('instagram', event.target.value)} placeholder="https://instagram.com/..." />
            </label>
            <label>
              <span>GitHub</span>
              <input value={form.github} onChange={(event) => updateField('github', event.target.value)} placeholder="https://github.com/..." />
            </label>
          </div>
          <div className="form-split">
            <label>
              <span>Web App badge</span>
              <input value={form.webApp} onChange={(event) => updateField('webApp', event.target.value)} placeholder="https://app.creai.co/..." />
            </label>
            <label>
              <span>App Store badge</span>
              <input value={form.appStore} onChange={(event) => updateField('appStore', event.target.value)} placeholder="https://apps.apple.com/..." />
            </label>
          </div>
          <label>
            <span>Google Play badge</span>
            <input value={form.googlePlay} onChange={(event) => updateField('googlePlay', event.target.value)} placeholder="https://play.google.com/..." />
          </label>
          <div className="toggle-row">
            <label><input type="checkbox" checked={form.featured} onChange={() => updateField('featured', !form.featured)} /> Featured</label>
            <label><input type="checkbox" checked={form.published} onChange={() => updateField('published', !form.published)} /> Published</label>
          </div>
          <button type="submit" className="primary-button">Create app entry</button>
          {feedback ? <p className="helper-copy">{feedback}</p> : null}
        </form>

        <div className="admin-panel list-panel">
          <div className="panel-heading">
            <h3>Current inventory</h3>
            <p>Feature or publish launches directly from the dashboard.</p>
          </div>
          <div className="admin-list">
            {apps.map((app) => (
              <article key={app.id} className="admin-item">
                <div>
                  <strong>{app.name}</strong>
                  <p>{app.category} / {app.status} / {app.audience}</p>
                </div>
                <div className="admin-actions">
                  <button onClick={() => toggleField(app.id, 'featured', app.featured)} className={app.featured ? 'toggle-active' : ''}>
                    {app.featured ? 'Featured' : 'Feature'}
                  </button>
                  <button onClick={() => toggleField(app.id, 'published', app.published)} className={app.published ? 'toggle-active' : ''}>
                    {app.published ? 'Published' : 'Hidden'}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default function App() {
  const [path, setPath] = useState(() => buildPath())
  const [host, setHost] = useState(() => buildHost())
  const [category, setCategory] = useState('All')
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

  const navigate = (nextPath) => {
    if (nextPath === path) return
    window.history.pushState({}, '', nextPath)
    setPath(nextPath)
  }

  if (route.view === 'landing') {
    return <LandingView />
  }

  return (
    <main className="app-shell">
      <div className="ambient ambient-one" aria-hidden="true" />
      <div className="ambient ambient-two" aria-hidden="true" />
      <div className="ambient ambient-three" aria-hidden="true" />
      <div className="surface-grid" aria-hidden="true" />

      <Sidebar onNavigate={navigate} />

      <section className="page-frame">
        {route.view === 'admin' ? (
          <AdminView apps={apps} setApps={setApps} session={session} setSession={setSession} loading={loading} error={error} />
        ) : route.view === 'detail' ? (
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
