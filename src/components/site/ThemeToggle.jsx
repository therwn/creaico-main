'use client'

import { useTheme } from 'next-themes'
import { Button } from '@tremor/react'
import { RiComputerLine, RiMoonClearLine, RiSunLine } from '@remixicon/react'

const themeOptions = [
  { value: 'light', label: 'Light', icon: RiSunLine },
  { value: 'dark', label: 'Dark', icon: RiMoonClearLine },
  { value: 'system', label: 'System', icon: RiComputerLine },
]

export default function ThemeToggle() {
  const { resolvedTheme, setTheme, theme } = useTheme()
  const activeTheme = theme === 'system' ? 'system' : resolvedTheme ?? 'dark'

  return (
    <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/80 p-1 shadow-soft dark:border-slate-800 dark:bg-slate-900/80 dark:shadow-soft-dark">
      {themeOptions.map((option) => {
        const Icon = option.icon
        const isActive = activeTheme === option.value

        return (
          <Button
            key={option.value}
            size="xs"
            variant={isActive ? 'primary' : 'secondary'}
            color={isActive ? 'emerald' : 'gray'}
            icon={Icon}
            className="min-w-[84px] justify-center rounded-xl"
            onClick={() => setTheme(option.value)}
          >
            {option.label}
          </Button>
        )
      })}
    </div>
  )
}
