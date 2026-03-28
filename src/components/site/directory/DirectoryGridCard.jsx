'use client'

import Link from 'next/link'
import { Badge, Button, Card, Text, Title } from '@tremor/react'
import { RiArrowRightUpLine } from '@remixicon/react'
import { getPlatformMeta, getPlatformStatusMeta, getTechOption } from '../../../lib/app-options'

function formatMonthYear(value) {
  if (!value) return 'Pending'
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  })
}

export default function DirectoryGridCard({ app }) {
  const enabledPlatforms = Object.entries(app.platforms ?? {}).filter(([, platform]) => platform?.enabled)
  const livePlatforms = enabledPlatforms.filter(([, platform]) => platform?.status === 'live')
  const categoryLabel = app.categories?.map((category) => category.name).join(', ') || app.category?.name || 'Uncategorized'
  const allTechnologies = [...(app.stacks ?? []), ...(app.webTechnologies ?? []), ...(app.mobileTechnologies ?? [])]
  const latestRelease = app.changelog?.[0] ?? null
  const hoverHighlights = latestRelease?.notes?.slice(0, 2) ?? []

  return (
    <Card className="creai-card group relative flex h-full flex-col overflow-hidden rounded-3xl border border-mist-200/80 p-6 transition hover:-translate-y-0.5 hover:border-mist-300 hover:shadow-soft dark:border-ink-700/80 dark:hover:border-ink-600 dark:hover:shadow-soft-dark">
      <div className="relative z-10 flex items-start justify-between gap-3">
        {app.logoUrl ? (
          <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border border-mist-200/80 bg-white p-2 dark:border-ink-700/80 dark:bg-ink-900">
            <img
              src={app.logoUrl}
              alt={`${app.name} logo`}
              className="h-full w-full object-contain"
            />
          </div>
        ) : (
          <div
            className="flex h-12 w-12 items-center justify-center rounded-2xl text-sm font-semibold text-ink-950"
            style={{ backgroundColor: app.accentColor || '#c2ff29' }}
          >
            {app.name.slice(0, 2).toUpperCase()}
          </div>
        )}
        <Badge color={livePlatforms.length ? 'lime' : 'gray'} className={livePlatforms.length ? 'creai-badge' : ''}>
          {livePlatforms.length ? `${livePlatforms.length} live` : `${enabledPlatforms.length || 0} platform`}
        </Badge>
      </div>

      <div className="relative z-10 mt-5 space-y-1.5">
        <Title>{app.name}</Title>
        <Text>{categoryLabel}</Text>
      </div>

      <Text className="relative z-10 mt-4 min-h-[56px]">{app.shortDescription || 'No short description added yet.'}</Text>

      <div className="relative z-10 mt-4 flex flex-wrap gap-2">
        {enabledPlatforms.map(([key, platform]) => {
          const meta = getPlatformMeta(key)
          const statusMeta = getPlatformStatusMeta(platform.status)
          return (
            <Badge key={key} color={statusMeta.color} className={statusMeta.className} icon={meta?.icon}>
              {meta?.shortLabel || meta?.label || key}
            </Badge>
          )
        })}
        {allTechnologies.map((item) => {
          const meta = getTechOption(item)
          return (
            <Badge key={item} color="gray" icon={meta?.icon}>
              {item}
            </Badge>
          )
        })}
      </div>

      <div className="relative z-20 mt-auto flex items-end justify-between gap-4 border-t border-mist-200/80 pt-6 dark:border-ink-700/80">
        <Text>{formatMonthYear(app.startedAt || app.createdAt)}</Text>
        <Link href={`/apps/${app.slug}`}>
          <Button size="xs" icon={RiArrowRightUpLine} variant="secondary" className="creai-button-secondary">
            Open
          </Button>
        </Link>
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-0 bottom-[76px] flex flex-col justify-end bg-gradient-to-t from-ink-950/95 via-ink-950/70 to-ink-950/10 p-6 opacity-0 transition duration-200 group-hover:opacity-100">
        <div className="rounded-3xl border border-white/10 bg-white/8 p-4 backdrop-blur-sm">
          <div className="flex flex-wrap items-center gap-2">
            {app.currentVersion ? <Badge color="gray">Version {app.currentVersion}</Badge> : null}
            {app.launchedAt ? <Badge color="gray">Launch {formatMonthYear(app.launchedAt)}</Badge> : null}
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {enabledPlatforms.map(([key, platform]) => {
              const meta = getPlatformMeta(key)
              const statusMeta = getPlatformStatusMeta(platform.status)
              return (
                <Badge key={`hover-${key}`} color={statusMeta.color} className={statusMeta.className} icon={meta?.icon}>
                  {meta?.shortLabel || meta?.label || key}
                </Badge>
              )
            })}
          </div>

          <div className="mt-4 space-y-2">
            {hoverHighlights.length ? hoverHighlights.map((item) => (
              <Text key={item} className="!text-mist-100">
                {item}
              </Text>
            )) : (
              <Text className="!text-mist-100">
                {app.teamMembers?.length
                  ? `${app.teamMembers.slice(0, 2).map((member) => member.name).filter(Boolean).join(', ')} built this release.`
                  : 'Open the detail page to inspect platforms, releases, and credits.'}
              </Text>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}
