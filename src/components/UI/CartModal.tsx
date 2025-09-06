'use client'

import {Plus, Minus, Trash2, ShoppingCart} from 'lucide-react'

import {useCartStore} from '@/stores/cart-store'
import {calculatePricing, formatPrice} from '@/lib/pricing'

import Image from 'next/image'
import {P, SPAN} from '~/UI/Typography'
import {Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle} from '~/Core/dialog'
import {Button} from '~/Core/button'

export default function CartModal({isOpen, onClose}: {isOpen: boolean; onClose: () => void}) {
  const {cart, updateQuantity, removeItem, clearCart} = useCartStore()

  const pricing = calculatePricing(cart.items)

  // if (cart.items.length > 0) {
  //   debugPricingCalculations(cart.items)
  // }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl xl:max-w-[45vw] sm:max-w-[90vw] xl:max-h-[75vh] sm:max-h-[75vh] max-h-[80vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="border-b border-neutral-200 xl:px-5 xl:py-3 sm:px-4 sm:py-3 px-6 py-4">
          <DialogTitle className="flex items-center gap-2">Корзина</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {cart.items.length === 0 ? (
            <div className="flex-1 flex items-center justify-center py-16">
              <div className="text-center">
                <ShoppingCart className="size-12 mx-auto mb-4 text-neutral-400" />
                <P className="text-neutral-500">Корзина пуста</P>
              </div>
            </div>
          ) : (
            <div className="px-6 py-4 xl:px-5 xl:py-4 sm:p-3 space-y-4 xl:space-y-3 sm:space-y-2">
              {cart.items.map((item) => (
                <div key={item.productId} className="flex items-center gap-4 sm:gap-3 p-4 sm:p-3 border border-neutral-200 rounded-lg">
                  {item.imageUrl ? (
                    <Image src={item.imageUrl} alt={item.name} width={100} height={100} className="size-20 sm:size-16 object-cover rounded-lg" />
                  ) : (
                    <div className="size-20 sm:size-16 bg-neutral-100 rounded-lg grid place-items-center">
                      <SPAN className="text-neutral-400 sm:text-sm">Фото</SPAN>
                    </div>
                  )}

                  <div className="flex-1 min-w-0 space-y-3 sm:space-y-2">
                    <div className="flex justify-between">
                      <div>
                        <P className="font-medium sm:text-sm">{item.name}</P>
                        <SPAN className="text-neutral-500 sm:text-xs">@{item.expertUsername}</SPAN>
                      </div>

                      <P className="text-sm sm:text-xs font-medium mt-1">{formatPrice(item.price)}</P>
                    </div>

                    <div className="flex items-center justify-between sm:gap-2">
                      <div className="flex items-center">
                        <Button variant="outline" size="icon" onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="size-8 sm:size-7">
                          <Minus className="size-4 sm:size-3.5" />
                        </Button>

                        <SPAN className="w-8 sm:w-6 text-center font-medium sm:text-sm sm:py-2">{item.quantity}</SPAN>

                        <Button variant="outline" size="icon" onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="size-8 sm:size-7">
                          <Plus className="size-4 sm:size-3.5" />
                        </Button>
                      </div>

                      <Button variant="outline" size="icon" onClick={() => removeItem(item.productId)} className="size-8 sm:size-7 hover:text-destructive">
                        <Trash2 className="size-4 sm:size-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart.items.length > 0 && (
          <DialogFooter className="border-t border-neutral-200 xl:px-5 xl:py-3 sm:px-3 sm:py-3 px-6 py-4 flex flex-col sm:flex-col gap-6 xl:gap-4">
            <div className="flex flex-col gap-2 text-sm sm:text-xs">
              <div className="flex justify-between">
                <SPAN className="font-medium">Сумма товаров:</SPAN>
                <SPAN className="font-medium">{formatPrice(pricing.basePrice)}</SPAN>
              </div>

              <div className="flex justify-between">
                <SPAN className="font-medium">Комиссия экспертов (3%):</SPAN>
                <SPAN className="font-medium">{formatPrice(pricing.expertCommission)}</SPAN>
              </div>

              <div className="flex justify-between">
                <SPAN className="font-medium">Доставка:</SPAN>
                <SPAN className="font-medium">{formatPrice(pricing.deliveryFee)}</SPAN>
              </div>

              <div className="border-t border-t-neutral-200 pt-2 flex justify-between font-bold">
                <P>Итого к оплате:</P>
                <P>{formatPrice(pricing.finalPrice)}</P>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-1 gap-2">
              <Button variant="outline" onClick={clearCart} className="w-full">
                Очистить корзину
              </Button>

              <Button
                variant="default"
                className="w-full"
                onClick={() => {
                  // TODO: Implement order checkout
                  console.log('Checkout order:', {cart, pricing})
                }}
              >
                Оформить заказ
              </Button>
            </div>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
