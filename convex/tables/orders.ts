import type {QueryCtx} from '@convex/_generated/server'

import {mutation, query} from '@convex/_generated/server'
import {v} from 'convex/values'

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'

const customerInfoValidator = v.object({
  name: v.string(),
  email: v.string(),
  contact: v.optional(v.string()),
  address: v.optional(v.string()),
  comment: v.optional(v.string()),
})

const pricingValidator = v.object({
  basePrice: v.number(),
  expertCommission: v.number(),
  deliveryFee: v.number(),
  finalPrice: v.number(),
  calculatedAt: v.number(),
  expertCommissions: v.record(v.string(), v.number()),
  itemCommissions: v.array(
    v.object({
      productId: v.string(),
      itemTotal: v.number(),
      commission: v.number(),
    }),
  ),
})

const orderItemValidator = v.object({
  productId: v.string(),
  name: v.string(),
  price: v.number(),
  quantity: v.number(),
  expertUsername: v.string(),
  imageUrl: v.optional(v.string()),
})

// Получить все заказы (для админа)
export const getAllOrders = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query('orders').order('desc').collect()
  },
})

// Получить заказы текущего пользователя
export const getUserOrders = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error('Unauthorized')
    }

    const user = await getUserByExternalId(ctx, identity.subject)
    if (!user) {
      throw new Error('User not found')
    }

    return await ctx.db
      .query('orders')
      .withIndex('by_user', (q) => q.eq('userId', user._id))
      .order('desc')
      .collect()
  },
})

// Получить заказ по токену
export const getOrderByToken = query({
  args: {orderToken: v.string()},
  handler: async (ctx, args) => {
    return await ctx.db
      .query('orders')
      .withIndex('by_token', (q) => q.eq('orderToken', args.orderToken))
      .unique()
  },
})

// Создать новый заказ
export const createOrder = mutation({
  args: {
    orderToken: v.string(),
    items: v.array(orderItemValidator),
    customerInfo: customerInfoValidator,
    pricing: pricingValidator,
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error('Unauthorized')
    }

    const user = await getUserByExternalId(ctx, identity.subject)
    if (!user) {
      throw new Error('User not found')
    }

    // Проверяем уникальность токена
    const existingOrder = await ctx.db
      .query('orders')
      .withIndex('by_token', (q) => q.eq('orderToken', args.orderToken))
      .unique()

    if (existingOrder) {
      throw new Error('Order token already exists')
    }

    return await ctx.db.insert('orders', {
      orderToken: args.orderToken,
      userId: user._id,
      items: args.items,
      customerInfo: args.customerInfo,
      pricing: args.pricing,
      paymentStatus: 'pending',
      status: 'pending',
    })
  },
})

// Обновить статус заказа (для админа)
export const updateOrderStatus = mutation({
  args: {
    orderId: v.id('orders'),
    status: v.union(v.literal('pending'), v.literal('confirmed'), v.literal('processing'), v.literal('shipped'), v.literal('delivered'), v.literal('cancelled')),
    paymentStatus: v.optional(v.union(v.literal('pending'), v.literal('paid'), v.literal('failed'), v.literal('refunded'))),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const updates: {status: OrderStatus; paymentStatus?: PaymentStatus; notes?: string} = {status: args.status}
    if (args.paymentStatus !== undefined) {
      updates.paymentStatus = args.paymentStatus
    }
    if (args.notes !== undefined) {
      updates.notes = args.notes
    }

    await ctx.db.patch(args.orderId, updates)
    return args.orderId
  },
})

// Обновить статус оплаты (для админа/платежной системы)
export const updatePaymentStatus = mutation({
  args: {
    orderId: v.id('orders'),
    paymentStatus: v.union(v.literal('pending'), v.literal('paid'), v.literal('failed'), v.literal('refunded')),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.orderId, {
      paymentStatus: args.paymentStatus,
    })
    return args.orderId
  },
})

// Утилитарная функция для получения пользователя по external ID
async function getUserByExternalId(ctx: QueryCtx, externalId: string) {
  return await ctx.db
    .query('users')
    .withIndex('byExternalId', (q) => q.eq('externalId', externalId))
    .unique()
}
