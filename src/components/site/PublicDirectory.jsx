'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  Badge,
  Callout,
  Card,
  Metric,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  Text,
  Title,
} from '@tremor/react'
import {
  RiApps2Line,
  RiComputerLine,
  RiAppsLine,
  RiFolderOpenLine,
  RiAppleFill,
  RiSearchLine,
  RiShapesLine,
  RiAndroidLine,
  RiTimeLine,
} from '@remixicon/react'
import { fetchApps, fetchWorkspaceSettings } from '../../lib/app-data'
import { getPlatformMeta, getPlatformStatusMeta, sortOptions } from '../../lib/app-options'
import { hasSupabaseEnv } from '../../lib/supabase'
import Input from '../ui/Input'
import DirectoryGridListBlock from './directory/DirectoryGridListBlock'
import ThemeToggle from './ThemeToggle'
import SetupState from './SetupState'
import WorkspaceBrand from './WorkspaceBrand'
import AppDetailView from './AppDetailView'

const availabilityOptions = [
  { value: 'all', label: 'All availability' },
  { value: 'web', label: 'Web enabled' },
  { value: 'mobile', label: 'Mobile enabled' },
  { value: 'live', label: 'Any live platform' },
]

function formatDate(value) {
  if (!value) return 'Recently'
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function hasLinks(group) {
  return Object.values(group ?? {}).some(Boolean)
}

function getEnabledPlatforms(app) {
  return Object.entries(app.platforms ?? {}).filter(([, platform]) => platform?.enabled)
}

export default function PublicDirectory({ publicRoot = '/', detailSlug = null }) {
  const [apps, setApps] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [availabilityFilter, setAvailabilityFilter] = useState('all')
  const [selectedSort, setSelectedSort] = useState('newest')
  const [settings, setSettings] = useState({
    bannerEyebrow: 'CREAI directory',
    bannerTitle: 'Explore CREAI products in one place',
    bannerDescription: 'Discover live apps, browse the stack, and open every product profile from a single catalog surface.',
    bannerImageUrl: '',
  })

  useEffect(() => {
    if (!hasSupabaseEnv) {
      setLoading(false)
      return
    }

    let isActive = true
    setLoading(true)

    Promise.all([fetchApps(), fetchWorkspaceSettings()])
      .then(([rows, workspaceSettings]) => {
        if (isActive) {
          setApps(rows)
          setSettings(workspaceSettings)
          setError('')
        }
      })
      .catch((reason) => {
        if (isActive) {
          setError(reason.message || 'Unable to load the app directory.')
        }
      })
      .finally(() => {
        if (isActive) setLoading(false)
      })

    return () => {
      isActive = false
    }
  }, [])

  const categories = useMemo(() => {
    const unique = new Map()
    apps.forEach((app) => {
      ;(app.categories ?? []).forEach((category) => {
        if (category?.id) unique.set(category.id, category)
      })
    })
    return [...unique.values()]
  }, [apps])

  const filteredApps = useMemo(() => {
    return apps.filter((app) => {
      const searchable = [
        app.name,
        app.shortDescription,
        app.description,
        app.category?.name,
        ...(app.categories ?? []).map((category) => category.name),
        ...(app.stacks ?? []),
        ...(app.webTechnologies ?? []),
        ...(app.mobileTechnologies ?? []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      if (searchQuery.trim() && !searchable.includes(searchQuery.trim().toLowerCase())) return false
      if (selectedCategory !== 'all' && !(app.categories ?? []).some((category) => category.id === selectedCategory)) return false
      if (availabilityFilter === 'web' && !app.platforms?.web?.enabled) return false
      if (availabilityFilter === 'mobile' && !((app.platforms?.ios?.enabled) || (app.platforms?.android?.enabled))) return false
      if (availabilityFilter === 'live' && !getEnabledPlatforms(app).some(([, platform]) => platform.status === 'live')) return false
      return true
    })
  }, [apps, availabilityFilter, searchQuery, selectedCategory])

  const sortedApps = useMemo(() => {
    const nextApps = [...filteredApps]

    const getDateValue = (value) => {
      if (!value) return 0
      const timestamp = new Date(value).getTime()
      return Number.isNaN(timestamp) ? 0 : timestamp
    }

    nextApps.sort((left, right) => {
      switch (selectedSort) {
        case 'oldest':
          return getDateValue(left.startedAt || left.createdAt) - getDateValue(right.startedAt || right.createdAt)
        case 'alphabetical':
          return left.name.localeCompare(right.name)
        case 'reverse-alphabetical':
          return right.name.localeCompare(left.name)
        case 'recently-launched':
          return getDateValue(right.launchedAt) - getDateValue(left.launchedAt)
        case 'newest':
        default:
          return getDateValue(right.startedAt || right.createdAt) - getDateValue(left.startedAt || left.createdAt)
      }
    })

    return nextApps
  }, [filteredApps, selectedSort])

  const metrics = useMemo(() => {
    return {
      total: apps.length,
      categories: categories.length,
      webEnabled: apps.filter((app) => app.platforms?.web?.enabled).length,
      iosEnabled: apps.filter((app) => app.platforms?.ios?.enabled).length,
      androidEnabled: apps.filter((app) => app.platforms?.android?.enabled).length,
    }
  }, [apps, categories.length])

  const highlightedCategories = useMemo(() => categories.slice(0, 5), [categories])

  if (!hasSupabaseEnv) {
    return (
      <SetupState
        title="Prepare the CREAI app directory"
        description="The Tremor public catalog is ready. Connect Supabase to load app records here."
      />
    )
  }

  const isDetailView = Boolean(detailSlug)

  return (
    <div className="h-screen overflow-hidden bg-mist-100 p-4 dark:bg-ink-950 lg:p-5">
      <div className="w-full overflow-hidden rounded-[2rem] border border-mist-200/80 bg-white shadow-soft dark:border-ink-700 dark:bg-ink-950 dark:shadow-soft-dark">
        <div className="flex min-h-[calc(100vh-2.5rem)] flex-col lg:flex-row">
          <aside className="flex w-full flex-col gap-6 border-b border-mist-200/80 bg-mist-50/70 p-5 dark:border-ink-700 dark:bg-ink-900/70 lg:h-[calc(100vh-2.5rem)] lg:w-[280px] lg:flex-none lg:border-b-0 lg:border-r lg:overflow-hidden">
            <div className="flex h-full flex-col gap-5">
              <WorkspaceBrand label="App Directory" value={<Badge color="lime" className="creai-badge">{metrics.total}</Badge>} />

              <div>
                <Input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search apps, stack, category..."
                  icon={RiSearchLine}
                />
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <Text className="text-xs font-semibold uppercase tracking-[0.24em] text-mist-500 dark:text-mist-400">Browse</Text>
                  <div className="space-y-1">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCategory('all')
                        setAvailabilityFilter('all')
                        setSelectedSort('newest')
                      }}
                      className="flex w-full items-center justify-between rounded-2xl bg-white px-3 py-2 text-left text-sm text-ink-950 shadow-sm dark:bg-ink-800 dark:text-mist-200"
                    >
                      <span className="flex items-center gap-3">
                        <RiFolderOpenLine className="h-4 w-4" />
                        App Directory
                      </span>
                      <Badge color="gray">{metrics.total}</Badge>
                    </button>
                    <div className="space-y-1 border-l border-mist-200 pl-4 dark:border-ink-700">
                      <button
                        type="button"
                        onClick={() => setSelectedCategory('all')}
                        className={`flex w-full items-center justify-between rounded-2xl px-3 py-2 text-left text-sm transition ${
                          selectedCategory === 'all'
                            ? 'bg-white text-ink-950 shadow-sm dark:bg-ink-800 dark:text-mist-200'
                            : 'text-mist-500 hover:bg-white dark:text-mist-300 dark:hover:bg-ink-800'
                        }`}
                      >
                        <span className="flex items-center gap-3">
                          <RiAppsLine className="h-4 w-4" />
                          All categories
                        </span>
                        <Badge color="gray">{metrics.categories}</Badge>
                      </button>
                      {highlightedCategories.map((category) => {
                        const count = apps.filter((app) => (app.categories ?? []).some((item) => item.id === category.id)).length
                      return (
                        <button
                          key={category.id}
                          type="button"
                          onClick={() => setSelectedCategory(category.id)}
                          className={`flex w-full items-center justify-between rounded-2xl px-3 py-2 text-left text-sm transition ${
                            selectedCategory === category.id
                              ? 'bg-white text-ink-950 shadow-sm dark:bg-ink-800 dark:text-mist-200'
                              : 'text-mist-500 hover:bg-white dark:text-mist-300 dark:hover:bg-ink-800'
                          }`}
                        >
                          <span className="flex items-center gap-3">
                            <RiShapesLine className="h-4 w-4" />
                            {category.name}
                          </span>
                          <Badge color="gray">{count}</Badge>
                        </button>
                      )
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-auto space-y-3 border-t border-mist-200/80 pt-4 dark:border-ink-700">
                <ThemeToggle />
                <Text className="text-xs text-mist-500 dark:text-mist-400">
                  Browse CREAI products, stacks, and launch surfaces from one catalog.
                </Text>
              </div>
            </div>
          </aside>

          <main className="creai-scrollbar min-w-0 flex-1 overflow-y-auto p-6 lg:h-[calc(100vh-2.5rem)] lg:p-8">
            <div className="mx-auto w-full max-w-[1040px] space-y-8">
              {isDetailView ? (
                <AppDetailView slug={detailSlug} publicRoot={publicRoot} embedded />
              ) : (
                <>
                  <div className="space-y-6">
                    <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
                      <div className="space-y-3">
                        <Title>App Directory</Title>
                        <Text>
                          Explore CREAI-built products through a cleaner directory surface with searchable entries,
                          category filters, and product cards.
                        </Text>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    <Card decoration="top" decorationColor="lime" className="creai-card rounded-3xl">
                      <Text>Total apps</Text>
                      <Metric>{loading ? '...' : metrics.total}</Metric>
                    </Card>
                    <Card decoration="top" decorationColor="lime" className="creai-card rounded-3xl">
                      <Text>Categories</Text>
                      <Metric>{loading ? '...' : metrics.categories}</Metric>
                    </Card>
                    <Card decoration="top" decorationColor="lime" className="creai-card rounded-3xl">
                      <Text>Web-enabled apps</Text>
                      <Metric>{loading ? '...' : metrics.webEnabled}</Metric>
                    </Card>
                    <Card decoration="top" decorationColor="slate" className="creai-card rounded-3xl">
                      <Text>iOS-enabled apps</Text>
                      <Metric>{loading ? '...' : metrics.iosEnabled}</Metric>
                    </Card>
                    <Card decoration="top" decorationColor="slate" className="creai-card rounded-3xl">
                      <Text>Android-enabled apps</Text>
                      <Metric>{loading ? '...' : metrics.androidEnabled}</Metric>
                    </Card>
                  </div>

                  <Card className="creai-card overflow-hidden rounded-[2rem] border border-mist-200/80 p-0 dark:border-ink-700">
                    <div className="relative h-[350px] w-full overflow-hidden bg-mist-100 dark:bg-ink-900">
                      {settings.bannerImageUrl ? (
                        <img
                          src={settings.bannerImageUrl}
                          alt={settings.bannerTitle}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_top_left,_rgba(163,230,35,0.35),_transparent_34%),linear-gradient(135deg,_#0A0A0B_0%,_#111113_55%,_#1A1B1E_100%)]">
                          <img src="/creailogo.svg" alt="CREAI" className="h-24 w-auto opacity-90" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-ink-950/80 via-ink-950/20 to-transparent" />
                      <div className="absolute inset-x-0 bottom-0 p-6 lg:p-8">
                        <div className="max-w-3xl space-y-3">
                          <Badge color="lime" className="creai-badge">{settings.bannerEyebrow}</Badge>
                          <Title className="!text-white">{settings.bannerTitle}</Title>
                          <Text className="!text-mist-200">{settings.bannerDescription}</Text>
                        </div>
                      </div>
                    </div>
                  </Card>

                  <DirectoryGridListBlock
                    error={error}
                    categories={categories}
                    filteredApps={filteredApps}
                    sortedApps={sortedApps}
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
                    availabilityFilter={availabilityFilter}
                    setAvailabilityFilter={setAvailabilityFilter}
                    availabilityOptions={availabilityOptions}
                    selectedSort={selectedSort}
                    setSelectedSort={setSelectedSort}
                    sortOptions={sortOptions}
                  />

                  <Card className="creai-card rounded-[2rem] p-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="space-y-2">
                        <Title>Recently updated</Title>
                        <Text>Structured view of the latest app changes across the directory.</Text>
                      </div>
                      <Badge color="gray" icon={RiTimeLine}>
                        Last 8 updates
                      </Badge>
                    </div>

                    <Table className="mt-6">
                      <TableHead>
                        <TableRow>
                          <TableHeaderCell>Product</TableHeaderCell>
                          <TableHeaderCell>Categories</TableHeaderCell>
                          <TableHeaderCell>Platforms</TableHeaderCell>
                          <TableHeaderCell>Launch state</TableHeaderCell>
                          <TableHeaderCell>Updated</TableHeaderCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {apps.slice(0, 8).map((app) => (
                          <TableRow key={app.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                {app.logoUrl ? (
                                  <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl border border-mist-200/80 bg-white p-2 dark:border-ink-700/80 dark:bg-ink-900">
                                    <img src={app.logoUrl} alt={`${app.name} logo`} className="h-full w-full object-contain" />
                                  </div>
                                ) : (
                                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl text-xs font-semibold text-ink-950" style={{ backgroundColor: app.accentColor || '#c2ff29' }}>
                                    {app.name.slice(0, 2).toUpperCase()}
                                  </div>
                                )}
                                <div className="space-y-1">
                                  <Link href={`/apps/${app.slug}`} className="font-medium text-ink-950 dark:text-mist-200">
                                    {app.name}
                                  </Link>
                                  <Text>{app.shortDescription || 'No short description yet.'}</Text>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{app.categories?.map((category) => category.name).join(', ') || 'Uncategorized'}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {getEnabledPlatforms(app).length ? getEnabledPlatforms(app).map(([key, platform]) => {
                                  const meta = getPlatformMeta(key)
                                  const statusMeta = getPlatformStatusMeta(platform.status)
                                  return (
                                    <Badge key={key} color={statusMeta.color} className={statusMeta.className} icon={meta?.icon}>
                                      {meta?.shortLabel || meta?.label || key}
                                    </Badge>
                                  )
                                }) : <Text>Metadata only</Text>}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {getEnabledPlatforms(app).some(([, platform]) => platform.status === 'live') ? (
                                  <Badge color="lime" className="creai-badge">Live on platform</Badge>
                                ) : (
                                  <Badge color="gray">Not live yet</Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>{formatDate(app.updatedAt)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Card>
                </>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
