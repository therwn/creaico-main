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
  deleteAppRecord,
  fetchAdminSnapshot,
  insertCategory,
  recordActivity,
  upsertWorkspaceSettings,
  updateAppRecord,
  uploadLogo,
} from '../../../lib/app-data'
import {
  createEmptyAppForm,
  dashboardSections,
  getPlatformMeta,
  getPlatformStatusMeta,
  mobileTechnologyOptions,
  platformOptions,
  platformStatusOptions,
  socialFieldOptions,
  stackOptions,
  webTechnologyOptions,
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
  {
    label: 'Appearance',
    icon: RiImageAddLine,
    links: [{ value: 'banner', label: 'Banner', href: '/admin/appearance/banner' }],
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
  if (path === '/admin/update') return { page: 'update', section: 'update', appId: null }
  if (path === '/admin/appearance/banner') return { page: 'appearance', section: 'banner' }
  if (path.startsWith('/admin/update/')) {
    return {
      page: 'update',
      section: 'update',
      appId: path.replace('/admin/update/', ''),
    }
  }
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

function formatDateTime(value) {
  if (!value) return 'Pending'
  return new Date(value).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function normalizeExternalUrl(value) {
  const trimmed = value?.trim()
  if (!trimmed) return ''
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return `https://${trimmed.replace(/^\/+/, '')}`
}

function getEnabledPlatforms(app) {
  return Object.entries(app?.platforms ?? {}).filter(([, platform]) => platform?.enabled)
}

function humanizeFieldName(value) {
  const labels = {
    short_description: 'short description',
    description: 'description',
    accent_color: 'accent color',
    github_repository: 'GitHub repository',
    social_links: 'social links',
    platforms: 'platform launches',
    logo_url: 'logo',
    category_ids: 'categories',
    stacks: 'stacks',
    web_technologies: 'web technologies',
    mobile_technologies: 'mobile technologies',
    slug: 'slug',
    name: 'name',
  }

  return labels[value] || value.replace(/_/g, ' ')
}

function ActivityEntry({ item, compact = false }) {
  const details = item.details ?? {}
  const changedFields = Array.isArray(details.changedFields) ? details.changedFields : []
  const changes = Array.isArray(details.changes) ? details.changes : []

  return (
    <div className="rounded-2xl border border-mist-200/70 p-4 dark:border-ink-700">
      <div className="flex flex-wrap items-center gap-2">
        <Badge color="lime" className="creai-badge">{item.action}</Badge>
        <Badge color="gray">{item.entity_type}</Badge>
        <Text>{item.actor_email || 'Unknown user'}</Text>
      </div>

      <div className="mt-3 space-y-2">
        <Text className="font-medium text-ink-950 dark:text-mist-200">{details.message || 'Workspace activity recorded.'}</Text>

        <div className="flex flex-wrap gap-2">
          {details.name ? <Badge color="gray">{details.name}</Badge> : null}
          {details.slug ? <Badge color="gray">slug: {details.slug}</Badge> : null}
          {typeof details.stackCount === 'number' ? <Badge color="gray">stacks: {details.stackCount}</Badge> : null}
          {typeof details.webTechnologyCount === 'number' ? <Badge color="gray">web tech: {details.webTechnologyCount}</Badge> : null}
          {typeof details.mobileTechnologyCount === 'number' ? <Badge color="gray">mobile tech: {details.mobileTechnologyCount}</Badge> : null}
          {typeof details.socialCount === 'number' ? <Badge color="gray">social: {details.socialCount}</Badge> : null}
          {typeof details.platformCount === 'number' ? <Badge color="gray">platforms: {details.platformCount}</Badge> : null}
          {typeof details.livePlatformCount === 'number' ? <Badge color="gray">live: {details.livePlatformCount}</Badge> : null}
        </div>

        {changedFields.length ? (
          <Text>
            Changed: {changedFields.map(humanizeFieldName).join(', ')}
          </Text>
        ) : null}

        {!compact && changes.length ? (
          <div className="space-y-2 rounded-2xl bg-mist-50 p-3 dark:bg-ink-900/70">
            {changes.map((change) => (
              <div key={`${change.field}-${change.before}-${change.after}`} className="text-sm">
                <span className="font-medium text-ink-950 dark:text-mist-200">{humanizeFieldName(change.field)}:</span>{' '}
                <span className="text-mist-500 dark:text-mist-400">{change.before}</span>{' '}
                <span aria-hidden="true">→</span>{' '}
                <span className="text-ink-950 dark:text-mist-200">{change.after}</span>
              </div>
            ))}
          </div>
        ) : null}

        <Text className="text-xs text-mist-500 dark:text-mist-400">
          {compact ? formatDate(item.created_at) : formatDateTime(item.created_at)}
        </Text>
      </div>
    </div>
  )
}

function NavTree({ groups, currentPath }) {
  return (
    <div className="space-y-5">
      {groups.map((group) => {
        const GroupIcon = group.icon
        return (
          <div key={group.label} className="space-y-2">
            <div className="flex items-center gap-2 px-1">
              <GroupIcon className="h-4 w-4 text-mist-500 dark:text-brand-300" />
              <Text className="text-xs font-semibold uppercase tracking-[0.24em] text-mist-500 dark:text-mist-400">{group.label}</Text>
            </div>
            <div className="space-y-1 border-l border-mist-200 pl-4 dark:border-ink-700">
              {group.links.map((item) => {
                const isActive =
                  currentPath === item.href ||
                  currentPath.startsWith(`${item.href}/`) ||
                  (item.href === '/admin/dashboard' && currentPath === '/admin')
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
  return Object.fromEntries(
    Object.entries(group)
      .map(([key, value]) => [key, normalizeExternalUrl(value)])
      .filter(([, value]) => value),
  )
}

function validateAppForm(form, apps = [], currentId = null) {
  if (!form.name.trim()) return 'App name is required.'

  const slug = form.slug
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  if (!slug) return 'Slug is required.'
  if (apps.some((app) => app.slug === slug && app.id !== currentId)) return 'This slug is already in use.'
  if (!form.shortDescription.trim()) return 'Short description is required.'
  if (!form.description.trim()) return 'Description is required.'
  if (!form.categoryIds.length) return 'Select at least one category.'
  if (!Object.values(form.platforms ?? {}).some((platform) => platform.enabled)) return 'Enable at least one platform.'

  return ''
}

function appPayloadFromForm(form, logoUrl) {
  const normalizedPlatforms = Object.fromEntries(
    Object.entries(form.platforms).map(([key, platform]) => [
      key,
      {
        enabled: Boolean(platform.enabled),
        status: platform.status || 'draft',
        url: platform.enabled ? normalizeExternalUrl(platform.url) : '',
      },
    ]),
  )

  return {
    slug: form.slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
    name: form.name.trim(),
    short_description: form.shortDescription.trim(),
    description: form.description.trim(),
    category_id: form.categoryIds[0] || null,
    category_ids: form.categoryIds,
    logo_url: logoUrl || form.logoUrl || null,
    accent_color: form.accentColor || '#c2ff29',
    github_repository: form.githubRepository.trim() || null,
    stacks: form.stacks,
    frameworks: form.mobileTechnologies,
    web_technologies: form.webTechnologies,
    mobile_technologies: form.mobileTechnologies,
    platforms: normalizedPlatforms,
    social_links: sanitizeLinks(form.socialLinks),
    store_links: {
      app_store: normalizedPlatforms.ios.url,
      google_play: normalizedPlatforms.android.url,
      web_app: normalizedPlatforms.web.url,
    },
    status: Object.values(normalizedPlatforms).some((platform) => platform.enabled && platform.status === 'live') ? 'published' : 'draft',
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
    webTechnologies: app.webTechnologies ?? [],
    mobileTechnologies: app.mobileTechnologies ?? [],
    accentColor: app.accentColor ?? '#c2ff29',
    githubRepository: app.githubRepository ?? '',
    platforms: {
      ios: { enabled: Boolean(app.platforms?.ios?.enabled), status: app.platforms?.ios?.status ?? 'draft', url: app.platforms?.ios?.url ?? '' },
      android: { enabled: Boolean(app.platforms?.android?.enabled), status: app.platforms?.android?.status ?? 'draft', url: app.platforms?.android?.url ?? '' },
      web: { enabled: Boolean(app.platforms?.web?.enabled), status: app.platforms?.web?.status ?? 'draft', url: app.platforms?.web?.url ?? '' },
    },
    socialLinks: {
      website: app.socialLinks?.website ?? '',
      x: app.socialLinks?.x ?? '',
      instagram: app.socialLinks?.instagram ?? '',
      github: app.socialLinks?.github ?? '',
      linkedin: app.socialLinks?.linkedin ?? '',
    },
    logoFile: null,
    logoUrl: app.logoUrl ?? '',
  }
}

function EmptyCard({ title, description }) {
  return (
    <Card className="creai-card rounded-3xl border border-dashed border-mist-300 p-8 dark:border-ink-700">
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
              <Badge color="lime" className="creai-badge">New category</Badge>
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
              <Button type="button" variant="secondary" className="creai-button-secondary rounded-2xl">
                Cancel
              </Button>
            </Dialog.Close>
            <Button type="button" loading={loading} className="creai-button-primary rounded-2xl" onClick={onSubmit}>
              Save category
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function DeleteAppDialog({ open, onOpenChange, appName, onConfirm, loading }) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-ink-950/45 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-[1.75rem] border border-mist-200/80 bg-white p-6 shadow-soft outline-none dark:border-ink-700 dark:bg-ink-950 dark:shadow-soft-dark">
          <div className="space-y-3">
            <Badge color="gray">Delete app</Badge>
            <Title>Remove this app from the catalog?</Title>
            <Text>
              {appName
                ? `${appName} will be removed from the directory and admin list.`
                : 'This app will be removed from the directory and admin list.'}
            </Text>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Dialog.Close asChild>
              <Button type="button" variant="secondary" className="creai-button-secondary rounded-2xl">
                Cancel
              </Button>
            </Dialog.Close>
            <Button type="button" color="rose" loading={loading} className="rounded-2xl" onClick={onConfirm}>
              Delete app
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
      <Card className="creai-card w-full rounded-3xl border border-mist-200/80 p-8 shadow-soft dark:border-ink-700/80 dark:shadow-soft-dark">
        <div className="space-y-3 text-center">
          <Badge color="lime" className="creai-badge">CREAI Admin</Badge>
          <Title>Sign in to manage the app catalog</Title>
          <Text>Access the catalog dashboard, banner controls, and app management workspace.</Text>
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
              placeholder="Enter your email"
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
          <Button type="submit" loading={loading} className="creai-button-primary w-full rounded-2xl">
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

  const hasWebPlatform = Boolean(form.platforms?.web?.enabled)
  const hasMobilePlatform = Boolean(form.platforms?.ios?.enabled || form.platforms?.android?.enabled)

  return (
    <div className="space-y-6">
      <Card className="creai-card rounded-3xl p-6">
        <div className="space-y-2">
          <Title>{title}</Title>
          <Text>Shape the shared metadata, platform launches, and public-facing touchpoints.</Text>
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

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
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
            <Text>Accent color</Text>
            <div className="flex h-11 items-center gap-3 rounded-xl border border-mist-300 bg-white px-3 dark:border-ink-700 dark:bg-ink-900">
              <input
                type="color"
                value={form.accentColor}
                onChange={(event) => onChange('accentColor', event.target.value)}
                className="h-7 w-10 cursor-pointer rounded-lg border-0 bg-transparent p-0"
              />
              <Input
                value={form.accentColor}
                placeholder="#A3E623"
                onChange={(event) => onChange('accentColor', event.target.value)}
                className="border-0 shadow-none"
              />
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <Text>GitHub repository</Text>
          <Input
            value={form.githubRepository}
            placeholder="owner/repo or https://github.com/owner/repo"
            onChange={(event) => onChange('githubRepository', event.target.value)}
          />
        </div>

      </Card>

      <Card className="creai-card rounded-3xl p-6">
        <Title>Platform launch settings</Title>
        <Text className="mt-2">Configure the launch state and public URL for each supported platform.</Text>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {platformOptions.map((platform) => (
            <div key={platform.key} className="rounded-3xl border border-mist-200/80 p-4 dark:border-ink-700">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <platform.icon className="h-4 w-4 text-mist-500 dark:text-mist-300" />
                  <Text className="font-medium">{platform.label}</Text>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    onChange('platforms', {
                      ...form.platforms,
                      [platform.key]: {
                        ...form.platforms[platform.key],
                        enabled: !form.platforms[platform.key].enabled,
                      },
                    })
                  }
                  className={`inline-flex h-7 items-center rounded-full px-3 text-xs font-medium transition ${
                    form.platforms[platform.key].enabled
                      ? 'bg-brand-500 text-ink-950'
                      : 'bg-mist-100 text-mist-500 dark:bg-ink-800 dark:text-mist-300'
                  }`}
                >
                  {form.platforms[platform.key].enabled ? 'Enabled' : 'Disabled'}
                </button>
              </div>

              <div className="mt-4 space-y-3">
                <div className="space-y-2">
                  <Text>Status</Text>
                  <SearchableSelect
                    value={form.platforms[platform.key].status}
                    onChange={(value) =>
                      onChange('platforms', {
                        ...form.platforms,
                        [platform.key]: {
                          ...form.platforms[platform.key],
                          status: value,
                        },
                      })
                    }
                    options={platformStatusOptions}
                    placeholder="Select launch status"
                    searchPlaceholder="Search launch status..."
                    emptyMessage="No launch status found."
                  />
                </div>
                <div className="space-y-2">
                  <Text>Launch URL</Text>
                  <Input
                    value={form.platforms[platform.key].url}
                    placeholder={`https://${platform.key === 'web' ? 'app.example.com' : 'example.com'}`}
                    onChange={(event) =>
                      onChange('platforms', {
                        ...form.platforms,
                        [platform.key]: {
                          ...form.platforms[platform.key],
                          url: event.target.value,
                        },
                      })
                    }
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="creai-card rounded-3xl p-6">
        <Title>Shared stack</Title>
        <Text className="mt-2">Choose the backend, infra, and product stack shared across every platform.</Text>

        <div className="mt-6 space-y-2">
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
      </Card>

      {hasWebPlatform ? (
        <Card className="creai-card rounded-3xl p-6">
          <Title>Web technologies</Title>
          <Text className="mt-2">Select the technologies powering the web experience.</Text>

          <div className="mt-6 space-y-2">
            <Text>Web technologies</Text>
            <SearchableSelect
              multi
              value={form.webTechnologies}
              onChange={(value) => onChange('webTechnologies', value)}
              options={webTechnologyOptions}
              placeholder="Select web technologies"
              searchPlaceholder="Search web technologies..."
              emptyMessage="No web technology matched."
            />
          </div>
        </Card>
      ) : null}

      {hasMobilePlatform ? (
        <Card className="creai-card rounded-3xl p-6">
          <Title>Mobile technologies</Title>
          <Text className="mt-2">Select the technologies used in iOS and Android builds.</Text>

          <div className="mt-6 space-y-2">
            <Text>Mobile technologies</Text>
            <SearchableSelect
              multi
              value={form.mobileTechnologies}
              onChange={(value) => onChange('mobileTechnologies', value)}
              options={mobileTechnologyOptions}
              placeholder="Select mobile technologies"
              searchPlaceholder="Search mobile technologies..."
              emptyMessage="No mobile technology matched."
            />
          </div>
        </Card>
      ) : null}

      <Card className="creai-card rounded-3xl p-6">
        <Title>Brand assets</Title>
        <Text className="mt-2">Upload a single product logo for the directory and detail page.</Text>
        <div className="mt-6 space-y-3">
          <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-mist-300 px-4 py-4 dark:border-ink-700">
            <RiImageAddLine className="h-5 w-5 text-mist-500 dark:text-brand-300" />
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

      <Card className="creai-card rounded-3xl p-6">
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

      <Button loading={loading} className="creai-button-primary w-full rounded-2xl" onClick={onSubmit}>
        {submitLabel}
      </Button>
    </div>
  )
}

function BannerSettingsCard({ form, onChange, onSave, loading }) {
  return (
    <Card className="creai-card rounded-3xl p-6">
      <div className="space-y-2">
        <Title>Directory banner</Title>
        <Text>Control the banner that appears above the catalog grid on the public directory.</Text>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="space-y-2">
          <Text>Eyebrow</Text>
          <Input
            value={form.bannerEyebrow}
            placeholder="CREAI directory"
            onChange={(event) => onChange('bannerEyebrow', event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Text>Title</Text>
          <Input
            value={form.bannerTitle}
            placeholder="Explore CREAI products in one place"
            onChange={(event) => onChange('bannerTitle', event.target.value)}
          />
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <Text>Description</Text>
        <Textarea
          rows={4}
          value={form.bannerDescription}
          placeholder="Short supporting description for the public directory banner."
          onChange={(event) => onChange('bannerDescription', event.target.value)}
        />
      </div>

      <div className="mt-4 space-y-2">
        <Text>Banner image URL</Text>
        <Input
          value={form.bannerImageUrl}
          placeholder="https://..."
          onChange={(event) => onChange('bannerImageUrl', event.target.value)}
        />
      </div>

      <div className="mt-6 overflow-hidden rounded-3xl border border-mist-200/80 dark:border-ink-700">
        <div className="relative h-[220px] w-full bg-mist-100 dark:bg-ink-900">
          {form.bannerImageUrl ? (
            <img src={form.bannerImageUrl} alt={form.bannerTitle || 'Directory banner preview'} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_top_left,_rgba(163,230,35,0.35),_transparent_34%),linear-gradient(135deg,_#0A0A0B_0%,_#111113_55%,_#1A1B1E_100%)]">
              <img src="/creailogo.svg" alt="CREAI" className="h-16 w-auto opacity-90" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950/80 via-ink-950/20 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-5">
            <div className="max-w-2xl space-y-2">
              <Badge color="lime" className="creai-badge">{form.bannerEyebrow || 'CREAI directory'}</Badge>
              <Title className="!text-white">{form.bannerTitle || 'Explore CREAI products in one place'}</Title>
              <Text className="!text-mist-200">{form.bannerDescription || 'Discover live apps, browse the stack, and open every product profile from a single catalog surface.'}</Text>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <Button loading={loading} className="creai-button-primary rounded-2xl" onClick={onSave}>
          Save banner
        </Button>
      </div>
    </Card>
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
  const [settingsForm, setSettingsForm] = useState({
    bannerEyebrow: 'CREAI directory',
    bannerTitle: 'Explore CREAI products in one place',
    bannerDescription: 'Discover live apps, browse the stack, and open every product profile from a single catalog surface.',
    bannerImageUrl: '',
  })
  const [createForm, setCreateForm] = useState(createEmptyAppForm())
  const [editForm, setEditForm] = useState(createEmptyAppForm())
  const [selectedAppId, setSelectedAppId] = useState('')
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false)
  const [categoryDialogValue, setCategoryDialogValue] = useState('')
  const [categoryTarget, setCategoryTarget] = useState('create')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const view = adminViewFromPath(route.path)
  const selectedApp = useMemo(
    () => apps.find((item) => item.id === (view.appId || selectedAppId)) || null,
    [apps, selectedAppId, view.appId],
  )
  const dashboardMetrics = useMemo(() => {
    return {
      totalApps: apps.length,
      webEnabledApps: apps.filter((app) => app.platforms?.web?.enabled).length,
      iosEnabledApps: apps.filter((app) => app.platforms?.ios?.enabled).length,
      androidEnabledApps: apps.filter((app) => app.platforms?.android?.enabled).length,
      livePlatforms: apps.reduce((total, app) => total + getEnabledPlatforms(app).filter(([, platform]) => platform.status === 'live').length, 0),
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
      setSettingsForm(snapshot.settings)
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
        details: {
          name: category.name,
          slug: category.slug,
          message: `Created category ${category.name}`,
        },
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

  async function handleSaveSettings() {
    if (!session) return

    setOperationLoading(true)
    setError('')
    setNotice('')

    try {
      const nextSettings = await upsertWorkspaceSettings(settingsForm)
      setSettingsForm(nextSettings)
      await recordActivity({
        action: 'updated',
        entityType: 'workspace',
        entityId: null,
        actorEmail: session.user.email,
        details: {
          message: 'Updated the public directory banner',
          section: 'banner',
        },
      })
      setNotice('Updated the directory banner.')
      await loadSnapshot()
    } catch (reason) {
      setError(reason.message || 'Unable to update the directory banner.')
    } finally {
      setOperationLoading(false)
    }
  }

  async function handleCreateApp() {
    if (!session) return

    const validationError = validateAppForm(createForm, apps)
    if (validationError) {
      setError(validationError)
      return
    }

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

    const validationError = validateAppForm(editForm, apps, selectedApp.id)
    if (validationError) {
      setError(validationError)
      return
    }

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

  async function handleDeleteApp() {
    if (!session || !selectedApp) return

    setOperationLoading(true)
    setError('')
    setNotice('')

    try {
      await deleteAppRecord(selectedApp.id, session.user.email)
      setDeleteDialogOpen(false)
      setSelectedAppId('')
      setEditForm(createEmptyAppForm())
      setNotice(`Deleted ${selectedApp.name}.`)
      await loadSnapshot()
    } catch (reason) {
      setError(reason.message || 'Unable to delete the app.')
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
        <Card className="creai-card w-full rounded-3xl p-8">
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
          <Card className="creai-card rounded-3xl p-6">
            <Title>Recent updates</Title>
            <Text className="mt-2">Latest app changes recorded in the workspace.</Text>
            <Table className="mt-6">
              <TableHead>
                <TableRow>
                  <TableHeaderCell>App</TableHeaderCell>
                  <TableHeaderCell>Platforms</TableHeaderCell>
                  <TableHeaderCell>Updated</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {apps.slice(0, 10).map((app) => (
                  <TableRow key={app.id}>
                    <TableCell>{app.name}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        {getEnabledPlatforms(app).map(([key, platform]) => {
                          const meta = getPlatformMeta(key)
                          const statusMeta = getPlatformStatusMeta(platform.status)
                          return (
                            <Badge key={key} color={statusMeta.color} className={statusMeta.className} icon={meta?.icon}>
                              {meta?.shortLabel || meta?.label || key}
                            </Badge>
                          )
                        })}
                      </div>
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
          <Card className="creai-card rounded-3xl p-6">
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
          <Grid numItemsLg={3} className="gap-4">
            <Card className="creai-card rounded-3xl p-6">
              <Title>Create a new app</Title>
              <Text className="mt-2">Open the app creation form and add a new product entry.</Text>
              <Link href="/admin/add" className="mt-6 inline-flex">
                <Button icon={RiAddCircleLine} className="creai-button-primary">Go to Add a New App</Button>
              </Link>
            </Card>
            <Card className="creai-card rounded-3xl p-6">
              <Title>Update an existing app</Title>
              <Text className="mt-2">Review the table of existing entries and edit one in place.</Text>
              <Link href="/admin/update" className="mt-6 inline-flex">
                <Button icon={RiEdit2Line} variant="secondary" className="creai-button-secondary">
                  Go to Update Apps
                </Button>
              </Link>
            </Card>
            <Card className="creai-card rounded-3xl p-6">
              <Title>Edit the public banner</Title>
              <Text className="mt-2">Open the appearance panel to manage the banner shown above the catalog grid.</Text>
              <Link href="/admin/appearance/banner" className="mt-6 inline-flex">
                <Button className="creai-button-primary">Open banner settings</Button>
              </Link>
            </Card>
          </Grid>
        )
      case 'banner':
        return (
          <BannerSettingsCard
            form={settingsForm}
            onChange={(key, value) => setSettingsForm((current) => ({ ...current, [key]: value }))}
            onSave={handleSaveSettings}
            loading={operationLoading}
          />
        )
      case 'recent-activity':
      case 'activity-timeline':
        return (
          <Card className="creai-card rounded-3xl p-6">
            <Title>Recent activity</Title>
            <Text className="mt-2">Detailed log of banner edits, category creation, app updates, and per-platform launch changes.</Text>
            <div className="mt-6 space-y-4">
              {activity.map((item) => <ActivityEntry key={item.id} item={item} />)}
            </div>
          </Card>
        )
      case 'overview':
      default:
        return (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
              <Card className="creai-card rounded-3xl">
                <Text>Total apps</Text>
                <Title className="mt-2">{dashboardMetrics.totalApps}</Title>
              </Card>
              <Card className="creai-card rounded-3xl">
                <Text>Web-enabled</Text>
                <Title className="mt-2">{dashboardMetrics.webEnabledApps}</Title>
              </Card>
              <Card className="creai-card rounded-3xl">
                <Text>iOS-enabled</Text>
                <Title className="mt-2">{dashboardMetrics.iosEnabledApps}</Title>
              </Card>
              <Card className="creai-card rounded-3xl">
                <Text>Android-enabled</Text>
                <Title className="mt-2">{dashboardMetrics.androidEnabledApps}</Title>
              </Card>
              <Card className="creai-card rounded-3xl">
                <Text>Live platforms</Text>
                <Title className="mt-2">{dashboardMetrics.livePlatforms}</Title>
              </Card>
              <Card className="creai-card rounded-3xl">
                <Text>Recent activity</Text>
                <Title className="mt-2">{dashboardMetrics.recentActivity}</Title>
              </Card>
            </div>

            <Grid numItemsLg={3} className="gap-6">
              <Card className="creai-card rounded-3xl p-6 lg:col-span-2">
                <Title>Recently updated apps</Title>
                <Text className="mt-2">Quick operational snapshot of the latest apps touched in the workspace.</Text>
                <Table className="mt-6">
                  <TableHead>
                    <TableRow>
                      <TableHeaderCell>App</TableHeaderCell>
                      <TableHeaderCell>Categories</TableHeaderCell>
                      <TableHeaderCell>Platforms</TableHeaderCell>
                      <TableHeaderCell>Updated</TableHeaderCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {apps.slice(0, 6).map((app) => (
                      <TableRow key={app.id}>
                        <TableCell>{app.name}</TableCell>
                        <TableCell>{app.categories?.map((category) => category.name).join(', ') || 'Uncategorized'}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-2">
                            {getEnabledPlatforms(app).map(([key, platform]) => {
                              const meta = getPlatformMeta(key)
                              const statusMeta = getPlatformStatusMeta(platform.status)
                              return (
                                <Badge key={key} color={statusMeta.color} className={statusMeta.className} icon={meta?.icon}>
                                  {meta?.shortLabel || meta?.label || key}
                                </Badge>
                              )
                            })}
                          </div>
                        </TableCell>
                        <TableCell>{formatDate(app.updatedAt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>

              <Card className="creai-card rounded-3xl p-6">
                <Title>Recent activity</Title>
                <Text className="mt-2">Latest actions across apps, categories, and banner settings.</Text>
                <div className="mt-4 space-y-3">
                  {activity.slice(0, 5).map((item) => <ActivityEntry key={item.id} item={item} compact />)}
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
              <Text>Manage categories, products, platform launches, and activity from one catalog workspace.</Text>
            </div>

            <NavTree groups={navGroups} currentPath={route.path} />

            <div className="mt-auto space-y-3 border-t border-mist-200/80 pt-4 dark:border-ink-700">
              <ThemeToggle />
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1 p-6 lg:h-[calc(100vh-2.5rem)] lg:overflow-y-auto lg:p-8">
          <div className="flex w-full flex-col gap-6 pb-8">
            <Flex
              flexDirection="col"
              justifyContent="between"
              alignItems="start"
              className="gap-4 rounded-[2rem] border border-mist-200/80 bg-white/90 p-6 shadow-soft dark:border-ink-700/80 dark:bg-ink-900/80 dark:shadow-soft-dark lg:flex-row lg:items-center"
            >
              <div className="space-y-2">
                <Badge color="lime" className="creai-badge">
                  {view.page === 'dashboard' ? 'Dashboard' : view.page === 'add' ? 'Add a New App' : view.page === 'appearance' ? 'Appearance' : 'Update Apps'}
                </Badge>
                <Title>
                  {view.page === 'dashboard'
                    ? 'Manage the CREAI app directory'
                    : view.page === 'add'
                      ? 'Create a new app record'
                      : view.page === 'appearance'
                        ? 'Manage public directory appearance'
                        : 'Update existing app records'}
                </Title>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link href={route.publicRoot}>
                  <Button icon={RiArrowRightUpLine} variant="secondary" className="creai-button-secondary rounded-2xl">
                    Open public directory
                  </Button>
                </Link>
              </div>
            </Flex>

            {notice ? (
              <div className="fixed right-6 top-6 z-50 max-w-sm">
                <Card className="creai-card rounded-2xl border border-brand-200/80 p-4 shadow-soft dark:border-brand-700/70 dark:shadow-soft-dark">
                  <div className="flex items-start gap-3">
                    <Badge color="lime" className="creai-badge">Saved</Badge>
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
              <Card className="creai-card rounded-3xl p-6">
                <Text>Loading admin data...</Text>
              </Card>
            ) : null}

            {!loadingSnapshot && view.page === 'dashboard' ? renderDashboardContent() : null}

            {!loadingSnapshot && view.page === 'appearance' ? renderDashboardContent() : null}

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
                {!view.appId ? (
                  <Card className="creai-card rounded-3xl p-6">
                    <Title>Manage apps</Title>
                    <Text className="mt-2">Open an app card to move into its dedicated edit screen.</Text>
                    {apps.length ? (
                      <Grid numItemsMd={2} numItemsLg={3} className="mt-6 gap-4">
                        {apps.map((app) => (
                          <Card key={app.id} className="creai-card rounded-3xl border border-mist-200/80 p-5 dark:border-ink-700/80">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-3">
                                {app.logoUrl ? (
                                  <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border border-mist-200/80 bg-white p-2 dark:border-ink-700/80 dark:bg-ink-900">
                                    <img src={app.logoUrl} alt={`${app.name} logo`} className="h-full w-full object-contain" />
                                  </div>
                                ) : (
                                  <div
                                    className="flex h-12 w-12 items-center justify-center rounded-2xl text-sm font-semibold text-ink-950"
                                    style={{ backgroundColor: app.accentColor || '#c2ff29' }}
                                  >
                                    {app.name.slice(0, 2).toUpperCase()}
                                  </div>
                                )}
                                <div className="space-y-1">
                                  <Text className="font-semibold text-ink-950 dark:text-mist-200">{app.name}</Text>
                                  <Text>{app.categories?.map((category) => category.name).join(', ') || 'Uncategorized'}</Text>
                                </div>
                              </div>
                              <Badge color={getEnabledPlatforms(app).some(([, platform]) => platform.status === 'live') ? 'lime' : 'gray'} className={getEnabledPlatforms(app).some(([, platform]) => platform.status === 'live') ? 'creai-badge' : ''}>
                                {getEnabledPlatforms(app).length ? `${getEnabledPlatforms(app).length} platform` : 'No platform'}
                              </Badge>
                            </div>

                            <Text className="mt-4 min-h-[44px]">{app.shortDescription || 'No short description added yet.'}</Text>
                            <div className="mt-4 flex flex-wrap gap-2">
                              {getEnabledPlatforms(app).map(([key, platform]) => {
                                const meta = getPlatformMeta(key)
                                const statusMeta = getPlatformStatusMeta(platform.status)
                                return (
                                  <Badge key={key} color={statusMeta.color} className={statusMeta.className} icon={meta?.icon}>
                                    {meta?.shortLabel || meta?.label || key}
                                  </Badge>
                                )
                              })}
                            </div>

                            <div className="mt-5 flex items-center justify-between gap-3">
                              <Text>{formatDate(app.updatedAt)}</Text>
                              <Link href={`/admin/update/${app.id}`}>
                                <Button size="xs" icon={RiEdit2Line} className="creai-button-primary">
                                  Edit
                                </Button>
                              </Link>
                            </div>
                          </Card>
                        ))}
                      </Grid>
                    ) : (
                      <EmptyCard title="No apps yet" description="Create the first app before returning to this screen." />
                    )}
                  </Card>
                ) : selectedApp ? (
                  <div className="space-y-6">
                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-mist-200/80 bg-white/90 p-5 dark:border-ink-700/80 dark:bg-ink-900/80">
                      <div className="space-y-1">
                        <Title>Editing {selectedApp.name}</Title>
                        <Text>{selectedApp.categories?.map((category) => category.name).join(', ') || 'Uncategorized'}</Text>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Link href="/admin/update">
                          <Button variant="secondary" className="creai-button-secondary rounded-2xl">
                            Back to manage
                          </Button>
                        </Link>
                        <Button color="rose" variant="secondary" className="rounded-2xl" onClick={() => setDeleteDialogOpen(true)}>
                          Delete app
                        </Button>
                      </div>
                    </div>

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
                  </div>
                ) : (
                  <EmptyCard title="App not found" description="Return to Manage apps and select a valid record to continue editing." />
                )}
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
      <DeleteAppDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        appName={selectedApp?.name}
        onConfirm={handleDeleteApp}
        loading={operationLoading}
      />
    </div>
  )
}
