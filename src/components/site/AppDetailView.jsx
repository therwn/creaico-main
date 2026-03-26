'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  Badge,
  Button,
  Callout,
  Card,
  Divider,
  Grid,
  Text,
  Title,
} from '@tremor/react'
import {
  RiAppleFill,
  RiArrowLeftLine,
  RiExternalLinkLine,
  RiGithubLine,
  RiGlobalLine,
  RiGooglePlayFill,
  RiInstagramLine,
  RiLinkedinLine,
  RiTwitterXLine,
} from '@remixicon/react'
import { fetchPublishedAppBySlug } from '../../lib/app-data'
import { getTechOption } from '../../lib/app-options'
import { hasSupabaseEnv } from '../../lib/supabase'
import ThemeToggle from './ThemeToggle'
import SetupState from './SetupState'

const socialMeta = {
  website: { label: 'Website', icon: RiGlobalLine },
  x: { label: 'X', icon: RiTwitterXLine },
  instagram: { label: 'Instagram', icon: RiInstagramLine },
  github: { label: 'GitHub', icon: RiGithubLine },
  linkedin: { label: 'LinkedIn', icon: RiLinkedinLine },
}

const storeMeta = {
  app_store: { label: 'App Store', icon: RiAppleFill },
  google_play: { label: 'Google Play', icon: RiGooglePlayFill },
  web_app: { label: 'Web App', icon: RiGlobalLine },
}

