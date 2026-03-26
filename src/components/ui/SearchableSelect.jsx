'use client'

import { useMemo, useState } from 'react'
import * as Popover from '@radix-ui/react-popover'
import { Button, Text } from '@tremor/react'
import { RiArrowDownSLine, RiCheckLine, RiSearchLine } from '@remixicon/react'
import Input from './Input'

function getSummary(optionsMap, value, multi, placeholder) {
  if (multi) {
    if (!Array.isArray(value) || value.length === 0) return placeholder
    const labels = value.map((item) => optionsMap.get(item)?.label || item).filter(Boolean)
    if (labels.length <= 2) return labels.join(', ')
    return `${labels[0]}, ${labels[1]} +${labels.length - 2}`
  }

  if (!value) return placeholder
  return optionsMap.get(value)?.label || placeholder
}

export default function SearchableSelect({
  value,
  onChange,
  options,
  placeholder = 'Select',
  searchPlaceholder = 'Search...',
  emptyMessage = 'No results found.',
  multi = false,
  actionLabel,
  onAction,
  icon: TriggerIcon,
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  const optionsMap = useMemo(() => new Map(options.map((option) => [option.value, option])), [options])

  const filteredOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    if (!normalizedQuery) return options
    return options.filter((option) => {
      const haystack = [option.label, option.value, ...(option.keywords || [])].join(' ').toLowerCase()
      return haystack.includes(normalizedQuery)
    })
  }, [options, query])

  const summary = getSummary(optionsMap, value, multi, placeholder)

  function handleSelect(nextValue) {
    if (multi) {
      const current = Array.isArray(value) ? value : []
      onChange(current.includes(nextValue) ? current.filter((item) => item !== nextValue) : [...current, nextValue])
      return
    }

    onChange(nextValue)
    setOpen(false)
  }

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          className="flex h-11 w-full items-center justify-between gap-3 rounded-tremor-default border border-tremor-border bg-tremor-background px-3 text-left text-tremor-default text-tremor-content-emphasis shadow-tremor-input transition hover:border-mist-300 dark:border-dark-tremor-border dark:bg-dark-tremor-background dark:text-dark-tremor-content-emphasis dark:shadow-dark-tremor-input dark:hover:border-ink-600"
        >
          <span className="flex min-w-0 items-center gap-2">
            {TriggerIcon ? <TriggerIcon className="h-4 w-4 shrink-0 text-mist-500 dark:text-mist-400" /> : null}
            <span className="truncate">{summary}</span>
          </span>
          <RiArrowDownSLine className="h-4 w-4 shrink-0 text-mist-500 dark:text-mist-400" />
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={10}
          className="z-50 w-[var(--radix-popover-trigger-width)] min-w-[260px] rounded-2xl border border-mist-200/80 bg-white p-2 shadow-soft outline-none data-[side=bottom]:animate-slideDownAndFade dark:border-ink-700 dark:bg-ink-900 dark:shadow-soft-dark"
        >
          <div className="space-y-2">
            <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={searchPlaceholder} icon={RiSearchLine} />

            <div className="max-h-60 space-y-1 overflow-y-auto pr-1">
              {filteredOptions.length ? (
                filteredOptions.map((option) => {
                  const isSelected = multi ? Array.isArray(value) && value.includes(option.value) : value === option.value
                  const OptionIcon = option.icon

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleSelect(option.value)}
                      className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-sm transition ${
                        isSelected
                          ? 'bg-mist-100 text-ink-950 dark:bg-ink-800 dark:text-mist-200'
                          : 'text-mist-500 hover:bg-mist-50 dark:text-mist-300 dark:hover:bg-ink-800'
                      }`}
                    >
                      <span className="flex min-w-0 items-center gap-3">
                        {OptionIcon ? (
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded-md [&>svg]:h-4 [&>svg]:w-4">
                            <OptionIcon />
                          </span>
                        ) : null}
                        <span className="truncate">{option.label}</span>
                      </span>
                      {isSelected ? <RiCheckLine className="h-4 w-4 shrink-0 text-ink-950 dark:text-brand-300" /> : null}
                    </button>
                  )
                })
              ) : (
                <div className="rounded-xl px-3 py-3 text-sm text-mist-500 dark:text-mist-400">{emptyMessage}</div>
              )}
            </div>

            {actionLabel && onAction ? (
              <div className="border-t border-mist-200/80 pt-2 dark:border-ink-700">
                <Button variant="secondary" className="w-full rounded-xl" onClick={() => { onAction(); setOpen(false) }}>
                  {actionLabel}
                </Button>
              </div>
            ) : null}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
