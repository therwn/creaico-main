'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { Select, SelectItem } from '@tremor/react'
import { RiComputerLine, RiMoonClearLine, RiPaletteLine, RiSunLine } from '@remixicon/react'

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
    <div className="min-w-[168px]">
      <Select
        value={mounted ? activeTheme : 'system'}
        onValueChange={setTheme}
        icon={RiPaletteLine}
        placeholder="Theme"
      >
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
