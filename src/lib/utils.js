import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cx(...args) {
  return twMerge(clsx(args))
}

export const cn = cx

export const focusInput = [
  'focus:ring-2',
  'focus:ring-brand-200 dark:focus:ring-brand-700/30',
  'focus:border-brand-500 dark:focus:border-brand-700',
]

export const focusRing = [
  'outline outline-offset-2 outline-0 focus-visible:outline-2',
  'outline-brand-500 dark:outline-brand-500',
]

export const hasErrorInput = [
  'ring-2',
  'border-red-500 dark:border-red-700',
  'ring-red-200 dark:ring-red-700/30',
]
