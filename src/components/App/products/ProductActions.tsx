'use client'

import {useCartStore} from '@/stores/cart-store'
import {calculateProductPrice, formatPrice} from '@/lib/pricing'
import {cn} from '@/lib/utils'

import {toast} from 'sonner'

import {H3, SPAN} from '~/UI/Typography'
import Button from '~/UI/Button'

import type {ProductWithExtraData} from '~/UI/Grid'

export default function ProductActions({product}: {product: ProductWithExtraData}) {
  const {addItem} = useCartStore()

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

    toast.success(`${product.name} добавлен в корзину`, {
      duration: 3000,
    })
  }

  const pricing = calculateProductPrice(product.price)

  return (
    <div className="grid grid-cols-3 sm:grid-cols-1 items-end sm:gap-4">
      <div className={cn('col-span-1', 'space-y-0.5 sm:space-y-0', 'flex flex-col w-full')}>
        <H3 className={cn('text-5xl xl:text-4xl sm:text-4xl', 'font-semibold')}>{formatPrice(pricing.finalPrice)}</H3>
        <SPAN className="text-neutral-600 !leading-none text-nowrap">+ комиссия при оформлении</SPAN>
      </div>

      <Button variant="solid" className={cn('col-span-2 sm:col-span-1 justify-self-end', 'w-[90%] sm:w-full h-fit py-4 xl:py-3 sm:py-2.5', 'text-lg xl:text-base sm:text-base font-medium')} text="Добавить в корзину" onClick={handleAddToCart} />
    </div>
  )
}
