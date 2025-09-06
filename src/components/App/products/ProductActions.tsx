'use client'

import {useCartStore} from '@/stores/cart-store'
import {calculateProductPrice, formatPrice} from '@/lib/pricing'
import {cn} from '@/lib/utils'

import {useState} from 'react'
import {toast} from 'sonner'

import {H3, SPAN} from '~/UI/Typography'
import Button from '~/UI/Button'
import CartModal from '~/UI/CartModal'

import type {ProductWithExtraData} from '~/UI/Grid'

export default function ProductActions({product}: {product: ProductWithExtraData}) {
  const {addItem} = useCartStore()
  const [isAddedToCart, setIsAddedToCart] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)

  const handleAddToCart = () => {
    addItem({
      productId: product._id,
      name: product.name,
      price: product.price,
      expertId: product.expertData._id,
      expertUsername: product.expertData.username,
      imageUrl: product.imageUrl,
      slug: product.slug,
    })

    setIsAddedToCart(true)

    toast.success(`${product.name} добавлен в корзину`, {
      duration: 3000,
    })
  }

  const handleOpenCart = () => {
    setIsCartOpen(true)
  }

  const pricing = calculateProductPrice(product.price)

  return (
    <div className="grid grid-cols-3 sm:grid-cols-1 items-end sm:gap-4">
      <div className={cn('col-span-1', 'space-y-0.5 sm:space-y-0', 'flex flex-col w-full')}>
        <H3 className={cn('text-5xl xl:text-4xl sm:text-4xl', 'font-semibold')}>{formatPrice(pricing.finalPrice)}</H3>
        <SPAN className="text-neutral-600 !leading-none text-nowrap">+ комиссия при оформлении</SPAN>
      </div>

      {!isAddedToCart ? (
        <Button variant="solid" className={cn('col-span-2 sm:col-span-1 justify-self-end', 'w-[90%] sm:w-full h-fit py-4 xl:py-3 sm:py-2.5', 'text-lg xl:text-base sm:text-sm font-medium')} text="Добавить в корзину" onClick={handleAddToCart} />
      ) : (
        <div className="col-span-2 sm:col-span-1 justify-self-end w-[90%] sm:w-full grid grid-cols-2 gap-2">
          <Button variant="solid" className={cn('col-span-1', 'h-fit !px-0 py-4 xl:py-3 sm:py-2.5', 'text-lg xl:text-base sm:text-sm font-medium')} text="Добавить ещё" onClick={handleAddToCart} />
          <Button variant="muted" className={cn('col-span-1', 'h-fit !px-0 py-4 xl:py-3 sm:py-2.5', 'text-lg xl:text-base sm:text-sm font-medium')} text="Открыть корзину" onClick={handleOpenCart} />
        </div>
      )}

      <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  )
}
