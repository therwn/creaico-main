'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  Badge,
  Button,
  Callout,
  Card,
  Flex,
  Grid,
  Metric,
  Select,
  SelectItem,
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
  RiArrowRightUpLine,
  RiCompass3Line,
  RiFilter3Line,
  RiGlobalLine,
  RiPulseLine,
  RiShapesLine,
  RiStore2Line,
  RiTimeLine,
} from '@remixicon/react'
import { fetchPublishedApps } from '../../lib/app-data'
import { hasSupabaseEnv } from '../../lib/supabase'
import ThemeToggle from './ThemeToggle'
import SetupState from './SetupState'

const availabilityTabs = [
  { value: 'all', label: 'All apps' },
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

export default function PublicDirectory({ publicRoot }) {
  const [apps, setApps] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
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
      if (selectedCategory !== 'all' && app.category?.id !== selectedCategory) return false
      if (availabilityFilter === 'store' && !hasLinks(app.storeLinks)) return false
      if (availabilityFilter === 'social' && !hasLinks(app.socialLinks)) return false
      return true
    })
  }, [apps, availabilityFilter, selectedCategory])

  const metrics = useMemo(() => {
    return {
      total: apps.length,
      categories: categories.length,
      storeReady: apps.filter((app) => hasLinks(app.storeLinks)).length,
      socialReady: apps.filter((app) => hasLinks(app.socialLinks)).length,
    }
  }, [apps, categories.length])

  const latestUpdatedApp = apps[0] ?? null
  const highlightedCategories = categories.slice(0, 4)

  if (!hasSupabaseEnv) {
    return (
      <SetupState
        title="Prepare the CREAI app directory"
        description="The Tremor public catalog is ready. Connect Supabase to load published apps here."
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-100 to-slate-200/70 px-4 py-6 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <Flex
          flexDirection="col"
          justifyContent="between"
          alignItems="start"
          className="gap-5 rounded-[2rem] border border-slate-200/80 bg-white/95 p-6 shadow-soft dark:border-slate-800/80 dark:bg-slate-950/85 dark:shadow-soft-dark lg:flex-row lg:items-center"
        >
          <div className="space-y-3">
            <Badge color="emerald" icon={RiCompass3Line}>CREAI App Directory</Badge>
            <Title>Productized AI experiences, ready to browse.</Title>
            <Text>
              Explore CREAI-built apps through a cleaner product directory surface, with stack visibility,
              store readiness, and category-led discovery.
            </Text>
            <div className="flex flex-wrap gap-2">
              <Badge color="gray" icon={RiApps2Line}>{metrics.total || 0} products</Badge>
              <Badge color="gray" icon={RiShapesLine}>{metrics.categories || 0} categories</Badge>
              <Badge color="gray" icon={RiStore2Line}>{metrics.storeReady || 0} store-ready</Badge>
            </div>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center sm:justify-end">
            <ThemeToggle />
            <Link href="/admin">
              <Button icon={RiArrowRightUpLine} color="emerald" className="w-full rounded-2xl sm:w-auto">
                Open admin
              </Button>
            </Link>
          </div>
        </Flex>

        {error ? (
          <Callout title="Directory unavailable" color="rose">
            {error}
          </Callout>
        ) : null}

        <Grid numItemsSm={2} numItemsLg={4} className="gap-4">
          <Card decoration="top" decorationColor="emerald" className="rounded-3xl bg-white/95 dark:bg-slate-950/85">
            <Text>Total published apps</Text>
            <Metric>{loading ? '...' : metrics.total}</Metric>
          </Card>
          <Card decoration="top" decorationColor="lime" className="rounded-3xl bg-white/95 dark:bg-slate-950/85">
            <Text>Categories</Text>
            <Metric>{loading ? '...' : metrics.categories}</Metric>
          </Card>
          <Card decoration="top" decorationColor="cyan" className="rounded-3xl bg-white/95 dark:bg-slate-950/85">
            <Text>Store-ready apps</Text>
            <Metric>{loading ? '...' : metrics.storeReady}</Metric>
          </Card>
          <Card decoration="top" decorationColor="slate" className="rounded-3xl bg-white/95 dark:bg-slate-950/85">
            <Text>Social-ready apps</Text>
            <Metric>{loading ? '...' : metrics.socialReady}</Metric>
          </Card>
        </Grid>

        <Grid numItemsLg={3} className="gap-6">
          <Card className="rounded-[2rem] p-6 lg:col-span-2">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div className="space-y-2">
                  <Title>Browse the directory</Title>
                  <Text>Use category and availability filters to focus on the apps you want to review.</Text>
                </div>
                <div className="grid w-full gap-3 md:grid-cols-2 lg:max-w-xl">
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
                      {availabilityTabs.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </Select>
                  </div>
                </div>
              </div>

              {filteredApps.length ? (
                <Grid numItemsMd={2} numItemsLg={2} className="gap-4">
                  {filteredApps.map((app) => (
                    <Card key={app.id} className="rounded-3xl border border-slate-200/80 p-6 transition hover:-translate-y-1 hover:shadow-soft dark:border-slate-800/80 dark:hover:shadow-soft-dark">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          {app.logoUrl ? (
                            <img src={app.logoUrl} alt={`${app.name} logo`} className="h-12 w-12 rounded-2xl border border-slate-200/80 object-cover dark:border-slate-800/80" />
                          ) : (
                            <div
                              className="flex h-12 w-12 items-center justify-center rounded-2xl text-sm font-semibold text-slate-900"
                              style={{ backgroundColor: app.accentColor || '#c2ff29' }}
                            >
                              {app.name.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div className="space-y-1">
                            <Title>{app.name}</Title>
                            <Text>{app.category?.name ?? 'Uncategorized'}</Text>
                          </div>
                        </div>
                        <Badge color={app.status === 'published' ? 'emerald' : 'amber'}>{app.status}</Badge>
                      </div>

                      <Text className="mt-4 min-h-[72px]">{app.shortDescription || 'No short description added yet.'}</Text>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {app.stacks.slice(0, 3).map((item) => (
                          <Badge key={item} color="emerald">
                            {item}
                          </Badge>
                        ))}
                        {app.frameworks.slice(0, 2).map((item) => (
                          <Badge key={item} color="cyan">
                            {item}
                          </Badge>
                        ))}
                      </div>

                      <div className="mt-6 flex items-center justify-between">
                        <Text>{formatDate(app.updatedAt)}</Text>
                        <Link href={`/apps/${app.slug}`}>
                          <Button size="xs" icon={RiArrowRightUpLine} variant="secondary">
                            View details
                          </Button>
                        </Link>
                      </div>
                    </Card>
                  ))}
                </Grid>
              ) : (
                <Card className="rounded-3xl border border-dashed border-slate-300 bg-slate-50/80 p-8 text-center dark:border-slate-800 dark:bg-slate-900/60">
                  <Text>No apps match the current filters yet.</Text>
                </Card>
              )}
            </div>
          </Card>

          <div className="space-y-6">
            <Card className="rounded-[2rem] p-6">
              <div className="space-y-2">
                <Badge color="cyan" icon={RiPulseLine}>Spotlight</Badge>
                <Title>{latestUpdatedApp ? latestUpdatedApp.name : 'Your next featured app'}</Title>
                <Text>
                  {latestUpdatedApp
                    ? latestUpdatedApp.shortDescription || 'Recently updated and ready to be explored.'
                    : 'Once you publish apps, this panel can highlight the freshest release in the directory.'}
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

            <Card className="rounded-[2rem] p-6">
              <Title>Directory health</Title>
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-900/60">
                  <div className="flex items-center gap-3">
                    <RiStore2Line className="h-4 w-4 text-emerald-500" />
                    <Text>Store links coverage</Text>
                  </div>
                  <Badge color="emerald">{metrics.storeReady}</Badge>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-900/60">
                  <div className="flex items-center gap-3">
                    <RiGlobalLine className="h-4 w-4 text-cyan-500" />
                    <Text>Social links coverage</Text>
                  </div>
                  <Badge color="cyan">{metrics.socialReady}</Badge>
                </div>
              </div>
            </Card>
          </div>
        </Grid>

        <Card className="rounded-[2rem] p-6">
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
      </div>
    </div>
  )
}
