import {defineSchema, defineTable} from 'convex/server'
import {v} from 'convex/values'

export default defineSchema({
  users: defineTable({
    externalId: v.string(),
    email: v.string(),
    role: v.union(v.literal('user'), v.literal('expert'), v.literal('admin')),
  }).index('byExternalId', ['externalId']),

  products: defineTable({
    name: v.string(),
    category: v.id('categories'),
    expert: v.id('experts'),
    caption: v.string(),
    slug: v.string(),
    featured: v.boolean(),
    price: v.number(),
    image: v.optional(v.id('_storage')),
  })
    .index('by_featured', ['featured'])
    .index('by_category', ['category'])
    .index('by_expert', ['expert'])
    .index('by_slug', ['slug']),

  categories: defineTable({
    name: v.string(),
    description: v.string(),
    slug: v.string(),
  }),

  experts: defineTable({
    name: v.string(),
    role: v.string(),
    username: v.string(),
    link: v.string(),
    featured: v.boolean(),
    userId: v.id('users'),
    isActive: v.boolean(),
  })
    .index('by_featured', ['featured'])
    .index('by_username', ['username'])
    .index('by_userId', ['userId']),

  orders: defineTable({
    orderToken: v.string(),
    userId: v.id('users'),

    // Список товаров в заказе
    items: v.array(
      v.object({
        productId: v.string(),
        name: v.string(),
        price: v.number(),
        quantity: v.number(),
        expertUsername: v.string(),
        imageUrl: v.optional(v.string()),
      }),
    ),

    // Информация о клиенте
    customerInfo: v.object({
      name: v.string(),
      email: v.string(),
      contact: v.optional(v.string()),
      address: v.optional(v.string()),
      comment: v.optional(v.string()),
    }),

    // Стоимость заказа
    pricing: v.object({
      basePrice: v.number(), // Сумма товаров
      expertCommission: v.number(), // Общая комиссия экспертов
      deliveryFee: v.number(), // Стоимость доставки
      finalPrice: v.number(), // Итоговая сумма
      calculatedAt: v.number(), // Timestamp расчета
      expertCommissions: v.record(v.string(), v.number()), // Комиссия по каждому эксперту
      itemCommissions: v.array(
        v.object({
          productId: v.string(),
          itemTotal: v.number(),
          commission: v.number(),
        }),
      ), // Детализация комиссий по товарам
    }),

    // Информация об оплате
    paymentStatus: v.union(
      v.literal('pending'), // Ожидает оплаты
      v.literal('paid'), // Оплачен
      v.literal('failed'), // Ошибка оплаты
      v.literal('refunded'), // Возврат
    ),

    // Статус заказа
    status: v.union(
      v.literal('pending'), // Ожидает подтверждения
      v.literal('confirmed'), // Подтвержден
      v.literal('processing'), // В обработке
      v.literal('shipped'), // Отправлен
      v.literal('delivered'), // Доставлен
      v.literal('cancelled'), // Отменен
    ),

    // Заметки администратора
    notes: v.optional(v.string()),
  })
    .index('by_user', ['userId'])
    .index('by_token', ['orderToken'])
    .index('by_status', ['status']),
})
