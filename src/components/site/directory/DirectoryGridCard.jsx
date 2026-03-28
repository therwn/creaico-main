'use client'

import Link from 'next/link'
import { Card, Text, Title } from '@tremor/react'
import { RiArrowRightUpLine } from '@remixicon/react'
import { getPlatformMeta, getTechOption } from '../../../lib/app-options'

function Chip({ icon: Icon, label, subtle = false }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm ${
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
    <Card className="flex h-full flex-col rounded-[2rem] border border-white/5 bg-[#111113] p-5 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] transition hover:-translate-y-0.5 hover:border-white/10 dark:bg-[#111113]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-4">
          {app.logoUrl ? (
            <div className="flex h-20 w-20 flex-none items-center justify-center overflow-hidden rounded-[1.25rem] bg-white p-4">
              <img
                src={app.logoUrl}
                alt={`${app.name} logo`}
                className="h-full w-full object-contain"
              />
            </div>
          ) : (
            <div
              className="flex h-20 w-20 flex-none items-center justify-center rounded-[1.25rem] text-xl font-semibold text-ink-950"
              style={{ backgroundColor: app.accentColor || '#c2ff29' }}
            >
              {app.name.slice(0, 2).toUpperCase()}
            </div>
          )}

          <div className="min-w-0 space-y-2 pt-1">
            <Title className="truncate !text-[2rem] !font-medium !tracking-[-0.04em] !text-white">
              {app.name}
            </Title>
            <Text className="!text-lg !text-white/45">{fullPlatformLabel}</Text>
          </div>
        </div>

        <Link
          href={`/apps/${app.slug}`}
          aria-label={`Open ${app.name}`}
          className="flex h-14 w-14 flex-none items-center justify-center rounded-[1.1rem] bg-brand-500 text-ink-950 shadow-[0_0_0_4px_rgba(163,230,35,0.08)] transition hover:scale-[1.02]"
        >
          <RiArrowRightUpLine className="h-7 w-7" />
        </Link>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div className="space-y-3">
          <Text className="!text-xl !font-medium !text-white">Category</Text>
          <div className="flex flex-wrap gap-3">
            {visibleCategories.map((category) => (
              <Chip key={category} label={category} />
            ))}
            {hiddenCategoryCount ? <Chip label={`+${hiddenCategoryCount}`} subtle /> : null}
          </div>
        </div>

        <div className="space-y-3">
          <Text className="!text-xl !font-medium !text-white">Tech</Text>
          <div className="flex flex-wrap gap-3">
            {visibleTechnologies.map((item) => {
              const meta = getTechOption(item)
              return <Chip key={item} icon={meta?.icon} label={item} />
            })}
            {hiddenTechnologyCount ? <Chip label={`+${hiddenTechnologyCount}`} subtle /> : null}
          </div>
        </div>
      </div>
    </Card>
  )
}
