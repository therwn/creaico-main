'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import * as Dialog from '@radix-ui/react-dialog'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import {
  Badge,
  Button,
  Callout,
  Card,
  Flex,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  Text,
  Textarea,
  Title,
} from '@tremor/react'
import {
  RiAddCircleLine,
  RiApps2Line,
  RiArrowRightUpLine,
  RiDashboardLine,
  RiEdit2Line,
  RiFolderOpenLine,
  RiGlobalLine,
  RiImageAddLine,
  RiInstagramLine,
  RiLinkedinLine,
  RiLogoutBoxRLine,
  RiShapesLine,
  RiMore2Line,
  RiTimeLine,
  RiTwitterXLine,
  RiCloseLine,
} from '@remixicon/react'
import {
  createAppRecord,
  fetchAdminSnapshot,
  insertCategory,
  recordActivity,
  updateAppRecord,
  uploadLogo,
} from '../../../lib/app-data'
import {
  createEmptyAppForm,
  dashboardSections,
  frameworkOptions,
  socialFieldOptions,
  stackOptions,
  storeFieldOptions,
} from '../../../lib/app-options'
import { getSupabaseBrowserClient, hasSupabaseEnv } from '../../../lib/supabase'
import Input from '../../ui/Input'
import SearchableSelect from '../../ui/SearchableSelect'
import ThemeToggle from '../ThemeToggle'
import SetupState from '../SetupState'
import WorkspaceBrand from '../WorkspaceBrand'

const navGroups = [
  {
    label: 'Dashboard',
    icon: RiDashboardLine,
    links: dashboardSections,
  },
  {
    label: 'Add a New App',
    icon: RiAddCircleLine,
    links: [{ value: 'create', label: 'Create app', href: '/admin/add' }],
  },
  {
    label: 'Update Apps',
    icon: RiEdit2Line,
    links: [{ value: 'update', label: 'Manage apps', href: '/admin/update' }],
  },
]

function adminViewFromPath(path) {
  if (path === '/admin' || path === '/admin/dashboard') return { page: 'dashboard', section: 'overview' }
  if (path.startsWith('/admin/dashboard/')) {
    return {
      page: 'dashboard',
      section: path.replace('/admin/dashboard/', ''),
    }
  }
  if (path === '/admin/add') return { page: 'add', section: 'create' }
  if (path === '/admin/update') return { page: 'update', section: 'update' }
  return { page: 'dashboard', section: 'overview' }
}

