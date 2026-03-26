'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  Badge,
  Button,
  Callout,
  Card,
  Divider,
  Flex,
  Grid,
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
  RiTimeLine,
  RiTwitterXLine,
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
import ThemeToggle from '../ThemeToggle'
import SetupState from '../SetupState'

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

function sanitizeLinks(group) {
  return Object.fromEntries(Object.entries(group).filter(([, value]) => value?.trim()))
}

function appPayloadFromForm(form, logoUrl) {
  return {
    slug: form.slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
    name: form.name.trim(),
    short_description: form.shortDescription.trim(),
    description: form.description.trim(),
    category_id: form.categoryId || null,
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
    categoryId: app.category?.id ?? '',
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
    <Card className="rounded-3xl border border-dashed border-slate-300 bg-slate-50/80 p-8 dark:border-slate-800 dark:bg-slate-900/60">
      <Title>{title}</Title>
      <Text className="mt-2">{description}</Text>
    </Card>
  )
}

function LoginView({ credentials, onChange, onSubmit, error, loading }) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md items-center px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full rounded-3xl border border-slate-200/80 bg-white/90 p-8 shadow-soft dark:border-slate-800/80 dark:bg-slate-950/85 dark:shadow-soft-dark">
        <div className="space-y-3 text-center">
          <Badge color="emerald">CREAI Admin</Badge>
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
            <TextInput
              type="email"
              placeholder="admin@creai.co"
              value={credentials.email}
              onChange={(event) => onChange('email', event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Text>Password</Text>
            <TextInput
              type="password"
              placeholder="Password"
              value={credentials.password}
              onChange={(event) => onChange('password', event.target.value)}
            />
          </div>
          <Button type="submit" loading={loading} color="emerald" className="w-full rounded-2xl">
            Sign in
          </Button>
        </form>
      </Card>
    </div>
  )
}

function CategoryCreator({ value, onChange, onSubmit, loading }) {
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/60">
      <div className="mb-3">
        <Text className="font-medium">Add a new category</Text>
        <Text>Create a category if the dropdown does not contain the one you need.</Text>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <TextInput value={value} placeholder="e.g. Wellness AI" onChange={(event) => onChange(event.target.value)} />
        <Button icon={RiAddCircleLine} loading={loading} onClick={onSubmit}>
          Add category
        </Button>
      </div>
    </div>
  )
}

