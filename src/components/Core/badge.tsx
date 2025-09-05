import * as React from 'react'
import {Slot} from '@radix-ui/react-slot'
import {cva, type VariantProps} from 'class-variance-authority'

import {cn} from '@/lib/utils'

const badgeVariants = cva('inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:ring-2 focus-visible:ring-neutral-300 transition-colors overflow-hidden', {
  variants: {
    variant: {
      default: 'border-transparent bg-foreground text-background [a&]:hover:bg-foreground/90',
      secondary: 'border-transparent bg-neutral-200 text-foreground [a&]:hover:bg-neutral-200',
      destructive: 'border-transparent bg-destructive text-destructive-foreground [a&]:hover:bg-destructive/90',
      outline: 'text-foreground border-neutral-200 [a&]:hover:bg-neutral-100',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

function Badge({className, variant, asChild = false, ...props}: React.ComponentProps<'span'> & VariantProps<typeof badgeVariants> & {asChild?: boolean}) {
  const Comp = asChild ? Slot : 'span'

  return <Comp data-slot="badge" className={cn(badgeVariants({variant}), className)} {...props} />
}

export {Badge, badgeVariants}
