import * as React from 'react'

import {cn} from '@/lib/utils'

function Textarea({className, ...props}: React.ComponentProps<'textarea'>) {
  return <textarea data-slot="textarea" className={cn('placeholder:text-neutral-400 selection:bg-foreground selection:text-background border-neutral-200 flex field-sizing-content min-h-16 w-full rounded-md border bg-background px-3 py-2 sm:px-2.5 sm:py-2 text-base sm:text-sm transition-colors outline-none focus:border-foreground focus:ring-2 focus:ring-neutral-300 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm', className)} {...props} />
}

export {Textarea}