function AppForm({
  title,
  form,
  categories,
  categoryDraft,
  onCategoryDraftChange,
  onCreateCategory,
  onChange,
  onLinksChange,
  onSubmit,
  submitLabel,
  loading,
}) {
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
            <TextInput value={form.name} placeholder="Pulseboard" onChange={(event) => onChange('name', event.target.value)} />
          </div>
          <div className="space-y-2">
            <Text>Slug</Text>
            <TextInput value={form.slug} placeholder="pulseboard" onChange={(event) => onChange('slug', event.target.value)} />
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <Text>Short description</Text>
          <TextInput
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
            <Text>Category</Text>
            <Select value={form.categoryId} onValueChange={(value) => onChange('categoryId', value)}>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Text>Status</Text>
            <Select value={form.status} onValueChange={(value) => onChange('status', value)}>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
            </Select>
          </div>
          <div className="space-y-2">
            <Text>Accent color</Text>
            <input
              type="color"
              value={form.accentColor}
              onChange={(event) => onChange('accentColor', event.target.value)}
              className="h-11 w-full cursor-pointer rounded-xl border border-slate-300 bg-white px-2 py-2 dark:border-slate-700 dark:bg-slate-900"
            />
          </div>
        </div>

        <div className="mt-6">
          <CategoryCreator
            value={categoryDraft}
            onChange={onCategoryDraftChange}
            onSubmit={onCreateCategory}
            loading={loading}
          />
        </div>
      </Card>

      <Card className="rounded-3xl p-6">
        <Title>Product stack</Title>
        <Text className="mt-2">Select the stack and iOS-focused frameworks used in the app.</Text>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <div className="space-y-2">
            <Text>Stacks</Text>
            <MultiSelect value={form.stacks} onValueChange={(value) => onChange('stacks', value)}>
              {stackOptions.map((item) => (
                <MultiSelectItem key={item} value={item}>
                  {item}
                </MultiSelectItem>
              ))}
            </MultiSelect>
          </div>
          <div className="space-y-2">
            <Text>Frameworks</Text>
            <MultiSelect value={form.frameworks} onValueChange={(value) => onChange('frameworks', value)}>
              {frameworkOptions.map((item) => (
                <MultiSelectItem key={item} value={item}>
                  {item}
                </MultiSelectItem>
              ))}
            </MultiSelect>
          </div>
        </div>
      </Card>

      <Card className="rounded-3xl p-6">
        <Title>Brand assets</Title>
        <Text className="mt-2">Upload a single product logo for the directory and detail page.</Text>
        <div className="mt-6 space-y-3">
          <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-slate-300 px-4 py-4 dark:border-slate-700">
            <RiImageAddLine className="h-5 w-5 text-brand-500" />
            <span className="text-sm text-slate-600 dark:text-slate-300">
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
              <TextInput
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
              <TextInput
                value={form.storeLinks[field.key]}
                placeholder={`Paste the ${field.label} URL`}
                onChange={(event) => onLinksChange('storeLinks', field.key, event.target.value)}
              />
            </div>
          ))}
        </div>
      </Card>

      <Button loading={loading} color="emerald" className="w-full rounded-2xl" onClick={onSubmit}>
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
  const [categoryDraft, setCategoryDraft] = useState('')

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

  async function handleCreateCategory(targetSetter, setCategoryId) {
    if (!categoryDraft.trim()) return
    if (!session) return

    setOperationLoading(true)
    setError('')

    try {
      const category = await insertCategory(categoryDraft)
      await recordActivity({
        action: 'created',
        entityType: 'category',
        entityId: category.id,
        actorEmail: session.user.email,
        details: { name: category.name },
      })
      setCategories((current) => [...current, category].sort((a, b) => a.name.localeCompare(b.name)))
      targetSetter((current) => ({ ...current, categoryId: category.id }))
      setCategoryId(category.id)
      setCategoryDraft('')
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
                      <Badge color={app.status === 'published' ? 'emerald' : 'amber'}>{app.status}</Badge>
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
                <div key={item.id} className="rounded-2xl border border-slate-200/70 p-4 dark:border-slate-800">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge color="emerald">{item.action}</Badge>
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
                    <div key={app.id} className="rounded-2xl border border-slate-200/70 p-4 dark:border-slate-800">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <Text className="font-medium">{app.name}</Text>
                          <Text>{app.category?.name ?? 'Uncategorized'}</Text>
                        </div>
                        <Badge color={app.status === 'published' ? 'emerald' : 'amber'}>{app.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="rounded-3xl p-6">
                <Title>Recent activity</Title>
                <div className="mt-4 space-y-3">
                  {activity.slice(0, 5).map((item) => (
                    <div key={item.id} className="rounded-2xl border border-slate-200/70 p-4 dark:border-slate-800">
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
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950">
      <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col lg:flex-row">
        <aside className="w-full border-b border-slate-200/80 bg-white/90 p-4 shadow-soft dark:border-slate-800/80 dark:bg-slate-950/85 dark:shadow-soft-dark lg:sticky lg:top-0 lg:h-screen lg:w-80 lg:border-b-0 lg:border-r lg:p-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <Badge color="emerald">CREAI Admin</Badge>
              <Title>Catalog workspace</Title>
              <Text>Manage categories, products, publishing state, and activity from one Tremor control room.</Text>
            </div>

            <div className="space-y-3">
              {navGroups.map((group) => {
                const GroupIcon = group.icon
                return (
                  <Card key={group.label} className="rounded-3xl p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <GroupIcon className="h-4 w-4 text-brand-500" />
                      <Text className="font-semibold">{group.label}</Text>
                    </div>
                    <div className="space-y-1">
                      {group.links.map((item) => {
                        const isActive = route.path === item.href || (item.href === '/admin/dashboard' && route.path === '/admin')
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            className={`block rounded-2xl px-3 py-2 text-sm transition ${
                              isActive
                                ? 'bg-brand-400/15 text-slate-950 dark:bg-brand-400/20 dark:text-white'
                                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900'
                            }`}
                          >
                            {item.label}
                          </Link>
                        )
                      })}
                    </div>
                  </Card>
                )
              })}
            </div>

            <div className="space-y-3">
              <ThemeToggle />
              <div className="flex flex-wrap gap-2">
                <Link href={route.publicRoot}>
                  <Button icon={RiApps2Line} variant="secondary">
                    View public app
                  </Button>
                </Link>
                <Button icon={RiLogoutBoxRLine} variant="secondary" onClick={handleSignOut}>
                  Sign out
                </Button>
              </div>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:h-screen lg:overflow-y-auto lg:px-8">
          <div className="mx-auto flex max-w-6xl flex-col gap-6 pb-8">
            <Flex
              flexDirection="col"
              justifyContent="between"
              alignItems="start"
              className="gap-4 rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-soft dark:border-slate-800/80 dark:bg-slate-950/80 dark:shadow-soft-dark lg:flex-row lg:items-center"
            >
              <div className="space-y-2">
                <Badge color="emerald">{view.page === 'dashboard' ? 'Dashboard' : view.page === 'add' ? 'Add a New App' : 'Update Apps'}</Badge>
                <Title>
                  {view.page === 'dashboard'
                    ? 'Manage the CREAI app directory'
                    : view.page === 'add'
                      ? 'Create a new app record'
                      : 'Update existing app records'}
                </Title>
                <Text>Signed in as {session.user.email}</Text>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link href={route.publicRoot}>
                  <Button icon={RiArrowRightUpLine}>Open public directory</Button>
                </Link>
              </div>
            </Flex>

            {notice ? (
              <Callout color="emerald" title="Success">
                {notice}
              </Callout>
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
                categoryDraft={categoryDraft}
                onCategoryDraftChange={setCategoryDraft}
                onCreateCategory={() => handleCreateCategory(setCreateForm, (value) => updateFormState(setCreateForm, 'categoryId', value))}
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
                          <TableRow key={app.id}>
                            <TableCell>{app.name}</TableCell>
                            <TableCell>{app.category?.name ?? 'Uncategorized'}</TableCell>
                            <TableCell>
                              <Badge color={app.status === 'published' ? 'emerald' : 'amber'}>{app.status}</Badge>
                            </TableCell>
                            <TableCell>{formatDate(app.updatedAt)}</TableCell>
                            <TableCell>
                              <Button
                                size="xs"
                                icon={RiEdit2Line}
                                variant={selectedAppId === app.id ? 'primary' : 'secondary'}
                                onClick={() => {
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
                    categoryDraft={categoryDraft}
                    onCategoryDraftChange={setCategoryDraft}
                    onCreateCategory={() => handleCreateCategory(setEditForm, (value) => updateFormState(setEditForm, 'categoryId', value))}
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
  )
}