function formatDate(value) {
  if (!value) return 'Recently updated'
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function TechBadge({ value, color = 'gray' }) {
  const meta = getTechOption(value)
  const Icon = meta?.icon

  return (
    <Badge color={color} className={color === 'lime' ? 'creai-badge' : undefined}>
      <span className="flex items-center gap-2">
        {Icon ? (
          <span className="flex h-4 w-4 items-center justify-center overflow-hidden [&>svg]:h-4 [&>svg]:w-4">
            <Icon />
          </span>
        ) : null}
        <span>{value}</span>
      </span>
    </Badge>
  )
}

export default function AppDetailView({ slug, publicRoot }) {
  const [app, setApp] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!hasSupabaseEnv || !slug) {
      setLoading(false)
      return
    }

    let isActive = true
    setLoading(true)

    fetchPublishedAppBySlug(slug)
      .then((row) => {
        if (isActive) {
          setApp(row)
          setError(row ? '' : 'This app could not be found.')
        }
      })
      .catch((reason) => {
        if (isActive) setError(reason.message || 'Unable to load app details.')
      })
      .finally(() => {
        if (isActive) setLoading(false)
      })

    return () => {
      isActive = false
    }
  }, [slug])

  const socialLinks = useMemo(() => {
    return Object.entries(app?.socialLinks ?? {}).filter(([, value]) => Boolean(value))
  }, [app?.socialLinks])

  const storeLinks = useMemo(() => {
    return Object.entries(app?.storeLinks ?? {}).filter(([, value]) => Boolean(value))
  }, [app?.storeLinks])

  if (!hasSupabaseEnv) {
    return (
      <SetupState
        title="Prepare app detail pages"
        description="Connect Supabase to load individual app records and their social/store metadata."
      />
    )
  }

  return (
    <div className="min-h-screen bg-mist-100 px-4 py-6 dark:bg-ink-950 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="flex flex-col gap-4 rounded-3xl border border-mist-200/80 bg-white/90 p-6 shadow-soft dark:border-ink-700/80 dark:bg-ink-900/80 dark:shadow-soft-dark lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <Link href={publicRoot}>
              <Button variant="secondary" icon={RiArrowLeftLine} className="creai-button-secondary">
                Back to directory
              </Button>
            </Link>
            <div>
              <Title>App detail</Title>
              <Text>Published product profile for app.creai.co</Text>
            </div>
          </div>
          <ThemeToggle />
        </div>

        {loading ? (
          <Card className="rounded-3xl p-8">
            <Text>Loading app details...</Text>
          </Card>
        ) : null}

        {!loading && error ? (
          <Callout title="Detail unavailable" color="rose">
            {error}
          </Callout>
        ) : null}

        {!loading && app ? (
          <Grid numItemsLg={3} className="gap-6">
            <Card className="rounded-3xl p-6 lg:col-span-2">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex items-start gap-4">
                  {app.logoUrl ? (
                    <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-3xl border border-mist-200/80 bg-white p-3 dark:border-ink-700/80 dark:bg-ink-900">
                      <img src={app.logoUrl} alt={`${app.name} logo`} className="h-full w-full object-contain" />
                    </div>
                  ) : (
                    <div
                      className="flex h-16 w-16 items-center justify-center rounded-3xl text-lg font-semibold text-ink-950"
                      style={{ backgroundColor: app.accentColor || '#c2ff29' }}
                    >
                      {app.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div className="space-y-2">
                    <Badge color="lime" className="creai-badge">{app.category?.name ?? 'Uncategorized'}</Badge>
                    <Title>{app.name}</Title>
                    <Text>{app.shortDescription}</Text>
                    <Text>{formatDate(app.updatedAt)}</Text>
                  </div>
                </div>

                {socialLinks.length ? (
                  <div className="flex flex-wrap items-center gap-2">
                    {socialLinks.map(([key, value]) => {
                      const meta = socialMeta[key]
                      if (!meta) return null
                      return (
                        <a key={key} href={value} target="_blank" rel="noreferrer">
                          <Button variant="secondary" icon={meta.icon} size="xs" className="creai-button-secondary">
                            {meta.label}
                          </Button>
                        </a>
                      )
                    })}
                  </div>
                ) : null}
              </div>

              <Divider className="my-6" />

              <div className="space-y-3">
                <Title>Description</Title>
                <Text>{app.description || 'No detailed description has been added yet.'}</Text>
              </div>

              {storeLinks.length ? (
                <>
                  <Divider className="my-6" />
                  <div className="space-y-3">
                    <Title>Store links</Title>
                    <div className="flex flex-wrap gap-3">
                      {storeLinks.map(([key, value]) => {
                        const meta = storeMeta[key]
                        if (!meta) return null
                        return (
                          <a key={key} href={value} target="_blank" rel="noreferrer">
                            <Button icon={meta.icon} className="creai-button-primary">
                              {meta.label}
                            </Button>
                          </a>
                        )
                      })}
                    </div>
                  </div>
                </>
              ) : null}
            </Card>

            <div className="space-y-6">
              <Card className="rounded-3xl p-6">
                <Title>Stack</Title>
                <div className="mt-4 flex flex-wrap gap-2">
                  {app.stacks.length ? app.stacks.map((item) => <TechBadge key={item} value={item} />) : <Text>No stack tags added.</Text>}
                </div>
              </Card>

              <Card className="rounded-3xl p-6">
                <Title>Frameworks</Title>
                <div className="mt-4 flex flex-wrap gap-2">
                  {app.frameworks.length ? app.frameworks.map((item) => <TechBadge key={item} value={item} color="lime" />) : <Text>No framework tags added.</Text>}
                </div>
              </Card>

              <Card className="rounded-3xl p-6">
                <Title>Availability</Title>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge color={socialLinks.length ? 'lime' : 'gray'} className={socialLinks.length ? 'creai-badge' : undefined}>{socialLinks.length ? 'Social ready' : 'No social links'}</Badge>
                  <Badge color={storeLinks.length ? 'lime' : 'gray'} className={storeLinks.length ? 'creai-badge' : undefined}>{storeLinks.length ? 'Store ready' : 'No store links'}</Badge>
                  <Badge color="slate" icon={RiExternalLinkLine}>
                    {app.status}
                  </Badge>
                </div>
              </Card>
            </div>
          </Grid>
        ) : null}
      </div>
    </div>
  )
}
