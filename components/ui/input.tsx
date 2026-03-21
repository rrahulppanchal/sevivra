import * as React from 'react'

import { cn } from '@/lib/utils'

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'flex h-9 w-full min-w-0 rounded-lg border border-gray-200 dark:border-[#333] bg-white dark:bg-[#1a1a1a] px-3 py-1 text-sm text-[#1a1a1a] dark:text-[#eee] shadow-sm transition-all outline-none',
        'placeholder:text-gray-400 dark:placeholder:text-gray-500',
        'focus-visible:border-[#1DA619]/40 focus-visible:ring-2 focus-visible:ring-[#1DA619]/10',
        'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
        'file:text-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium',
        'aria-invalid:ring-red-200 aria-invalid:border-red-300',
        className,
      )}
      {...props}
    />
  )
}

export { Input }
