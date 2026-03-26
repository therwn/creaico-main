'use client'

import Link from 'next/link'
import { Badge, Button, Card, Text, Title } from '@tremor/react'
import { RiArrowRightUpLine } from '@remixicon/react'
import { getTechOption } from '../../../lib/app-options'

function formatDate(value) {
  if (!value) return 'Recently'
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function DirectoryGridCard({ app }) {
  return (
    <Card className="rounded-3xl border border-mist-200/80 p-6 transition hover:-translate-y-0.5 hover:border-mist-300 hover:shadow-soft dark:border-ink-700/80 dark:hover:border-ink-600 dark:hover:shadow-soft-dark">
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
        <Badge color={app.status === 'published' ? 'lime' : 'gray'} className={app.status === 'published' ? 'creai-badge' : undefined}>{app.status}</Badge>
      </div>

      <div className="mt-5 space-y-1.5">
        <Title>{app.name}</Title>
        <Text>{app.category?.name ?? 'Uncategorized'}</Text>
      </div>

      <Text className="mt-4 min-h-[56px]">{app.shortDescription || 'No short description added yet.'}</Text>

      <div className="mt-4 flex flex-wrap gap-2">
        {app.stacks.slice(0, 2).map((item) => {
          const meta = getTechOption(item)
          return (
            <Badge key={item} color="gray" icon={meta?.icon}>
              {item}
            </Badge>
          )
        })}
        {app.frameworks.slice(0, 1).map((item) => {
          const meta = getTechOption(item)
          return (
            <Badge key={item} color="lime" icon={meta?.icon} className="creai-badge">
              {item}
            </Badge>
          )
        })}
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
