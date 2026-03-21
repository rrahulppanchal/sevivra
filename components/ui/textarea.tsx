import * as React from 'react'

import { cn } from '@/lib/utils'

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'flex field-sizing-content min-h-16 w-full rounded-lg border border-gray-200 dark:border-[#333] bg-white dark:bg-[#1a1a1a] px-3 py-2 text-sm text-[#1a1a1a] dark:text-[#eee] shadow-sm transition-all outline-none resize-y',
        'placeholder:text-gray-400 dark:placeholder:text-gray-500',
        'focus-visible:border-[#1DA619]/40 focus-visible:ring-2 focus-visible:ring-[#1DA619]/10',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'aria-invalid:ring-red-200 aria-invalid:border-red-300',
        className,
      )}
      {...props}
    />
  )
}

export { Textarea }
