'use client'

import { Text, Title } from '@tremor/react'

export default function WorkspaceBrand({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl border border-mist-200/80 bg-ink-950 dark:border-ink-700 dark:bg-ink-900">
          <img src="/apple-touch-icon.png" alt="CREAI logo" className="h-full w-full object-cover" />
        </div>
        <div>
          <Text className="text-xs uppercase tracking-[0.24em] text-mist-500 dark:text-mist-400">CREAI</Text>
          <Title>{label}</Title>
        </div>
      </div>
      {value}
    </div>
  )
}
