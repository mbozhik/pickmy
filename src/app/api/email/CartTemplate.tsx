import * as React from 'react'
import {Body, Container, Head, Heading, Hr, Html, Img, Preview, Section, Text, Tailwind} from '@react-email/components'

export const SUBJECT = 'Новый заказ на pickmy.ru'

export type OrderItem = {
  productId: string
  name: string
  price: number
  quantity: number
  expertUsername: string
  imageUrl?: string
}

export type CustomerInfo = {
  name: string
  email: string
  contact?: string
  address?: string
  comment?: string
}

export type PricingBreakdown = {
  basePrice: number
  expertCommission: number
  deliveryFee: number
  finalPrice: number
}

export type FormFields = {
  orderToken: string
  items: OrderItem[]
  customerInfo: CustomerInfo
  pricing: PricingBreakdown
}

const StarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" fill="none" viewBox="0 0 100 100">
    <path fill="#FFF" d="m100 48.906-29.922 5.157c-7.734 1.328-13.75 7.5-14.766 15.312L51.094 100l-5.157-29.922c-1.328-7.734-7.5-13.75-15.312-14.766L0 51.094l29.922-5.157c7.734-1.328 13.75-7.5 14.765-15.312L48.907 0l5.156 29.922c1.328 7.734 7.5 13.75 15.312 14.765L100 48.907Z" />
  </svg>
)

