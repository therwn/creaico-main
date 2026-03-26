'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { RiComputerLine, RiMoonClearLine, RiSunLine } from '@remixicon/react'
import SearchableSelect from '../ui/SearchableSelect'

const themeOptions = [
  { value: 'light', label: 'Light', icon: RiSunLine },
  { value: 'dark', label: 'Dark', icon: RiMoonClearLine },
  { value: 'system', label: 'System', icon: RiComputerLine },
]

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const { resolvedTheme, setTheme, theme } = useTheme()
  const activeTheme = theme ?? resolvedTheme ?? 'system'
  const activeOption = themeOptions.find((option) => option.value === activeTheme) || themeOptions[2]

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="min-w-[168px] space-y-2">
      <span className="block text-xs font-semibold uppercase tracking-[0.24em] text-mist-500 dark:text-mist-400">Theme</span>
      <SearchableSelect
        value={mounted ? activeTheme : 'system'}
        onChange={setTheme}
        options={themeOptions}
        placeholder="Theme"
        searchPlaceholder="Search theme..."
        emptyMessage="No theme found."
        icon={activeOption.icon}
      />
    </div>
  )
}
