'use client'

import Link from 'next/link'
import { Card, Text, Title } from '@tremor/react'
import { RiArrowRightUpLine } from '@remixicon/react'
import { getPlatformMeta, getTechOption } from '../../../lib/app-options'

function Chip({ icon: Icon, label, subtle = false }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm ${
        subtle
          ? 'border-white/10 bg-white/5 text-white/90'
          : 'border-white/10 bg-white/10 text-white'
      }`}
    >
      {Icon ? (
        <span className="flex h-4 w-4 items-center justify-center overflow-hidden [&>svg]:h-4 [&>svg]:w-4">
          <Icon />
        </span>
      ) : null}
      <span>{label}</span>
    </span>
  )
}

export default function DirectoryGridCard({ app }) {
  const enabledPlatforms = Object.entries(app.platforms ?? {}).filter(([, platform]) => platform?.enabled)
  const categoryLabels = app.categories?.map((category) => category.name) || (app.category?.name ? [app.category.name] : ['Uncategorized'])
  const allTechnologies = [...(app.stacks ?? []), ...(app.webTechnologies ?? []), ...(app.mobileTechnologies ?? [])]
  const visibleCategories = categoryLabels.slice(0, 2)
  const hiddenCategoryCount = Math.max(categoryLabels.length - visibleCategories.length, 0)
  const visiblePlatforms = enabledPlatforms.slice(0, 2)
  const visibleTechnologies = allTechnologies.slice(0, 2)
  const hiddenTechnologyCount = Math.max(allTechnologies.length - visibleTechnologies.length, 0)
  const platformLabel = visiblePlatforms
    .map(([key]) => getPlatformMeta(key)?.label || key)
    .join(' • ') || 'Platform pending'
  const hiddenPlatformCount = Math.max(enabledPlatforms.length - visiblePlatforms.length, 0)
  const fullPlatformLabel = hiddenPlatformCount ? `${platformLabel} • +${hiddenPlatformCount}` : platformLabel

  return (
    <Card className="flex h-full flex-col rounded-[2rem] border border-white/5 bg-[#111113] p-6 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] transition hover:-translate-y-0.5 hover:border-white/10 dark:bg-[#111113]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-4">
          {app.logoUrl ? (
            <div className="flex h-24 w-24 flex-none items-center justify-center overflow-hidden rounded-[1.4rem] bg-white p-4">
              <img
                src={app.logoUrl}
                alt={`${app.name} logo`}
                className="h-full w-full object-contain"
              />
            </div>
          ) : (
            <div
              className="flex h-24 w-24 flex-none items-center justify-center rounded-[1.4rem] text-2xl font-semibold text-ink-950"
              style={{ backgroundColor: app.accentColor || '#c2ff29' }}
            >
              {app.name.slice(0, 2).toUpperCase()}
            </div>
          )}

          <div className="min-w-0 space-y-2 pt-1">
            <Title className="truncate !text-4xl !font-medium !tracking-[-0.04em] !text-white">
              {app.name}
            </Title>
            <Text className="!text-2xl !text-white/45">{fullPlatformLabel}</Text>
          </div>
        </div>

        <Link
          href={`/apps/${app.slug}`}
          aria-label={`Open ${app.name}`}
          className="flex h-16 w-16 flex-none items-center justify-center rounded-[1.35rem] bg-brand-500 text-ink-950 shadow-[0_0_0_4px_rgba(163,230,35,0.08)] transition hover:scale-[1.02]"
        >
          <RiArrowRightUpLine className="h-8 w-8" />
        </Link>
      </div>

      <div className="mt-10 space-y-8">
        <div className="space-y-3">
          <Text className="!text-2xl !font-medium !text-white">Category</Text>
          <div className="flex flex-wrap gap-3">
            {visibleCategories.map((category) => (
              <Chip key={category} label={category} />
            ))}
            {hiddenCategoryCount ? <Chip label={`+${hiddenCategoryCount}`} subtle /> : null}
          </div>
        </div>

        <div className="space-y-3">
          <Text className="!text-2xl !font-medium !text-white">Tech</Text>
          <div className="flex flex-wrap gap-3">
            {visibleTechnologies.map((item) => {
              const meta = getTechOption(item)
              return <Chip key={item} icon={meta?.icon} label={item} />
            })}
            {hiddenTechnologyCount ? <Chip label={`+${hiddenTechnologyCount}`} subtle /> : null}
          </div>
        </div>
      </div>

      <Text
        className="mt-8 text-base"
        style={{
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        <span className="text-white/60">
          {app.shortDescription || 'No short description added yet.'}
        </span>
      </Text>
    </Card>
  )
}
