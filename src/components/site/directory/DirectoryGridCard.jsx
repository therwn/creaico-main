'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { Card, Text, Title } from '@tremor/react'
import { RiArrowRightUpLine } from '@remixicon/react'
import { getPlatformMeta, getTechOption } from '../../../lib/app-options'

function Chip({ icon: Icon, label, subtle = false }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm ${
        subtle
          ? 'border-[#26272B] bg-white/5 text-white/90'
          : 'border-[#26272B] bg-white/10 text-white'
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

function estimateChipWidth(label, withIcon = false) {
  const baseWidth = 44
  const iconWidth = withIcon ? 24 : 0
  return baseWidth + iconWidth + label.length * 8.5
}

function useResponsiveChips(items, containerRef, options = {}) {
  const { withIcon = false } = options
  const [containerWidth, setContainerWidth] = useState(0)

  useEffect(() => {
    if (!containerRef.current) return undefined

    const updateWidth = () => {
      setContainerWidth(containerRef.current?.clientWidth ?? 0)
    }

    updateWidth()

    const observer = new ResizeObserver(updateWidth)
    observer.observe(containerRef.current)

    return () => observer.disconnect()
  }, [containerRef])

  return useMemo(() => {
    if (!items.length) {
      return { visibleItems: [], hiddenCount: 0 }
    }

    if (!containerWidth) {
      return { visibleItems: items.slice(0, 1), hiddenCount: Math.max(items.length - 1, 0) }
    }

    const gap = 12
    const visibleItems = []
    let usedWidth = 0

    for (let index = 0; index < items.length; index += 1) {
      const item = items[index]
      const chipWidth = estimateChipWidth(item.label, withIcon && Boolean(item.icon))
      const nextGap = visibleItems.length ? gap : 0
      const remainingCount = items.length - (index + 1)
      const overflowWidth = remainingCount > 0 ? gap + estimateChipWidth(`+${remainingCount}`) : 0

      if (usedWidth + nextGap + chipWidth + overflowWidth <= containerWidth) {
        visibleItems.push(item)
        usedWidth += nextGap + chipWidth
        continue
      }

      break
    }

    if (!visibleItems.length) {
      return { visibleItems: items.slice(0, 1), hiddenCount: Math.max(items.length - 1, 0) }
    }

    return {
      visibleItems,
      hiddenCount: Math.max(items.length - visibleItems.length, 0),
    }
  }, [containerWidth, items, withIcon])
}

export default function DirectoryGridCard({ app }) {
  const categoryRowRef = useRef(null)
  const techRowRef = useRef(null)
  const enabledPlatforms = Object.entries(app.platforms ?? {}).filter(([, platform]) => platform?.enabled)
  const categoryLabels = app.categories?.map((category) => category.name) || (app.category?.name ? [app.category.name] : ['Uncategorized'])
  const allTechnologies = [...(app.stacks ?? []), ...(app.webTechnologies ?? []), ...(app.mobileTechnologies ?? [])].map((item) => {
    const meta = getTechOption(item)
    return { label: item, icon: meta?.icon }
  })
  const visiblePlatforms = enabledPlatforms.slice(0, 2)
  const categoryItems = categoryLabels.map((label) => ({ label }))
  const { visibleItems: visibleCategories, hiddenCount: hiddenCategoryCount } = useResponsiveChips(categoryItems, categoryRowRef)
  const { visibleItems: visibleTechnologies, hiddenCount: hiddenTechnologyCount } = useResponsiveChips(allTechnologies, techRowRef, { withIcon: true })
  const platformLabel = visiblePlatforms
    .map(([key]) => getPlatformMeta(key)?.label || key)
    .join(' • ') || 'Platform pending'
  const hiddenPlatformCount = Math.max(enabledPlatforms.length - visiblePlatforms.length, 0)
  const fullPlatformLabel = hiddenPlatformCount ? `${platformLabel} • +${hiddenPlatformCount}` : platformLabel

  return (
    <Card className="flex h-full flex-col rounded-[2rem] border border-[#26272B] bg-[#111113] p-5 text-white shadow-[0_18px_40px_rgba(0,0,0,0.22)] transition hover:shadow-[0_22px_48px_rgba(0,0,0,0.28)] dark:bg-[#111113]">
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
            <Title className="truncate !text-[1.6rem] !font-medium !tracking-[-0.04em] !text-white">
              {app.name}
            </Title>
            <Text className="!text-base !text-white/45">{fullPlatformLabel}</Text>
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

      <div className="mt-8 space-y-6">
        <div className="space-y-3">
          <Text className="!text-lg !font-medium !text-white">Category</Text>
          <div ref={categoryRowRef} className="flex flex-wrap gap-3">
            {visibleCategories.map((category) => (
              <Chip key={category.label} label={category.label} />
            ))}
            {hiddenCategoryCount ? <Chip label={`+${hiddenCategoryCount}`} subtle /> : null}
          </div>
        </div>

        <div className="space-y-3">
          <Text className="!text-lg !font-medium !text-white">Tech</Text>
          <div ref={techRowRef} className="flex flex-wrap gap-3">
            {visibleTechnologies.map((item) => {
              return <Chip key={item.label} icon={item.icon} label={item.label} />
            })}
            {hiddenTechnologyCount ? <Chip label={`+${hiddenTechnologyCount}`} subtle /> : null}
          </div>
        </div>
      </div>
    </Card>
  )
}
