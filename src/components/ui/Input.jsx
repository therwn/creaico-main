'use client'

import { forwardRef } from 'react'
import { cx, focusInput, hasErrorInput } from '../../lib/cn'

const Input = forwardRef(function Input(
  { className, hasError = false, type = 'text', ...props },
  forwardedRef,
) {
  return (
    <input
      ref={forwardedRef}
      type={type}
      className={cx(
        'block w-full rounded-xl border px-3 py-2.5 text-sm shadow-sm transition',
        'border-gray-300 bg-white text-gray-900 placeholder:text-gray-400',
        'dark:border-gray-800 dark:bg-gray-950 dark:text-gray-50 dark:placeholder:text-gray-500',
        'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
        focusInput,
        hasError && hasErrorInput,
        className,
      )}
      {...props}
    />
  )
})

export default Input
