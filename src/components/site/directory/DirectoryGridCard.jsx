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

  return (
    <Card className="creai-card flex h-full flex-col rounded-3xl border border-mist-200/80 p-6 transition hover:-translate-y-0.5 hover:border-mist-300 hover:shadow-soft dark:border-ink-700/80 dark:hover:border-ink-600 dark:hover:shadow-soft-dark">
      <div className="flex items-start justify-between gap-3">
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

      <div className="mt-5 space-y-1.5">
        <Title>{app.name}</Title>
        <Text>{categoryLabel}</Text>
      </div>

      <Text className="mt-4 min-h-[56px]">{app.shortDescription || 'No short description added yet.'}</Text>

      <div className="mt-4 flex flex-wrap gap-2">
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

      <div className="mt-auto flex items-end justify-between gap-4 pt-6">
        <Text>{formatMonthYear(app.startedAt || app.createdAt)}</Text>
        <Link href={`/apps/${app.slug}`}>
          <Button size="xs" icon={RiArrowRightUpLine} variant="secondary" className="creai-button-secondary">
            Open
          </Button>
        </Link>
      </div>
    </Card>
  )
}
