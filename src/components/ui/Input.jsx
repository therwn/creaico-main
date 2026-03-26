'use client'

import { forwardRef } from 'react'
import { TextInput } from '@tremor/react'

const Input = forwardRef(function Input(
  { className, hasError = false, type = 'text', ...props },
  forwardedRef,
) {
  return (
    <TextInput
      ref={forwardedRef}
      type={type}
      error={hasError}
      className={className}
      {...props}
    />
  )
})

export default Input
