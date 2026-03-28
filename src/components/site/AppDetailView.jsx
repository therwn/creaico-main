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
  RiArrowLeftLine,
  RiGithubLine,
  RiGlobalLine,
  RiInstagramLine,
  RiLinkedinLine,
  RiTwitterXLine,
} from '@remixicon/react'
import { fetchAppBySlug } from '../../lib/app-data'
import { getPlatformMeta, getPlatformStatusMeta, getTechOption } from '../../lib/app-options'
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

function normalizeExternalUrl(value) {
  const trimmed = value?.trim()
  if (!trimmed) return ''
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return `https://${trimmed.replace(/^\/+/, '')}`
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

function PlatformLaunchCard({ platformKey, platform }) {
  const meta = getPlatformMeta(platformKey)
  const statusMeta = getPlatformStatusMeta(platform.status)

  return (
    <Card className="creai-card rounded-3xl p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <Badge color="gray" icon={meta?.icon}>{meta?.label || platformKey}</Badge>
          <Title>{meta?.label || platformKey}</Title>
          <Text>
            {platform.url
              ? `Open the ${meta?.label || platformKey} experience.`
              : `${meta?.label || platformKey} is configured without a public launch URL yet.`}
          </Text>
        </div>
        <Badge color={statusMeta.color} className={statusMeta.className}>
          {statusMeta.label}
        </Badge>
      </div>

      {platform.url ? (
        <div className="mt-5">
          <a href={normalizeExternalUrl(platform.url)} target="_blank" rel="noreferrer">
            <Button icon={meta?.icon} className="creai-button-primary">
              Open {meta?.label || platformKey}
            </Button>
          </a>
        </div>
      ) : null}
    </Card>
  )
}

export default function AppDetailView({ slug, publicRoot, embedded = false }) {
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

    fetchAppBySlug(slug)
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

  const enabledPlatforms = useMemo(() => {
    return Object.entries(app?.platforms ?? {}).filter(([, platform]) => platform?.enabled)
  }, [app?.platforms])

  if (!hasSupabaseEnv) {
    return (
      <SetupState
        title="Prepare app detail pages"
        description="Connect Supabase to load individual app records and their platform launch metadata."
      />
    )
  }

  const content = (
    <div className={`${embedded ? 'w-full' : 'mx-auto max-w-6xl'} flex flex-col gap-6`}>
      <div className={`flex flex-col gap-4 rounded-3xl border border-mist-200/80 p-6 shadow-soft dark:border-ink-700/80 dark:shadow-soft-dark lg:flex-row lg:items-center lg:justify-between ${embedded ? 'creai-card' : 'bg-white/90 dark:bg-ink-900/80'}`}>
        <div className="flex items-center gap-3">
          <Link href={publicRoot}>
            <Button variant="secondary" icon={RiArrowLeftLine} className="creai-button-secondary">
              Back to directory
            </Button>
          </Link>
          <div>
            <Title>App detail</Title>
            <Text>Multi-platform product profile</Text>
          </div>
        </div>
        {!embedded ? <ThemeToggle /> : null}
      </div>

      {loading ? (
        <Card className="creai-card rounded-3xl p-8">
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
          <Card className="creai-card rounded-3xl p-6 lg:col-span-2">
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
                  <div className="flex flex-wrap gap-2">
                    {(app.categories?.length ? app.categories : [app.category].filter(Boolean)).map((category) => (
                      <Badge key={category.id || category.name} color="lime" className="creai-badge">{category.name}</Badge>
                    ))}
                    {enabledPlatforms.map(([key, platform]) => {
                      const meta = getPlatformMeta(key)
                      const statusMeta = getPlatformStatusMeta(platform.status)
                      return (
                        <Badge key={key} color={statusMeta.color} className={statusMeta.className} icon={meta?.icon}>
                          {meta?.shortLabel || meta?.label || key}
                        </Badge>
                      )
                    })}
                    {!(app.categories?.length || app.category) ? <Badge color="gray">Uncategorized</Badge> : null}
                  </div>
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
                      <a key={key} href={normalizeExternalUrl(value)} target="_blank" rel="noreferrer">
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
          </Card>

          <div className="space-y-6">
            <Card className="creai-card rounded-3xl p-6">
              <Title>Shared stack</Title>
              <div className="mt-4 flex flex-wrap gap-2">
                {app.stacks.length ? app.stacks.map((item) => <TechBadge key={item} value={item} />) : <Text>No shared stack tags added.</Text>}
              </div>
            </Card>

            <Card className="creai-card rounded-3xl p-6">
              <Title>Web technologies</Title>
              <div className="mt-4 flex flex-wrap gap-2">
                {app.webTechnologies.length ? app.webTechnologies.map((item) => <TechBadge key={item} value={item} color="gray" />) : <Text>No web technologies added.</Text>}
              </div>
            </Card>

            <Card className="creai-card rounded-3xl p-6">
              <Title>Mobile technologies</Title>
              <div className="mt-4 flex flex-wrap gap-2">
                {app.mobileTechnologies.length ? app.mobileTechnologies.map((item) => <TechBadge key={item} value={item} color="gray" />) : <Text>No mobile technologies added.</Text>}
              </div>
            </Card>
          </div>

          <div className="lg:col-span-3">
            <Title>Platform launch surface</Title>
            <Text className="mt-2">Launch status and links for every enabled platform.</Text>
            <Grid numItemsLg={3} className="mt-6 gap-6">
              {enabledPlatforms.length ? (
                enabledPlatforms.map(([key, platform]) => (
                  <PlatformLaunchCard key={key} platformKey={key} platform={platform} />
                ))
              ) : (
                <Card className="creai-card rounded-3xl p-8 lg:col-span-3">
                  <Text>No platform launches have been configured yet.</Text>
                </Card>
              )}
            </Grid>
          </div>
        </Grid>
      ) : null}
    </div>
  )

  if (embedded) {
    return content
  }

  return (
    <div className="min-h-screen bg-mist-100 px-4 py-6 dark:bg-ink-950 sm:px-6 lg:px-8">
      {content}
    </div>
  )
}
