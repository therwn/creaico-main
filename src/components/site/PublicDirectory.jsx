'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  Badge,
  Button,
  Callout,
  Card,
  Grid,
  Metric,
  Select,
  SelectItem,
  Tab,
  TabGroup,
  TabList,
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
  RiAppsLine,
  RiArrowRightUpLine,
  RiCompass3Line,
  RiFilter3Line,
  RiFolderOpenLine,
  RiGlobalLine,
  RiPulseLine,
  RiSearchLine,
  RiShapesLine,
  RiSparklingLine,
  RiStore2Line,
  RiTimeLine,
} from '@remixicon/react'
import { fetchPublishedApps } from '../../lib/app-data'
import { hasSupabaseEnv } from '../../lib/supabase'
import Input from '../ui/Input'
import ThemeToggle from './ThemeToggle'
import SetupState from './SetupState'

const directoryTabs = [
  { value: 'active', label: 'Active' },
  { value: 'directory', label: 'Directory' },
]

const availabilityOptions = [
  { value: 'all', label: 'All availability' },
  { value: 'store', label: 'Store ready' },
  { value: 'social', label: 'Social ready' },
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

function AppCard({ app }) {
  return (
    <Card className="rounded-3xl border border-slate-200/80 p-6 transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-soft dark:border-slate-800/80 dark:hover:border-slate-700 dark:hover:shadow-soft-dark">
      <div className="flex items-start justify-between gap-3">
        {app.logoUrl ? (
          <img
            src={app.logoUrl}
            alt={`${app.name} logo`}
            className="h-12 w-12 rounded-2xl border border-slate-200/80 object-cover dark:border-slate-800/80"
          />
        ) : (
          <div
            className="flex h-12 w-12 items-center justify-center rounded-2xl text-sm font-semibold text-slate-900"
            style={{ backgroundColor: app.accentColor || '#c2ff29' }}
          >
            {app.name.slice(0, 2).toUpperCase()}
          </div>
        )}
        <Badge color={app.status === 'published' ? 'emerald' : 'amber'}>{app.status}</Badge>
      </div>

      <div className="mt-5 space-y-1.5">
        <Title>{app.name}</Title>
        <Text>{app.category?.name ?? 'Uncategorized'}</Text>
      </div>

      <Text className="mt-4 min-h-[56px]">{app.shortDescription || 'No short description added yet.'}</Text>

      <div className="mt-4 flex flex-wrap gap-2">
        {app.stacks.slice(0, 2).map((item) => (
          <Badge key={item} color="gray">
            {item}
          </Badge>
        ))}
        {app.frameworks.slice(0, 1).map((item) => (
          <Badge key={item} color="cyan">
            {item}
          </Badge>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <Text>{formatDate(app.updatedAt)}</Text>
        <Link href={`/apps/${app.slug}`}>
          <Button size="xs" icon={RiArrowRightUpLine} variant="secondary">
            Open
          </Button>
        </Link>
      </div>
    </Card>
  )
}

export default function PublicDirectory() {
  const [apps, setApps] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [directoryTab, setDirectoryTab] = useState('directory')
  const [availabilityFilter, setAvailabilityFilter] = useState('all')

  useEffect(() => {
    if (!hasSupabaseEnv) {
      setLoading(false)
      return
    }

    let isActive = true
    setLoading(true)

    fetchPublishedApps()
      .then((rows) => {
        if (isActive) {
          setApps(rows)
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
      if (app.category?.id) unique.set(app.category.id, app.category)
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
        ...(app.stacks ?? []),
        ...(app.frameworks ?? []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      if (searchQuery.trim() && !searchable.includes(searchQuery.trim().toLowerCase())) return false
      if (selectedCategory !== 'all' && app.category?.id !== selectedCategory) return false
      if (directoryTab === 'active' && !hasLinks(app.storeLinks) && !hasLinks(app.socialLinks)) return false
      if (availabilityFilter === 'store' && !hasLinks(app.storeLinks)) return false
      if (availabilityFilter === 'social' && !hasLinks(app.socialLinks)) return false
      return true
    })
  }, [apps, availabilityFilter, directoryTab, searchQuery, selectedCategory])

  const metrics = useMemo(() => {
    return {
      total: apps.length,
      categories: categories.length,
      storeReady: apps.filter((app) => hasLinks(app.storeLinks)).length,
      socialReady: apps.filter((app) => hasLinks(app.socialLinks)).length,
    }
  }, [apps, categories.length])

  const latestUpdatedApp = apps[0] ?? null
  const highlightedCategories = categories.slice(0, 5)
  const activeCount = apps.filter((app) => hasLinks(app.storeLinks) || hasLinks(app.socialLinks)).length

  if (!hasSupabaseEnv) {
    return (
      <SetupState
        title="Prepare the CREAI app directory"
        description="The Tremor public catalog is ready. Connect Supabase to load published apps here."
      />
    )
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4 dark:bg-slate-950 lg:p-5">
      <div className="mx-auto max-w-[1680px] overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white shadow-soft dark:border-slate-800 dark:bg-slate-950 dark:shadow-soft-dark">
        <div className="flex min-h-[calc(100vh-2.5rem)] flex-col lg:flex-row">
          <aside className="flex w-full flex-col gap-6 border-b border-slate-200/80 bg-slate-50/70 p-5 dark:border-slate-800 dark:bg-slate-950/70 lg:min-h-full lg:w-[280px] lg:border-b-0 lg:border-r">
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                    <RiCompass3Line className="h-5 w-5" />
                  </div>
                  <div>
                    <Text className="text-xs uppercase tracking-[0.24em] text-slate-500">CREAI</Text>
                    <Title>Directory</Title>
                  </div>
                </div>
                <Badge color="emerald">{metrics.total}</Badge>
              </div>

              <div className="relative">
                <RiSearchLine className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search apps, stack, category..."
                  className="pl-10 pr-16"
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-slate-400 dark:border-slate-700 dark:bg-slate-900">
                  Search
                </span>
              </div>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <Text className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Browse</Text>
                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => {
                      setDirectoryTab('directory')
                      setAvailabilityFilter('all')
                    }}
                    className={`flex w-full items-center justify-between rounded-2xl px-3 py-2 text-left text-sm transition ${
                      directoryTab === 'directory'
                        ? 'bg-white text-slate-950 shadow-sm dark:bg-slate-900 dark:text-white'
                        : 'text-slate-600 hover:bg-white dark:text-slate-300 dark:hover:bg-slate-900'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <RiFolderOpenLine className="h-4 w-4" />
                      Directory
                    </span>
                    <Badge color="gray">{metrics.total}</Badge>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDirectoryTab('active')}
                    className={`flex w-full items-center justify-between rounded-2xl px-3 py-2 text-left text-sm transition ${
                      directoryTab === 'active'
                        ? 'bg-white text-slate-950 shadow-sm dark:bg-slate-900 dark:text-white'
                        : 'text-slate-600 hover:bg-white dark:text-slate-300 dark:hover:bg-slate-900'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <RiPulseLine className="h-4 w-4" />
                      Active
                    </span>
                    <Badge color="gray">{activeCount}</Badge>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAvailabilityFilter('store')}
                    className="flex w-full items-center justify-between rounded-2xl px-3 py-2 text-left text-sm text-slate-600 transition hover:bg-white dark:text-slate-300 dark:hover:bg-slate-900"
                  >
                    <span className="flex items-center gap-3">
                      <RiStore2Line className="h-4 w-4" />
                      Store-ready
                    </span>
                    <Badge color="gray">{metrics.storeReady}</Badge>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAvailabilityFilter('social')}
                    className="flex w-full items-center justify-between rounded-2xl px-3 py-2 text-left text-sm text-slate-600 transition hover:bg-white dark:text-slate-300 dark:hover:bg-slate-900"
                  >
                    <span className="flex items-center gap-3">
                      <RiGlobalLine className="h-4 w-4" />
                      Social-ready
                    </span>
                    <Badge color="gray">{metrics.socialReady}</Badge>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Text className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Collections</Text>
                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => setSelectedCategory('all')}
                    className={`flex w-full items-center justify-between rounded-2xl px-3 py-2 text-left text-sm transition ${
                      selectedCategory === 'all'
                        ? 'bg-white text-slate-950 shadow-sm dark:bg-slate-900 dark:text-white'
                        : 'text-slate-600 hover:bg-white dark:text-slate-300 dark:hover:bg-slate-900'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <RiAppsLine className="h-4 w-4" />
                      All categories
                    </span>
                    <Badge color="gray">{metrics.categories}</Badge>
                  </button>
                  {highlightedCategories.map((category) => {
                    const count = apps.filter((app) => app.category?.id === category.id).length
                    return (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => setSelectedCategory(category.id)}
                        className={`flex w-full items-center justify-between rounded-2xl px-3 py-2 text-left text-sm transition ${
                          selectedCategory === category.id
                            ? 'bg-white text-slate-950 shadow-sm dark:bg-slate-900 dark:text-white'
                            : 'text-slate-600 hover:bg-white dark:text-slate-300 dark:hover:bg-slate-900'
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

            <div className="mt-auto space-y-3 border-t border-slate-200/80 pt-4 dark:border-slate-800">
              <ThemeToggle />
              <Link href="/admin" className="block">
                <Button icon={RiArrowRightUpLine} color="emerald" className="w-full rounded-2xl">
                  Open admin
                </Button>
              </Link>
            </div>
          </aside>

          <main className="min-w-0 flex-1 p-6 lg:p-8">
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
                  <div className="space-y-3">
                    <Title>Available apps</Title>
                    <Text>
                      Explore CREAI-built products through a cleaner directory surface with searchable entries,
                      category filters, and product cards.
                    </Text>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button variant="secondary" icon={RiSparklingLine} className="rounded-2xl">
                      Curated by CREAI
                    </Button>
                    <Link href="/admin">
                      <Button icon={RiArrowRightUpLine} color="emerald" className="rounded-2xl">
                        Add app
                      </Button>
                    </Link>
                  </div>
                </div>

                <TabGroup
                  index={directoryTabs.findIndex((item) => item.value === directoryTab)}
                  onIndexChange={(index) => setDirectoryTab(directoryTabs[index]?.value ?? 'directory')}
                >
                  <TabList variant="line" color="emerald">
                    {directoryTabs.map((item) => (
                      <Tab key={item.value}>{item.label}</Tab>
                    ))}
                  </TabList>
                </TabGroup>
              </div>

              {error ? (
                <Callout title="Directory unavailable" color="rose">
                  {error}
                </Callout>
              ) : null}

              <Grid numItemsSm={2} numItemsLg={4} className="gap-4">
                <Card decoration="top" decorationColor="emerald" className="rounded-3xl">
                  <Text>Total published apps</Text>
                  <Metric>{loading ? '...' : metrics.total}</Metric>
                </Card>
                <Card decoration="top" decorationColor="lime" className="rounded-3xl">
                  <Text>Categories</Text>
                  <Metric>{loading ? '...' : metrics.categories}</Metric>
                </Card>
                <Card decoration="top" decorationColor="cyan" className="rounded-3xl">
                  <Text>Store-ready apps</Text>
                  <Metric>{loading ? '...' : metrics.storeReady}</Metric>
                </Card>
                <Card decoration="top" decorationColor="slate" className="rounded-3xl">
                  <Text>Social-ready apps</Text>
                  <Metric>{loading ? '...' : metrics.socialReady}</Metric>
                </Card>
              </Grid>

              <Card className="rounded-[2rem] p-6">
                <div className="flex flex-col gap-4 border-b border-slate-200/80 pb-6 dark:border-slate-800 xl:flex-row xl:items-end xl:justify-between">
                  <div className="space-y-2">
                    <Title>Directory</Title>
                    <Text>Filter the directory by category and readiness to surface the right product faster.</Text>
                  </div>
                  <div className="grid w-full gap-3 md:grid-cols-2 xl:w-auto xl:min-w-[420px]">
                    <div className="space-y-2">
                      <Text className="flex items-center gap-2 font-medium">
                        <RiFilter3Line className="h-4 w-4" />
                        Category
                      </Text>
                      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectItem value="all">All categories</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Text className="font-medium">Availability</Text>
                      <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
                        {availabilityOptions.map((item) => (
                          <SelectItem key={item.value} value={item.value}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </Select>
                    </div>
                  </div>
                </div>

                {filteredApps.length ? (
                  <Grid numItemsMd={2} numItemsLg={4} className="mt-6 gap-4">
                    {filteredApps.map((app) => (
                      <AppCard key={app.id} app={app} />
                    ))}
                  </Grid>
                ) : (
                  <Card className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-slate-50/80 p-10 text-center dark:border-slate-800 dark:bg-slate-900/60">
                    <Text>No apps match the current filters yet.</Text>
                  </Card>
                )}
              </Card>

              <Grid numItemsLg={3} className="gap-6">
                <Card className="rounded-[2rem] p-6 lg:col-span-2">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-2">
                      <Title>Recently updated</Title>
                      <Text>Quick access to the latest published app changes.</Text>
                    </div>
                    <Badge color="slate" icon={RiTimeLine}>
                      Live directory data
                    </Badge>
                  </div>

                  <Table className="mt-6">
                    <TableHead>
                      <TableRow>
                        <TableHeaderCell>App</TableHeaderCell>
                        <TableHeaderCell>Category</TableHeaderCell>
                        <TableHeaderCell>Updated</TableHeaderCell>
                        <TableHeaderCell>Availability</TableHeaderCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {apps.slice(0, 8).map((app) => (
                        <TableRow key={app.id}>
                          <TableCell>
                            <Link href={`/apps/${app.slug}`} className="font-medium text-slate-900 dark:text-slate-50">
                              {app.name}
                            </Link>
                          </TableCell>
                          <TableCell>{app.category?.name ?? 'Uncategorized'}</TableCell>
                          <TableCell>{formatDate(app.updatedAt)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {hasLinks(app.storeLinks) ? <Badge icon={RiStore2Line}>Store</Badge> : null}
                              {hasLinks(app.socialLinks) ? <Badge icon={RiApps2Line} color="gray">Social</Badge> : null}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>

                <div className="space-y-6">
                  <Card className="rounded-[2rem] p-6">
                    <div className="space-y-2">
                      <Badge color="cyan" icon={RiPulseLine}>Spotlight</Badge>
                      <Title>{latestUpdatedApp ? latestUpdatedApp.name : 'Your next featured app'}</Title>
                      <Text>
                        {latestUpdatedApp
                          ? latestUpdatedApp.shortDescription || 'Recently updated and ready to be explored.'
                          : 'Once you publish apps, this panel highlights the freshest release in the directory.'}
                      </Text>
                    </div>
                    {latestUpdatedApp ? (
                      <>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <Badge color="gray">{latestUpdatedApp.category?.name ?? 'Uncategorized'}</Badge>
                          <Badge color="emerald">{formatDate(latestUpdatedApp.updatedAt)}</Badge>
                        </div>
                        <Link href={`/apps/${latestUpdatedApp.slug}`} className="mt-6 inline-flex">
                          <Button icon={RiArrowRightUpLine}>Open spotlight</Button>
                        </Link>
                      </>
                    ) : null}
                  </Card>

                  <Card className="rounded-[2rem] p-6">
                    <Title>Category quick look</Title>
                    <div className="mt-4 space-y-3">
                      {highlightedCategories.length ? (
                        highlightedCategories.map((category) => {
                          const count = apps.filter((app) => app.category?.id === category.id).length
                          return (
                            <div key={category.id} className="flex items-center justify-between rounded-2xl border border-slate-200/70 px-4 py-3 dark:border-slate-800">
                              <div className="flex items-center gap-3">
                                <RiShapesLine className="h-4 w-4 text-brand-500" />
                                <Text className="font-medium">{category.name}</Text>
                              </div>
                              <Badge color="gray">{count}</Badge>
                            </div>
                          )
                        })
                      ) : (
                        <Text>No categories are available yet.</Text>
                      )}
                    </div>
                  </Card>
                </div>
              </Grid>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