export const CartTemplate = ({orderToken, items, customerInfo, pricing}: FormFields) => {
  const previewText = `Новый заказ ${orderToken} от ${customerInfo.name}`

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="mx-auto my-auto font-sans bg-white">
          <Container className="bg-white my-8 mx-auto p-0 max-w-[600px]">
            {/* Header with Star Icon */}
            <Section className="bg-neutral-900 text-center py-8 px-6 rounded-lg mb-0">
              <div style={{display: 'flex', justifyContent: 'center', marginBottom: '20px'}}>
                <StarIcon />
              </div>
              <Heading className="text-white text-[36px] font-bold m-0">PICKMY</Heading>
            </Section>

            {/* Order Header */}
            <Section className="text-center pt-8 pb-4 px-6 mb-0">
              <div className="flex items-center justify-center gap-3 mb-2">
                <Heading className="text-neutral-900 text-[28px] font-semibold m-0">Новый заказ</Heading>
                <div className="bg-neutral-100 rounded-lg px-2 py-1 border border-neutral-200">
                  <Text className="text-neutral-900 text-[14px] font-medium m-0">#{orderToken}</Text>
                </div>
              </div>
              <Text className="text-neutral-600 text-[14px] m-0">
                {new Date().toLocaleString('ru-RU', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </Section>

            {/* Customer Info */}
            <Section className="mb-6">
              <div className="bg-neutral-100 rounded-lg p-4 border border-neutral-200">
                <Heading className="text-neutral-800 text-[16px] font-medium m-0 mb-4">Информация о клиенте</Heading>
                <div className="bg-white rounded-md p-4 border border-neutral-200">
                  <Text className="text-neutral-900 text-[14px] leading-[22px] m-0 mb-3">
                    <span className="text-neutral-700 font-normal">Имя:</span> {customerInfo.name}
                  </Text>
                  <Text className="text-neutral-900 text-[14px] leading-[22px] m-0 mb-3">
                    <span className="text-neutral-700 font-normal">Email:</span> {customerInfo.email}
                  </Text>
                  {customerInfo.contact && (
                    <Text className="text-neutral-900 text-[14px] leading-[22px] m-0 mb-3">
                      <span className="text-neutral-700 font-normal">Контакт:</span> {customerInfo.contact}
                    </Text>
                  )}
                  {customerInfo.address && (
                    <Text className="text-neutral-900 text-[14px] leading-[22px] m-0 mb-3">
                      <span className="text-neutral-700 font-normal">Адрес:</span> {customerInfo.address}
                    </Text>
                  )}
                  {customerInfo.comment && (
                    <Text className="text-neutral-900 text-[14px] leading-[22px] m-0">
                      <span className="text-neutral-700 font-normal">Комментарий:</span> {customerInfo.comment}
                    </Text>
                  )}
                </div>
              </div>
            </Section>

            {/* Order Items */}
            <Section className="mb-6">
              <div className="bg-neutral-100 rounded-lg p-4 border border-neutral-200">
                <Heading className="text-neutral-800 text-[16px] font-medium m-0 mb-4">Заказанные товары</Heading>
                <div>
                  {items.map((item, index) => (
                    <div key={item.productId} className={`bg-white rounded-md p-4 border border-neutral-200 ${index > 0 ? 'mt-4' : ''}`}>
                      <div className="flex gap-4 items-center">
                        {/* Product Image */}
                        <div className="flex-shrink-0">
                          {item.imageUrl ? (
                            <Img src={item.imageUrl} alt={item.name} width="100" height="100" className="rounded-lg object-cover border border-neutral-200" />
                          ) : (
                            <div className="w-[100px] h-[100px] bg-neutral-200 rounded-lg border border-neutral-300 flex items-center justify-center">
                              <Text className="text-neutral-500 text-[12px] m-0">Фото</Text>
                            </div>
                          )}
                        </div>

                        {/* Product Info */}
                        <div className="flex-1">
                          <Text className="text-neutral-900 text-[14px] font-medium leading-[20px] m-0 mb-0">{item.name}</Text>
                          <Text className="text-neutral-700 text-[13px] leading-[18px] m-0 mb-2">
                            Эксперт:{' '}
                            <a href={`https://pickmy.ru/experts/${item.expertUsername}`} className="text-neutral-700 no-underline">
                              @{item.expertUsername}
                            </a>
                          </Text>
                          <div>
                            <Text className="text-neutral-700 text-[13px] m-0 -mb-1">
                              Цена: ${item.price} × {item.quantity}шт
                            </Text>
                            <Text className="text-neutral-900 text-[13px] font-medium m-0">Сумма: ${item.price * item.quantity}</Text>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Section>

            {/* Pricing Breakdown */}
            <Section className="mb-6">
              <div className="bg-neutral-100 rounded-lg p-4 border border-neutral-200">
                <Heading className="text-neutral-800 text-[16px] font-medium m-0 mb-4">Детализация оплаты</Heading>
                <div className="bg-white rounded-md p-4 border border-neutral-200">
                  <div className="flex justify-between items-center">
                    <Text className="text-neutral-700 text-[14px] m-0">Сумма товаров:</Text>
                    <Text className="text-neutral-900 text-[14px] font-medium m-0">${pricing.basePrice}</Text>
                  </div>
                  <div className="flex justify-between items-center mt-3">
                    <Text className="text-neutral-700 text-[14px] m-0">Комиссия экспертов (3%):</Text>
                    <Text className="text-neutral-900 text-[14px] font-medium m-0">${pricing.expertCommission}</Text>
                  </div>
                  <div className="flex justify-between items-center mt-3 pb-3">
                    <Text className="text-neutral-700 text-[14px] m-0">Доставка:</Text>
                    <Text className="text-neutral-900 text-[14px] font-medium m-0">${pricing.deliveryFee}</Text>
                  </div>
                  <Hr className="border-neutral-300 my-0" />
                  <div className="flex justify-between items-center pt-3">
                    <Text className="text-neutral-900 text-[16px] font-bold m-0">Итого к оплате:</Text>
                    <Text className="text-neutral-900 text-[18px] font-bold m-0">${pricing.finalPrice}</Text>
                  </div>
                </div>
              </div>
            </Section>

            {/* Footer */}
            <Section className="text-center py-6 px-6 border-t border-neutral-200">
              <Text className="text-neutral-500 text-[12px] leading-[18px] m-0">
                Уведомление о новом заказе на платформе{' '}
                <a href="https://pickmy.ru" target="_blank" className="text-neutral-600 no-underline">
                  pickmy.ru
                </a>
              </Text>
              <Text className="text-neutral-400 text-[11px] leading-[16px] m-0 mt-2">Свяжитесь с клиентом для подтверждения заказа</Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

CartTemplate.PreviewProps = {
  orderToken: 'OM7K9X',
  items: [
    {
      productId: 'omega-complex',
      name: 'Omega Complex',
      price: 25,
      quantity: 2,
      expertUsername: 'sofia-drozdova',
      imageUrl: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=400&fit=crop',
    },
    {
      productId: 'brain-focus',
      name: 'Brain Focus',
      price: 29,
      quantity: 1,
      expertUsername: 'dmitry-volkov',
      imageUrl: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400&h=400&fit=crop',
    },
    {
      productId: 'protein-power',
      name: 'Protein Power',
      price: 35,
      quantity: 1,
      expertUsername: 'alex-petrov',
      imageUrl: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=400&h=400&fit=crop',
    },
  ],
  customerInfo: {
    name: 'Дмитрий Семенов',
    email: 'dmitry.semenov@mail.ru',
    contact: '+7 925 486 12 75',
    address: 'Санкт-Петербург, пр. Невский, д. 28, кв. 156',
    comment: 'Предпочитаю доставку в вечернее время после 18:00. Интересует возможность консультации по применению добавок.',
  },
  pricing: {
    basePrice: 114, // 25*2 + 29 + 35
    expertCommission: 3.42, // 3% от базовой суммы (114*0.03=3.42)
    deliveryFee: 28.5, // 25% от basePrice (114*0.25=28.5)
    finalPrice: 145.92, // итого
  },
} as FormFields

export default CartTemplate
