'use client'

import {Plus, Minus, Trash2, ShoppingCart, ArrowLeft} from 'lucide-react'

import {api} from '@convex/_generated/api'
import {useQuery, useMutation} from 'convex/react'

import {useCartStore} from '@/stores/cart-store'
import {useCustomerStore} from '@/stores/customer-store'
import {calculatePricing, formatPrice} from '@/lib/pricing'
import {generateOrderToken} from '@/utils/order-token'

import {useState, useEffect} from 'react'
import {useForm} from 'react-hook-form'
import {zodResolver} from '@hookform/resolvers/zod'
import {z} from 'zod'
import {toast} from 'sonner'

import Image from 'next/image'
import {Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription} from '~/Core/dialog'
import {Button} from '~/Core/button'
import {Input} from '~/Core/input'
import {Textarea} from '~/Core/textarea'
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from '~/Core/form'
import {P, SPAN} from '~/UI/Typography'

const customerFormSchema = z.object({
  name: z.string().min(1, 'Имя обязательно'),
  email: z.email('Некорректный email'),
  contact: z.string().optional(),
  address: z.string().optional(),
  comment: z.string().optional(),
})

type CustomerFormData = z.infer<typeof customerFormSchema>

type CheckoutStep = 'cart' | 'checkout'

export default function CartModal({isOpen, onClose}: {isOpen: boolean; onClose: () => void}) {
  const convexUser = useQuery(api.tables.users.current)
  const createOrder = useMutation(api.tables.orders.createOrder)

  const [step, setStep] = useState<CheckoutStep>('cart')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [orderToken, setOrderToken] = useState(generateOrderToken)

  const {cart, updateQuantity, removeItem, clearCart} = useCartStore()
  const {customerInfo, setCustomerInfo} = useCustomerStore()

  const form = useForm<CustomerFormData>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      name: '',
      email: '',
      contact: '',
      address: '',
      comment: '',
    },
  })

  const pricing = calculatePricing(cart.items)

  useEffect(() => {
    if (isOpen) {
      setOrderToken(generateOrderToken())

      const userEmail = convexUser?.email || ''

      form.reset({
        name: customerInfo?.name || '',
        email: userEmail || customerInfo?.email || '',
        contact: customerInfo?.contact || '',
        address: customerInfo?.address || '',
        comment: customerInfo?.comment || '',
      })
    }
  }, [isOpen, convexUser, customerInfo, form])

  const handleCheckout = () => {
    setStep('checkout')
  }

  const handleBackToCart = () => {
    setStep('cart')
  }

  const handleSubmitOrder = async (data: CustomerFormData) => {
    if (!convexUser?._id) {
      console.error('Пользователь не найден в Convex')
      return
    }

    setIsSubmitting(true)

    try {
      // Сохраняем данные клиента в local storage (zustand)
      setCustomerInfo({
        name: data.name,
        email: data.email,
        contact: data.contact || '',
        address: data.address || '',
        comment: data.comment || '',
      })

      // Отправляем заказ в Convex
      const orderId = await createOrder({
        orderToken,
        items: cart.items.map((item) => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          expertUsername: item.expertUsername,
          imageUrl: item.imageUrl,
        })),
        customerInfo: {
          name: data.name,
          email: data.email,
          contact: data.contact,
          address: data.address,
          comment: data.comment,
        },
        pricing: pricing,
      })

      console.log('Заказ успешно создан:', orderId)

      // Отправляем email уведомление
      try {
        const emailResponse = await fetch('/api/email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            template: 'cart',
            data: {
              orderToken,
              items: cart.items.map((item) => ({
                productId: item.productId,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                expertUsername: item.expertUsername,
                imageUrl: item.imageUrl,
              })),
              customerInfo: {
                name: data.name,
                email: data.email,
                contact: data.contact,
                address: data.address,
                comment: data.comment,
              },
              pricing: pricing,
            },
          }),
        })

        if (!emailResponse.ok) {
          console.error('Ошибка при отправке email:', await emailResponse.text())
        } else {
          console.log('Email уведомление отправлено успешно')
        }
      } catch (emailError) {
        console.error('Ошибка при отправке email:', emailError)
      }

      toast.success('Заказ успешно создан!', {
        duration: 3000,
      })

      setOrderToken(generateOrderToken())

      clearCart()
      onClose()
    } catch (error) {
      console.error('Ошибка при создании заказа:', error)
      toast.error('Ошибка при создании заказа. Попробуйте еще раз.', {
        duration: 3000,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // if (cart.items.length > 0) {
  //   debugPricingCalculations(cart.items)
  // }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl xl:max-w-[45vw] sm:max-w-[90vw] xl:max-h-[75vh] sm:max-h-[75vh] max-h-[80vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="border-b border-neutral-200 xl:px-5 xl:py-3 sm:px-4 sm:py-3 px-6 py-4">
          <DialogTitle className="flex items-center gap-2">
            {step === 'checkout' && (
              <Button variant="ghost" size="icon" onClick={handleBackToCart} className="size-8 -ml-2">
                <ArrowLeft className="size-4" />
              </Button>
            )}
            {step === 'cart' ? 'Корзина' : 'Оформление заказа'}
          </DialogTitle>
          <DialogDescription className="sr-only">{step === 'cart' ? 'Управление товарами в корзине' : 'Форма оформления заказа'}</DialogDescription>
        </DialogHeader>

        {step === 'cart' ? (
          // Экран корзины
          <>
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

                  <Button variant="default" onClick={handleCheckout} className="w-full">
                    Оформить заказ
                  </Button>
                </div>
              </DialogFooter>
            )}
          </>
        ) : (
          // Экран оформления заказа
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmitOrder)} className="flex-1 flex flex-col">
              <div className="flex-1 overflow-y-auto px-6 py-4 xl:px-5 xl:py-4 sm:p-3">
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({field}) => (
                      <FormItem>
                        <FormLabel>Имя *</FormLabel>
                        <FormControl>
                          <Input placeholder="Ваше имя" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({field}) => (
                      <FormItem>
                        <FormLabel>Email *</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="your@email.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contact"
                    render={({field}) => (
                      <FormItem>
                        <FormLabel>Номер телефона, WhatsApp или Telegram</FormLabel>
                        <FormControl>
                          <Input placeholder="Номер, @username или ссылка" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address"
                    render={({field}) => (
                      <FormItem>
                        <FormLabel>Адрес доставки</FormLabel>
                        <FormControl>
                          <Input placeholder="Страна, город, улица, дом, квартира" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="comment"
                    render={({field}) => (
                      <FormItem>
                        <FormLabel>Комментарий</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Дополнительные пожелания к заказу" rows={3} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <DialogFooter className="border-t border-neutral-200 xl:px-5 xl:py-3 sm:px-3 sm:py-3 px-6 py-4">
                <div className="w-full space-y-4">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <P>Итого к оплате:</P>
                    <P>{formatPrice(pricing.finalPrice)}</P>
                  </div>

                  <Button type="submit" disabled={isSubmitting || !convexUser?._id} className="w-full">
                    {isSubmitting ? 'Оформляем заказ...' : 'Подтвердить заказ'}
                  </Button>
                </div>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  )
}