function formatDate(value) {
  if (!value) return 'Pending'
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function NavTree({ groups, currentPath }) {
  return (
    <div className="space-y-5">
      {groups.map((group) => {
        const GroupIcon = group.icon
        return (
          <div key={group.label} className="space-y-2">
            <div className="flex items-center gap-2 px-1">
              <GroupIcon className="h-4 w-4 text-brand-500" />
              <Text className="text-xs font-semibold uppercase tracking-[0.24em] text-mist-500 dark:text-mist-400">{group.label}</Text>
            </div>
            <div className="space-y-1 border-l border-mist-200 pl-4 dark:border-ink-700">
              {group.links.map((item) => {
                const isActive = currentPath === item.href || (item.href === '/admin/dashboard' && currentPath === '/admin')
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`block rounded-xl px-3 py-2 text-sm transition ${
                      isActive
                        ? 'bg-white text-ink-950 shadow-sm ring-1 ring-mist-200 dark:bg-ink-800 dark:text-mist-200 dark:ring-ink-700'
                        : 'text-mist-500 hover:bg-white hover:text-ink-950 dark:text-mist-300 dark:hover:bg-ink-800 dark:hover:text-mist-200'
                    }`}
                  >
                    {item.label}
                  </Link>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function AdminOptionsMenu({ onSignOut }) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          aria-label="Open admin options"
          className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-mist-200/80 bg-white text-ink-950 shadow-sm transition hover:border-mist-300 dark:border-ink-700 dark:bg-ink-800 dark:text-mist-200 dark:hover:border-ink-600"
        >
          <RiMore2Line className="h-5 w-5" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          sideOffset={10}
          align="end"
          className="z-50 min-w-[180px] rounded-2xl border border-mist-200/80 bg-white p-2 shadow-soft outline-none data-[side=bottom]:animate-slideDownAndFade dark:border-ink-700 dark:bg-ink-900 dark:shadow-soft-dark"
        >
          <DropdownMenu.Item asChild>
            <button
              type="button"
              onClick={onSignOut}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-ink-950 transition hover:bg-mist-100 dark:text-mist-200 dark:hover:bg-ink-800"
            >
              <RiLogoutBoxRLine className="h-4 w-4" />
              Sign out
            </button>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}

function sanitizeLinks(group) {
  return Object.fromEntries(Object.entries(group).filter(([, value]) => value?.trim()))
}

function appPayloadFromForm(form, logoUrl) {
  return {
    slug: form.slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
    name: form.name.trim(),
    short_description: form.shortDescription.trim(),
    description: form.description.trim(),
    category_id: form.categoryIds[0] || null,
    category_ids: form.categoryIds,
    logo_url: logoUrl || form.logoUrl || null,
    accent_color: form.accentColor || '#c2ff29',
    stacks: form.stacks,
    frameworks: form.frameworks,
    social_links: sanitizeLinks(form.socialLinks),
    store_links: sanitizeLinks(form.storeLinks),
    status: form.status,
  }
}

function hydrateForm(app) {
  return {
    name: app.name ?? '',
    slug: app.slug ?? '',
    shortDescription: app.shortDescription ?? '',
    description: app.description ?? '',
    categoryIds: app.categoryIds ?? (app.category?.id ? [app.category.id] : []),
    stacks: app.stacks ?? [],
    frameworks: app.frameworks ?? [],
    accentColor: app.accentColor ?? '#c2ff29',
    status: app.status ?? 'draft',
    socialLinks: {
      website: app.socialLinks?.website ?? '',
      x: app.socialLinks?.x ?? '',
      instagram: app.socialLinks?.instagram ?? '',
      github: app.socialLinks?.github ?? '',
      linkedin: app.socialLinks?.linkedin ?? '',
    },
    storeLinks: {
      app_store: app.storeLinks?.app_store ?? '',
      google_play: app.storeLinks?.google_play ?? '',
      web_app: app.storeLinks?.web_app ?? '',
    },
    logoFile: null,
    logoUrl: app.logoUrl ?? '',
  }
}

function EmptyCard({ title, description }) {
  return (
    <Card className="rounded-3xl border border-dashed border-mist-300 bg-mist-50/80 p-8 dark:border-ink-700 dark:bg-ink-900/60">
      <Title>{title}</Title>
      <Text className="mt-2">{description}</Text>
    </Card>
  )
}

function CategoryDialog({ open, onOpenChange, value, onValueChange, onSubmit, loading }) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-ink-950/45 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-[1.75rem] border border-mist-200/80 bg-white p-6 shadow-soft outline-none dark:border-ink-700 dark:bg-ink-950 dark:shadow-soft-dark">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <Badge color="lime">New category</Badge>
              <Title>Create a category</Title>
              <Text>Add a new category without leaving the app form.</Text>
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label="Close category dialog"
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-mist-200/80 text-mist-500 transition hover:border-mist-300 hover:text-ink-950 dark:border-ink-700 dark:text-mist-400 dark:hover:border-ink-600 dark:hover:text-mist-200"
              >
                <RiCloseLine className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>

          <div className="mt-6 space-y-2">
            <Text>Name</Text>
            <Input value={value} placeholder="e.g. Wellness AI" onChange={(event) => onValueChange(event.target.value)} />
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Dialog.Close asChild>
              <Button type="button" variant="secondary" className="rounded-2xl">
                Cancel
              </Button>
            </Dialog.Close>
            <Button type="button" loading={loading} className="rounded-2xl" onClick={onSubmit}>
              Save category
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function LoginView({ credentials, onChange, onSubmit, error, loading }) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md items-center px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full rounded-3xl border border-mist-200/80 bg-white/90 p-8 shadow-soft dark:border-ink-700/80 dark:bg-ink-900/85 dark:shadow-soft-dark">
        <div className="space-y-3 text-center">
          <Badge color="lime">CREAI Admin</Badge>
          <Title>Sign in to manage the app catalog</Title>
          <Text>Use your Supabase email and password to access the Tremor workspace.</Text>
        </div>

        {error ? (
          <Callout className="mt-6" color="rose" title="Login failed">
            {error}
          </Callout>
        ) : null}

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Text>Email</Text>
            <Input
              type="email"
              placeholder="admin@creai.co"
              value={credentials.email}
              onChange={(event) => onChange('email', event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Text>Password</Text>
            <Input
              type="password"
              placeholder="Password"
              value={credentials.password}
              onChange={(event) => onChange('password', event.target.value)}
            />
          </div>
          <Button type="submit" loading={loading} className="w-full rounded-2xl">
            Sign in
          </Button>
        </form>
      </Card>
    </div>
  )
}

function AppForm({
  title,
  form,
  categories,
  onCreateCategory,
  onChange,
  onLinksChange,
  onSubmit,
  submitLabel,
  loading,
}) {
  const categoryOptions = categories.map((category) => ({
    value: category.id,
    label: category.name,
    icon: RiShapesLine,
    keywords: [category.slug],
  }))
  const statusOptions = [
    { value: 'draft', label: 'Draft' },
    { value: 'published', label: 'Published' },
  ]

  return (
    <div className="space-y-6">
      <Card className="rounded-3xl p-6">
        <div className="space-y-2">
          <Title>{title}</Title>
          <Text>Shape the app metadata, publishing state, and public-facing touchpoints.</Text>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <div className="space-y-2">
            <Text>Name</Text>
            <Input value={form.name} placeholder="Pulseboard" onChange={(event) => onChange('name', event.target.value)} />
          </div>
          <div className="space-y-2">
            <Text>Slug</Text>
            <Input value={form.slug} placeholder="pulseboard" onChange={(event) => onChange('slug', event.target.value)} />
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <Text>Short description</Text>
          <Input
            value={form.shortDescription}
            placeholder="A short summary for the public catalog."
            onChange={(event) => onChange('shortDescription', event.target.value)}
          />
        </div>

        <div className="mt-4 space-y-2">
          <Text>Description</Text>
          <Textarea
            rows={6}
            value={form.description}
            placeholder="Expanded product explanation, use case, and outcome."
            onChange={(event) => onChange('description', event.target.value)}
          />
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <div className="space-y-2">
            <Text>Categories</Text>
            <SearchableSelect
              multi
              value={form.categoryIds}
              onChange={(value) => onChange('categoryIds', value)}
              options={categoryOptions}
              placeholder="Select categories"
              searchPlaceholder="Search categories..."
              emptyMessage="No categories found."
              actionLabel={categories.length ? 'Add category' : 'Add new category'}
              onAction={onCreateCategory}
              icon={RiShapesLine}
            />
          </div>
          <div className="space-y-2">
            <Text>Status</Text>
            <SearchableSelect
              value={form.status}
              onChange={(value) => onChange('status', value)}
              options={statusOptions}
              placeholder="Select status"
              searchPlaceholder="Search status..."
              emptyMessage="No status found."
            />
          </div>
          <div className="space-y-2">
            <Text>Accent color</Text>
            <input
              type="color"
              value={form.accentColor}
              onChange={(event) => onChange('accentColor', event.target.value)}
              className="h-11 w-full cursor-pointer rounded-xl border border-mist-300 bg-white px-2 py-2 dark:border-ink-700 dark:bg-ink-900"
            />
          </div>
        </div>

      </Card>

      <Card className="rounded-3xl p-6">
        <Title>Product stack</Title>
        <Text className="mt-2">Select the stack and iOS-focused frameworks used in the app.</Text>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <div className="space-y-2">
            <Text>Stacks</Text>
            <SearchableSelect
              multi
              value={form.stacks}
              onChange={(value) => onChange('stacks', value)}
              options={stackOptions}
              placeholder="Select stacks"
              searchPlaceholder="Search stacks..."
              emptyMessage="No stack matched."
            />
          </div>
          <div className="space-y-2">
            <Text>Frameworks</Text>
            <SearchableSelect
              multi
              value={form.frameworks}
              onChange={(value) => onChange('frameworks', value)}
              options={frameworkOptions}
              placeholder="Select frameworks"
              searchPlaceholder="Search frameworks..."
              emptyMessage="No framework matched."
            />
          </div>
        </div>
      </Card>

      <Card className="rounded-3xl p-6">
        <Title>Brand assets</Title>
        <Text className="mt-2">Upload a single product logo for the directory and detail page.</Text>
        <div className="mt-6 space-y-3">
          <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-mist-300 px-4 py-4 dark:border-ink-700">
            <RiImageAddLine className="h-5 w-5 text-brand-500" />
            <span className="text-sm text-mist-500 dark:text-mist-300">
              {form.logoFile ? form.logoFile.name : form.logoUrl ? 'Existing logo attached' : 'Choose a logo file'}
            </span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => onChange('logoFile', event.target.files?.[0] ?? null)}
            />
          </label>
          {form.logoUrl ? <Text>Current logo: {form.logoUrl}</Text> : null}
        </div>
      </Card>

      <Card className="rounded-3xl p-6">
        <Title>Social links</Title>
        <Text className="mt-2">These links appear in the app detail header only if they are filled in.</Text>
        <div className="mt-6 space-y-4">
          {socialFieldOptions.map((field) => (
            <div key={field.key} className="space-y-2">
              <Text>{field.label}</Text>
              <Input
                value={form.socialLinks[field.key]}
                placeholder={`https://${field.label.toLowerCase()}.com/...`}
                onChange={(event) => onLinksChange('socialLinks', field.key, event.target.value)}
              />
            </div>
          ))}
        </div>
      </Card>

      <Card className="rounded-3xl p-6">
        <Title>Store links</Title>
        <Text className="mt-2">Badges will only render on the detail page when the related link exists.</Text>
        <div className="mt-6 space-y-4">
          {storeFieldOptions.map((field) => (
            <div key={field.key} className="space-y-2">
              <Text>{field.label}</Text>
              <Input
                value={form.storeLinks[field.key]}
                placeholder={`Paste the ${field.label} URL`}
                onChange={(event) => onLinksChange('storeLinks', field.key, event.target.value)}
              />
            </div>
          ))}
        </div>
      </Card>

      <Button loading={loading} className="w-full rounded-2xl" onClick={onSubmit}>
        {submitLabel}
      </Button>
    </div>
  )
}

export default function AdminWorkspace({ route }) {
  const [credentials, setCredentials] = useState({ email: '', password: '' })
  const [session, setSession] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [submittingLogin, setSubmittingLogin] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [loadingSnapshot, setLoadingSnapshot] = useState(false)
  const [operationLoading, setOperationLoading] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [apps, setApps] = useState([])
  const [categories, setCategories] = useState([])
  const [activity, setActivity] = useState([])
  const [createForm, setCreateForm] = useState(createEmptyAppForm())
  const [editForm, setEditForm] = useState(createEmptyAppForm())
  const [selectedAppId, setSelectedAppId] = useState('')
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false)
  const [categoryDialogValue, setCategoryDialogValue] = useState('')
  const [categoryTarget, setCategoryTarget] = useState('create')

  const view = adminViewFromPath(route.path)
  const selectedApp = useMemo(() => apps.find((item) => item.id === selectedAppId) || null, [apps, selectedAppId])
  const dashboardMetrics = useMemo(() => {
    return {
      totalApps: apps.length,
      publishedApps: apps.filter((app) => app.status === 'published').length,
      totalCategories: categories.length,
      recentActivity: activity.length,
    }
  }, [activity.length, apps, categories.length])

  const supabase = hasSupabaseEnv ? getSupabaseBrowserClient() : null

  useEffect(() => {
    if (!notice) return undefined
    const timeoutId = window.setTimeout(() => setNotice(''), 3200)
    return () => window.clearTimeout(timeoutId)
  }, [notice])

  async function loadSnapshot() {
    if (!supabase) return

    setLoadingSnapshot(true)
    setError('')

    try {
      const snapshot = await fetchAdminSnapshot()
      setApps(snapshot.apps)
      setCategories(snapshot.categories)
      setActivity(snapshot.activity)

      if (!selectedAppId && snapshot.apps[0]) {
        setSelectedAppId(snapshot.apps[0].id)
        setEditForm(hydrateForm(snapshot.apps[0]))
      }
    } catch (reason) {
      setError(reason.message || 'Unable to load admin data.')
    } finally {
      setLoadingSnapshot(false)
    }
  }

  useEffect(() => {
    if (!supabase) {
      setAuthLoading(false)
      return
    }

    let isMounted = true

    supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!isMounted) return
      if (sessionError) setError(sessionError.message)
      setSession(data.session)
      setAuthLoading(false)
      if (data.session) loadSnapshot()
    })

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!isMounted) return
      setSession(nextSession)
      setAuthLoading(false)
      if (nextSession) {
        loadSnapshot()
      } else {
        setApps([])
        setCategories([])
        setActivity([])
        setSelectedAppId('')
        setEditForm(createEmptyAppForm())
      }
    })

    return () => {
      isMounted = false
      subscription.subscription.unsubscribe()
    }
  }, [supabase])

  useEffect(() => {
    if (selectedApp) {
      setEditForm(hydrateForm(selectedApp))
    }
  }, [selectedApp])

  useEffect(() => {
    if (session) {
      loadSnapshot()
    }
  }, [route.path, session])

  const updateFormState = (setter, key, value) => {
    setter((current) => ({ ...current, [key]: value }))
  }

  const updateNestedLinkState = (setter, group, key, value) => {
    setter((current) => ({
      ...current,
      [group]: {
        ...current[group],
        [key]: value,
      },
    }))
  }

  function openCategoryDialog(target) {
    setCategoryTarget(target)
    setCategoryDialogValue('')
    setCategoryDialogOpen(true)
  }

  async function handleCreateCategory() {
    if (!session) return
    if (!categoryDialogValue.trim()) return

    setOperationLoading(true)
    setError('')

    try {
      const category = await insertCategory(categoryDialogValue)
      await recordActivity({
        action: 'created',
        entityType: 'category',
        entityId: category.id,
        actorEmail: session.user.email,
        details: { name: category.name },
      })
      setCategories((current) => [...current, category].sort((a, b) => a.name.localeCompare(b.name)))
      const targetSetter = categoryTarget === 'edit' ? setEditForm : setCreateForm
      targetSetter((current) => ({
        ...current,
        categoryIds: current.categoryIds.includes(category.id) ? current.categoryIds : [...current.categoryIds, category.id],
      }))
      setCategoryDialogValue('')
      setCategoryDialogOpen(false)
      setNotice(`Created category "${category.name}".`)
      await loadSnapshot()
    } catch (reason) {
      setError(reason.message || 'Unable to create category.')
    } finally {
      setOperationLoading(false)
    }
  }

  async function handleCreateApp() {
    if (!session) return

    setOperationLoading(true)
    setError('')
    setNotice('')

    try {
      let logoUrl = createForm.logoUrl
      if (createForm.logoFile) {
        logoUrl = await uploadLogo(createForm.logoFile, session.user.id)
      }

      const payload = appPayloadFromForm(createForm, logoUrl)
      const createdApp = await createAppRecord(payload, session.user.email)
      setCreateForm(createEmptyAppForm())
      setSelectedAppId(createdApp.id)
      setEditForm(hydrateForm(createdApp))
      setNotice(`Created ${createdApp.name}.`)
      await loadSnapshot()
    } catch (reason) {
      setError(reason.message || 'Unable to create the app.')
    } finally {
      setOperationLoading(false)
    }
  }

  async function handleUpdateApp() {
    if (!session || !selectedApp) return

    setOperationLoading(true)
    setError('')
    setNotice('')

    try {
      let logoUrl = editForm.logoUrl
      if (editForm.logoFile) {
        logoUrl = await uploadLogo(editForm.logoFile, session.user.id)
      }

      const payload = appPayloadFromForm(editForm, logoUrl)
      const updatedApp = await updateAppRecord(selectedApp.id, payload, session.user.email)
      setEditForm(hydrateForm(updatedApp))
      setNotice(`Updated ${updatedApp.name}.`)
      await loadSnapshot()
    } catch (reason) {
      setError(reason.message || 'Unable to update the app.')
    } finally {
      setOperationLoading(false)
    }
  }

  async function handleLogin(event) {
    event.preventDefault()
    if (!supabase) return

    setSubmittingLogin(true)
    setLoginError('')

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    })

    if (signInError) {
      setLoginError(signInError.message || 'Unable to sign in.')
    }

    setSubmittingLogin(false)
  }

  async function handleSignOut() {
    if (!supabase) return
    await supabase.auth.signOut()
  }

  if (!hasSupabaseEnv) {
    return (
      <SetupState
        title="Prepare the CREAI admin workspace"
        description="Connect Supabase to enable authentication, category management, and app publishing."
      />
    )
  }

  if (authLoading) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-4 py-12 sm:px-6 lg:px-8">
        <Card className="w-full rounded-3xl p-8">
          <Text>Checking your admin session...</Text>
        </Card>
      </div>
    )
  }

  if (!session) {
    return (
      <LoginView
        credentials={credentials}
        onChange={(key, value) => setCredentials((current) => ({ ...current, [key]: value }))}
        onSubmit={handleLogin}
        error={loginError}
        loading={submittingLogin}
      />
    )
  }

  const renderDashboardContent = () => {
    switch (view.section) {
      case 'recent-updates':
        return (
          <Card className="rounded-3xl p-6">
            <Title>Recent updates</Title>
            <Text className="mt-2">Latest app changes recorded in the workspace.</Text>
            <Table className="mt-6">
              <TableHead>
                <TableRow>
                  <TableHeaderCell>App</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                  <TableHeaderCell>Updated</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {apps.slice(0, 10).map((app) => (
                  <TableRow key={app.id}>
                    <TableCell>{app.name}</TableCell>
                    <TableCell>
                      <Badge color={app.status === 'published' ? 'lime' : 'gray'}>{app.status}</Badge>
                    </TableCell>
                    <TableCell>{formatDate(app.updatedAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )
      case 'categories':
        return (
          <Card className="rounded-3xl p-6">
            <Title>Categories</Title>
            <Text className="mt-2">Every category currently available to the app creation flow.</Text>
            <div className="mt-6 flex flex-wrap gap-2">
              {categories.map((category) => (
                <Badge key={category.id}>{category.name}</Badge>
              ))}
            </div>
          </Card>
        )
      case 'quick-actions':
        return (
          <Grid numItemsLg={2} className="gap-4">
            <Card className="rounded-3xl p-6">
              <Title>Create a new app</Title>
              <Text className="mt-2">Open the app creation form and publish a new product entry.</Text>
              <Link href="/admin/add" className="mt-6 inline-flex">
                <Button icon={RiAddCircleLine}>Go to Add a New App</Button>
              </Link>
            </Card>
            <Card className="rounded-3xl p-6">
              <Title>Update an existing app</Title>
              <Text className="mt-2">Review the table of existing entries and edit one in place.</Text>
              <Link href="/admin/update" className="mt-6 inline-flex">
                <Button icon={RiEdit2Line} variant="secondary">
                  Go to Update Apps
                </Button>
              </Link>
            </Card>
          </Grid>
        )
      case 'recent-activity':
      case 'activity-timeline':
        return (
          <Card className="rounded-3xl p-6">
            <Title>{view.section === 'recent-activity' ? 'Recent activity' : 'Activity timeline'}</Title>
            <Text className="mt-2">A rolling log of admin actions recorded in Supabase.</Text>
            <div className="mt-6 space-y-4">
              {activity.map((item) => (
                <div key={item.id} className="rounded-2xl border border-mist-200/70 p-4 dark:border-ink-700">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge color="lime">{item.action}</Badge>
                    <Badge color="gray">{item.entity_type}</Badge>
                    <Text>{item.actor_email || 'Unknown user'}</Text>
                  </div>
                  <Text className="mt-2">{formatDate(item.created_at)}</Text>
                </div>
              ))}
            </div>
          </Card>
        )
      case 'overview':
      default:
        return (
          <div className="space-y-6">
            <Grid numItemsLg={4} className="gap-4">
              <Card className="rounded-3xl">
                <Text>Total apps</Text>
                <Title className="mt-2">{dashboardMetrics.totalApps}</Title>
              </Card>
              <Card className="rounded-3xl">
                <Text>Published</Text>
                <Title className="mt-2">{dashboardMetrics.publishedApps}</Title>
              </Card>
              <Card className="rounded-3xl">
                <Text>Categories</Text>
                <Title className="mt-2">{dashboardMetrics.totalCategories}</Title>
              </Card>
              <Card className="rounded-3xl">
                <Text>Activity items</Text>
                <Title className="mt-2">{dashboardMetrics.recentActivity}</Title>
              </Card>
            </Grid>

            <Grid numItemsLg={2} className="gap-6">
              <Card className="rounded-3xl p-6">
                <Title>Recently updated apps</Title>
                <div className="mt-4 space-y-3">
                  {apps.slice(0, 5).map((app) => (
                    <div key={app.id} className="rounded-2xl border border-mist-200/70 p-4 dark:border-ink-700">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <Text className="font-medium">{app.name}</Text>
                          <Text>{app.category?.name ?? 'Uncategorized'}</Text>
                        </div>
                        <Badge color={app.status === 'published' ? 'lime' : 'gray'}>{app.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="rounded-3xl p-6">
                <Title>Recent activity</Title>
                <div className="mt-4 space-y-3">
                  {activity.slice(0, 5).map((item) => (
                    <div key={item.id} className="rounded-2xl border border-mist-200/70 p-4 dark:border-ink-700">
                      <Text className="font-medium capitalize">{item.action}</Text>
                      <Text>{item.actor_email || 'Unknown user'}</Text>
                    </div>
                  ))}
                </div>
              </Card>
            </Grid>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-mist-100 p-4 dark:bg-ink-950 lg:p-5">
      <div className="mx-auto max-w-[1680px] overflow-hidden rounded-[2rem] border border-mist-200/80 bg-white shadow-soft dark:border-ink-700 dark:bg-ink-950 dark:shadow-soft-dark">
        <div className="flex min-h-[calc(100vh-2.5rem)] flex-col lg:flex-row">
        <aside className="flex w-full flex-col gap-6 border-b border-mist-200/80 bg-mist-50/70 p-5 dark:border-ink-700 dark:bg-ink-900/70 lg:h-[calc(100vh-2.5rem)] lg:w-[280px] lg:flex-none lg:border-b-0 lg:border-r lg:overflow-hidden">
          <div className="flex h-full flex-col gap-6">
            <div className="space-y-5">
              <WorkspaceBrand label="Admin" value={<AdminOptionsMenu onSignOut={handleSignOut} />} />
              <Text>Manage categories, products, publishing state, and activity from one catalog workspace.</Text>
            </div>

            <NavTree groups={navGroups} currentPath={route.path} />

            <div className="mt-auto space-y-3 border-t border-mist-200/80 pt-4 dark:border-ink-700">
              <ThemeToggle />
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1 p-6 lg:h-[calc(100vh-2.5rem)] lg:overflow-y-auto lg:p-8">
          <div className="mx-auto flex max-w-6xl flex-col gap-6 pb-8">
            <Flex
              flexDirection="col"
              justifyContent="between"
              alignItems="start"
              className="gap-4 rounded-[2rem] border border-mist-200/80 bg-white/90 p-6 shadow-soft dark:border-ink-700/80 dark:bg-ink-900/80 dark:shadow-soft-dark lg:flex-row lg:items-center"
            >
              <div className="space-y-2">
                <Badge color="lime">{view.page === 'dashboard' ? 'Dashboard' : view.page === 'add' ? 'Add a New App' : 'Update Apps'}</Badge>
                <Title>
                  {view.page === 'dashboard'
                    ? 'Manage the CREAI app directory'
                    : view.page === 'add'
                      ? 'Create a new app record'
                      : 'Update existing app records'}
                </Title>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link href={route.publicRoot}>
                  <Button icon={RiArrowRightUpLine} variant="secondary" className="rounded-2xl">
                    Open public directory
                  </Button>
                </Link>
              </div>
            </Flex>

            {notice ? (
              <div className="fixed right-6 top-6 z-50 max-w-sm">
                <Card className="rounded-2xl border border-brand-200/80 bg-white/95 p-4 shadow-soft dark:border-brand-700/70 dark:bg-ink-900/95 dark:shadow-soft-dark">
                  <div className="flex items-start gap-3">
                    <Badge color="lime">Saved</Badge>
                    <Text>{notice}</Text>
                  </div>
                </Card>
              </div>
            ) : null}

            {error ? (
              <Callout color="rose" title="Something needs attention">
                {error}
              </Callout>
            ) : null}

            {loadingSnapshot ? (
              <Card className="rounded-3xl p-6">
                <Text>Loading admin data...</Text>
              </Card>
            ) : null}

            {!loadingSnapshot && view.page === 'dashboard' ? renderDashboardContent() : null}

            {!loadingSnapshot && view.page === 'add' ? (
              <AppForm
                title="New app entry"
                form={createForm}
                categories={categories}
                onCreateCategory={() => openCategoryDialog('create')}
                onChange={(key, value) => updateFormState(setCreateForm, key, value)}
                onLinksChange={(group, key, value) => updateNestedLinkState(setCreateForm, group, key, value)}
                onSubmit={handleCreateApp}
                submitLabel="Create app"
                loading={operationLoading}
              />
            ) : null}

            {!loadingSnapshot && view.page === 'update' ? (
              <div className="space-y-6">
                <Card className="rounded-3xl p-6">
                  <Title>Existing apps</Title>
                  <Text className="mt-2">Select an app from the table to load it into the update form.</Text>
                  {apps.length ? (
                    <Table className="mt-6">
                      <TableHead>
                        <TableRow>
                          <TableHeaderCell>App</TableHeaderCell>
                          <TableHeaderCell>Category</TableHeaderCell>
                          <TableHeaderCell>Status</TableHeaderCell>
                          <TableHeaderCell>Updated</TableHeaderCell>
                          <TableHeaderCell>Action</TableHeaderCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {apps.map((app) => (
                          <TableRow
                            key={app.id}
                            className="cursor-pointer"
                            onClick={() => {
                              setSelectedAppId(app.id)
                              setEditForm(hydrateForm(app))
                            }}
                          >
                            <TableCell>{app.name}</TableCell>
                            <TableCell>{app.category?.name ?? 'Uncategorized'}</TableCell>
                            <TableCell>
                              <Badge color={app.status === 'published' ? 'lime' : 'gray'}>{app.status}</Badge>
                            </TableCell>
                            <TableCell>{formatDate(app.updatedAt)}</TableCell>
                            <TableCell>
                              <Button
                                size="xs"
                                icon={RiEdit2Line}
                                variant={selectedAppId === app.id ? 'primary' : 'secondary'}
                                onClick={(event) => {
                                  event.stopPropagation()
                                  setSelectedAppId(app.id)
                                  setEditForm(hydrateForm(app))
                                }}
                              >
                                Update
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <EmptyCard title="No apps yet" description="Create the first app before returning to this screen." />
                  )}
                </Card>

                {selectedApp ? (
                  <AppForm
                    title={`Editing ${selectedApp.name}`}
                    form={editForm}
                    categories={categories}
                    onCreateCategory={() => openCategoryDialog('edit')}
                    onChange={(key, value) => updateFormState(setEditForm, key, value)}
                    onLinksChange={(group, key, value) => updateNestedLinkState(setEditForm, group, key, value)}
                    onSubmit={handleUpdateApp}
                    submitLabel="Save changes"
                    loading={operationLoading}
                  />
                ) : null}
              </div>
            ) : null}

            {!loadingSnapshot && !apps.length && view.page === 'dashboard' ? (
              <EmptyCard title="The catalog is empty" description="Create your first app to activate the public directory and dashboard metrics." />
            ) : null}
          </div>
        </main>
        </div>
      </div>
      <CategoryDialog
        open={categoryDialogOpen}
        onOpenChange={setCategoryDialogOpen}
        value={categoryDialogValue}
        onValueChange={setCategoryDialogValue}
        onSubmit={handleCreateCategory}
        loading={operationLoading}
      />
    </div>
  )
}
