'use client'

import {ShoppingCart} from 'lucide-react'

import {useCartStore} from '@/stores/cart-store'
import {cn} from '@/lib/utils'

export default function CartButton({className, onClick}: {className?: string; onClick?: () => void}) {
  const {totalItems, isLoaded} = useCartStore()

  // console.log('CartButton render:', {totalItems, isLoaded})

  if (!isLoaded || totalItems === 0) {
    return null
  }

  return (
    <button onClick={onClick} className={cn('relative flex items-center justify-center gap-2', 'px-3 py-1.75 sm:px-2 sm:py-0 rounded-md', 'bg-neutral-200 hover:bg-neutral-300 text-foreground duration-300', className)}>
      <ShoppingCart className="size-4" strokeWidth={1.7} />
      <span className="text-sm sm:text-xs font-medium">{totalItems}</span>
    </button>
  )
}
