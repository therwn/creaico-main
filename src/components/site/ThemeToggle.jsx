'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { Select, SelectItem } from '@tremor/react'
import { RiComputerLine, RiMoonClearLine, RiSunLine } from '@remixicon/react'

const themeOptions = [
  { value: 'light', label: 'Light', icon: RiSunLine },
  { value: 'dark', label: 'Dark', icon: RiMoonClearLine },
  { value: 'system', label: 'System', icon: RiComputerLine },
]

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const { resolvedTheme, setTheme, theme } = useTheme()
  const activeTheme = theme ?? resolvedTheme ?? 'system'

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="min-w-[168px] space-y-2">
      <span className="block text-xs font-semibold uppercase tracking-[0.24em] text-mist-500 dark:text-mist-400">Theme</span>
      <Select value={mounted ? activeTheme : 'system'} onValueChange={setTheme} placeholder="Theme">
        {themeOptions.map((option) => {
          const Icon = option.icon
          return (
            <SelectItem key={option.value} value={option.value}>
              <span className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                <span>{option.label}</span>
              </span>
            </SelectItem>
          )
        })}
      </Select>
    </div>
  )
}
