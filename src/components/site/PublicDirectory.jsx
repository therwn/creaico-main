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
  RiFolderOpenLine,
  RiGlobalLine,
  RiPulseLine,
  RiSearchLine,
  RiShapesLine,
  RiStore2Line,
  RiTimeLine,
} from '@remixicon/react'
import { fetchApps } from '../../lib/app-data'
import { hasSupabaseEnv } from '../../lib/supabase'
import Input from '../ui/Input'
import DirectoryGridListBlock from './directory/DirectoryGridListBlock'
import ThemeToggle from './ThemeToggle'
import SetupState from './SetupState'
import WorkspaceBrand from './WorkspaceBrand'

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

    fetchApps()
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
        ...(app.frameworks ?? []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      if (searchQuery.trim() && !searchable.includes(searchQuery.trim().toLowerCase())) return false
      if (selectedCategory !== 'all' && !(app.categories ?? []).some((category) => category.id === selectedCategory)) return false
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
        description="The Tremor public catalog is ready. Connect Supabase to load app records here."
      />
    )
  }

  return (
    <div className="min-h-screen bg-mist-100 p-4 dark:bg-ink-950 lg:p-5">
      <div className="mx-auto max-w-[1680px] overflow-hidden rounded-[2rem] border border-mist-200/80 bg-white shadow-soft dark:border-ink-700 dark:bg-ink-950 dark:shadow-soft-dark">
        <div className="flex min-h-[calc(100vh-2.5rem)] flex-col lg:flex-row">
          <aside className="flex w-full flex-col gap-6 border-b border-mist-200/80 bg-mist-50/70 p-5 dark:border-ink-700 dark:bg-ink-900/70 lg:h-[calc(100vh-2.5rem)] lg:w-[280px] lg:flex-none lg:border-b-0 lg:border-r lg:overflow-hidden">
            <div className="flex h-full flex-col gap-5">
              <WorkspaceBrand label="Directory" value={<Badge color="lime" className="creai-badge">{metrics.total}</Badge>} />

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
                        setDirectoryTab('directory')
                        setAvailabilityFilter('all')
                      }}
                      className={`flex w-full items-center justify-between rounded-2xl px-3 py-2 text-left text-sm transition ${
                        directoryTab === 'directory'
                          ? 'bg-white text-ink-950 shadow-sm dark:bg-ink-800 dark:text-mist-200'
                          : 'text-mist-500 hover:bg-white dark:text-mist-300 dark:hover:bg-ink-800'
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
                          ? 'bg-white text-ink-950 shadow-sm dark:bg-ink-800 dark:text-mist-200'
                          : 'text-mist-500 hover:bg-white dark:text-mist-300 dark:hover:bg-ink-800'
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
                      className="flex w-full items-center justify-between rounded-2xl px-3 py-2 text-left text-sm text-mist-500 transition hover:bg-white dark:text-mist-300 dark:hover:bg-ink-800"
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
                      className="flex w-full items-center justify-between rounded-2xl px-3 py-2 text-left text-sm text-mist-500 transition hover:bg-white dark:text-mist-300 dark:hover:bg-ink-800"
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
                  <Text className="text-xs font-semibold uppercase tracking-[0.24em] text-mist-500 dark:text-mist-400">Collections</Text>
                  <div className="space-y-1">
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

              <div className="mt-auto space-y-3 border-t border-mist-200/80 pt-4 dark:border-ink-700">
                <ThemeToggle />
                <Text className="text-xs text-mist-500 dark:text-mist-400">
                  Browse CREAI products, stacks, and launch surfaces from one catalog.
                </Text>
              </div>
            </div>
          </aside>

          <main className="min-w-0 flex-1 p-6 lg:h-[calc(100vh-2.5rem)] lg:overflow-y-auto lg:p-8">
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
                </div>

                <TabGroup
                  index={directoryTabs.findIndex((item) => item.value === directoryTab)}
                  onIndexChange={(index) => setDirectoryTab(directoryTabs[index]?.value ?? 'directory')}
                >
                  <TabList variant="line" color="gray">
                    {directoryTabs.map((item) => (
                      <Tab key={item.value}>{item.label}</Tab>
                    ))}
                  </TabList>
                </TabGroup>
              </div>

              <Grid numItemsSm={2} numItemsLg={4} className="gap-4">
                <Card decoration="top" decorationColor="lime" className="rounded-3xl">
                  <Text>Total apps</Text>
                  <Metric>{loading ? '...' : metrics.total}</Metric>
                </Card>
                <Card decoration="top" decorationColor="lime" className="rounded-3xl">
                  <Text>Categories</Text>
                  <Metric>{loading ? '...' : metrics.categories}</Metric>
                </Card>
                <Card decoration="top" decorationColor="lime" className="rounded-3xl">
                  <Text>Store-ready apps</Text>
                  <Metric>{loading ? '...' : metrics.storeReady}</Metric>
                </Card>
                <Card decoration="top" decorationColor="slate" className="rounded-3xl">
                  <Text>Social-ready apps</Text>
                  <Metric>{loading ? '...' : metrics.socialReady}</Metric>
                </Card>
              </Grid>

              <DirectoryGridListBlock
                error={error}
                categories={categories}
                filteredApps={filteredApps}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                availabilityFilter={availabilityFilter}
                setAvailabilityFilter={setAvailabilityFilter}
                availabilityOptions={availabilityOptions}
              />

              <Grid numItemsLg={3} className="gap-6">
                <Card className="rounded-[2rem] p-6 lg:col-span-2">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-2">
                      <Title>Recently updated</Title>
                      <Text>Quick access to the latest app changes across every catalog entry.</Text>
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
                            <Link href={`/apps/${app.slug}`} className="font-medium text-ink-950 dark:text-mist-200">
                              {app.name}
                            </Link>
                          </TableCell>
                          <TableCell>{app.categories?.map((category) => category.name).join(', ') || 'Uncategorized'}</TableCell>
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
                      <Badge color="lime" icon={RiPulseLine} className="creai-badge">Spotlight</Badge>
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
                          <Badge color="gray">{latestUpdatedApp.categories?.map((category) => category.name).join(', ') || 'Uncategorized'}</Badge>
                          <Badge color="lime" className="creai-badge">{formatDate(latestUpdatedApp.updatedAt)}</Badge>
                        </div>
                        <Link href={`/apps/${latestUpdatedApp.slug}`} className="mt-6 inline-flex">
                          <Button icon={RiArrowRightUpLine} className="creai-button-primary">Open spotlight</Button>
                        </Link>
                      </>
                    ) : null}
                  </Card>

                  <Card className="rounded-[2rem] p-6">
                    <Title>Category quick look</Title>
                    <div className="mt-4 space-y-3">
                      {highlightedCategories.length ? (
                        highlightedCategories.map((category) => {
                          const count = apps.filter((app) => (app.categories ?? []).some((item) => item.id === category.id)).length
                          return (
                            <div key={category.id} className="flex items-center justify-between rounded-2xl border border-mist-200/70 px-4 py-3 dark:border-ink-700">
                              <div className="flex items-center gap-3">
                                <RiShapesLine className="h-4 w-4 text-mist-500 dark:text-brand-300" />
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
