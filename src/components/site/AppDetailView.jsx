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
  RiGitCommitLine,
  RiGithubLine,
  RiGlobalLine,
  RiInstagramLine,
  RiLinkedinLine,
  RiTeamLine,
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

function normalizeGitHubRepository(value) {
  const trimmed = value?.trim()
  if (!trimmed) return ''
  const directMatch = trimmed.match(/^([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)$/)
  if (directMatch) return `${directMatch[1]}/${directMatch[2]}`

  try {
    const url = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`)
    if (!url.hostname.includes('github.com')) return ''
    const [owner, repo] = url.pathname.replace(/^\/+/, '').split('/')
    if (!owner || !repo) return ''
    return `${owner}/${repo.replace(/\.git$/i, '')}`
  } catch {
    return ''
  }
}

function formatMonthYear(value) {
  if (!value) return 'Pending'
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  })
}

function formatCommitDate(value) {
  if (!value) return 'Pending'
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatDisplayDate(value) {
  if (!value) return 'Pending'
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
  const [commits, setCommits] = useState([])
  const [commitsLoading, setCommitsLoading] = useState(false)
  const [commitsError, setCommitsError] = useState('')

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

  const hasWebPlatform = Boolean(app?.platforms?.web?.enabled)
  const hasMobilePlatform = Boolean(app?.platforms?.ios?.enabled || app?.platforms?.android?.enabled)
  const githubRepository = useMemo(() => normalizeGitHubRepository(app?.githubRepository ?? app?.socialLinks?.github ?? ''), [app?.githubRepository, app?.socialLinks?.github])

  useEffect(() => {
    if (!githubRepository) {
      setCommits([])
      setCommitsError('')
      setCommitsLoading(false)
      return
    }

    let isActive = true
    const controller = new AbortController()
    setCommitsLoading(true)
    setCommitsError('')

    fetch(`https://api.github.com/repos/${githubRepository}/commits?per_page=5`, {
      signal: controller.signal,
      headers: {
        Accept: 'application/vnd.github+json',
      },
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(response.status === 404 ? 'GitHub repository not found.' : 'Unable to load recent commits.')
        }
        return response.json()
      })
      .then((data) => {
        if (!isActive) return
        setCommits(Array.isArray(data) ? data : [])
      })
      .catch((reason) => {
        if (!isActive || reason.name === 'AbortError') return
        setCommitsError(reason.message || 'Unable to load recent commits.')
      })
      .finally(() => {
        if (isActive) setCommitsLoading(false)
      })

    return () => {
      isActive = false
      controller.abort()
    }
  }, [githubRepository])

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
                    {app.currentVersion ? <Badge color="gray">Version {app.currentVersion}</Badge> : null}
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
                  <div className="flex flex-wrap gap-4 text-sm text-mist-500 dark:text-mist-400">
                    <Text>Started: {formatMonthYear(app.startedAt || app.createdAt)}</Text>
                    <Text>Launch: {formatMonthYear(app.launchedAt)}</Text>
                  </div>
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

            {hasWebPlatform ? (
              <Card className="creai-card rounded-3xl p-6">
                <Title>Web technologies</Title>
                <div className="mt-4 flex flex-wrap gap-2">
                  {app.webTechnologies.length ? app.webTechnologies.map((item) => <TechBadge key={item} value={item} color="gray" />) : <Text>No web technologies added.</Text>}
                </div>
              </Card>
            ) : null}

            {hasMobilePlatform ? (
              <Card className="creai-card rounded-3xl p-6">
                <Title>Mobile technologies</Title>
                <div className="mt-4 flex flex-wrap gap-2">
                  {app.mobileTechnologies.length ? app.mobileTechnologies.map((item) => <TechBadge key={item} value={item} color="gray" />) : <Text>No mobile technologies added.</Text>}
                </div>
              </Card>
            ) : null}

            {githubRepository ? (
              <Card className="creai-card rounded-3xl p-6">
                <div className="flex items-center justify-between gap-3">
                  <Title>Recent commits</Title>
                  <a href={`https://github.com/${githubRepository}`} target="_blank" rel="noreferrer">
                    <Button variant="secondary" icon={RiGithubLine} size="xs" className="creai-button-secondary">
                      {githubRepository}
                    </Button>
                  </a>
                </div>

                <div className="mt-4 space-y-3">
                  {commitsLoading ? <Text>Loading recent commits...</Text> : null}
                  {!commitsLoading && commitsError ? <Text>{commitsError}</Text> : null}
                  {!commitsLoading && !commitsError && !commits.length ? <Text>No recent commits found.</Text> : null}
                  {!commitsLoading && !commitsError
                    ? commits.map((commit) => (
                        <a
                          key={commit.sha}
                          href={commit.html_url}
                          target="_blank"
                          rel="noreferrer"
                          className="block rounded-2xl border border-mist-200/80 p-3 transition hover:border-mist-300 dark:border-ink-700 dark:hover:border-ink-600"
                        >
                          <div className="flex items-start gap-3">
                            <RiGitCommitLine className="mt-0.5 h-4 w-4 flex-none text-mist-500 dark:text-mist-400" />
                            <div className="min-w-0 space-y-1">
                              <Text className="truncate font-medium text-ink-950 dark:text-mist-200">
                                {commit.commit?.message?.split('\n')[0] || commit.sha.slice(0, 7)}
                              </Text>
                              <Text className="text-xs text-mist-500 dark:text-mist-400">
                                {(commit.commit?.author?.name || commit.author?.login || 'Unknown author')} · {formatCommitDate(commit.commit?.author?.date)}
                              </Text>
                            </div>
                          </div>
                        </a>
                      ))
                    : null}
                </div>
              </Card>
            ) : null}

            {app.teamMembers?.length ? (
              <Card className="creai-card rounded-3xl p-6">
                <div className="flex items-center gap-2">
                  <RiTeamLine className="h-4 w-4 text-mist-500 dark:text-mist-400" />
                  <Title>Creator credits</Title>
                </div>
                <div className="mt-4 space-y-3">
                  {app.teamMembers.map((member) => {
                    const initials = (member.name || member.role || '?')
                      .split(' ')
                      .filter(Boolean)
                      .slice(0, 2)
                      .map((item) => item[0])
                      .join('')
                      .toUpperCase()

                    const content = (
                      <div className="flex items-center gap-3 rounded-2xl border border-mist-200/80 p-3 dark:border-ink-700">
                        {member.avatar ? (
                          <img src={member.avatar} alt={member.name || 'Team member'} className="h-11 w-11 rounded-2xl object-cover" />
                        ) : (
                          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-mist-100 text-sm font-semibold text-ink-950 dark:bg-ink-800 dark:text-mist-100">
                            {initials}
                          </div>
                        )}
                        <div className="min-w-0">
                          <Text className="font-medium text-ink-950 dark:text-mist-200">{member.name || 'Unnamed contributor'}</Text>
                          <Text>{member.role || 'Role pending'}</Text>
                        </div>
                      </div>
                    )

                    return member.link ? (
                      <a key={`${member.name}-${member.role}`} href={member.link} target="_blank" rel="noreferrer" className="block">
                        {content}
                      </a>
                    ) : (
                      <div key={`${member.name}-${member.role}`}>{content}</div>
                    )
                  })}
                </div>
              </Card>
            ) : null}
          </div>

          <div className="space-y-6 lg:col-span-3">
            <Card className="creai-card rounded-3xl p-6">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-2">
                  <Title>Version + changelog</Title>
                  <Text>Release history for the current product record.</Text>
                </div>
                {app.currentVersion ? <Badge color="gray">Current version {app.currentVersion}</Badge> : null}
              </div>

              {app.changelog?.length ? (
                <div className="mt-6 space-y-4">
                  {app.changelog.map((entry, index) => (
                    <details key={`${entry.version}-${entry.releaseDate}-${index}`} className="group rounded-3xl border border-mist-200/80 p-4 dark:border-ink-700" open={index === 0}>
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
                        <div className="space-y-1">
                          <Text className="font-medium text-ink-950 dark:text-mist-200">{entry.version || 'Unversioned release'}</Text>
                          <Text>{formatDisplayDate(entry.releaseDate)}</Text>
                        </div>
                        <Badge color="gray">{entry.notes?.length || 0} notes</Badge>
                      </summary>
                      <div className="mt-4 space-y-2">
                        {entry.notes?.length ? entry.notes.map((note) => (
                          <Text key={note}>• {note}</Text>
                        )) : <Text>No release notes added.</Text>}
                      </div>
                    </details>
                  ))}
                </div>
              ) : (
                <div className="mt-6 rounded-3xl border border-dashed border-mist-300 p-6 dark:border-ink-700">
                  <Text>No changelog entries have been added yet.</Text>
                </div>
              )}
            </Card>

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
