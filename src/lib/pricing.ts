import type {CartItem} from '@/stores/cart-store'

const CONFIG = {
  EXPERT_COMMISSION_PERCENT: 15, // 15% комиссия эксперта с каждого продукта
  DELIVERY_PERCENT: 25, // 25% от стоимости товаров за доставку
  CACHE_EXPIRY_DAYS: 1, // Устаревание данных через 1 день
} as const

export type PricingBreakdown = {
  basePrice: number
  expertCommission: number
  expertCommissions: Record<string, number> // Комиссия по каждому эксперту
  itemCommissions: Array<{productId: string; itemTotal: number; commission: number}>
  deliveryFee: number
  finalPrice: number
  calculatedAt: number
}

export function calculatePricing(cartItems: CartItem[]): PricingBreakdown {
  // Базовая сумма всех товаров
  const basePrice = cartItems.reduce((total, item) => total + item.price * item.quantity, 0)

  // Экспертная комиссия рассчитывается как процент от базовой стоимости товаров
  const expertCommission = basePrice * (CONFIG.EXPERT_COMMISSION_PERCENT / 100)

  // Группируем товары по экспертам для распределения комиссии
  const expertCommissions: Record<string, number> = {}
  const itemCommissions: Array<{productId: string; itemTotal: number; commission: number}> = []

  // Распределяем общую комиссию пропорционально стоимости товаров каждого эксперта
  const expertTotals: Record<string, number> = {}
  cartItems.forEach((item) => {
    const itemTotal = item.price * item.quantity
    if (!expertTotals[item.expertUsername]) {
      expertTotals[item.expertUsername] = 0
    }
    expertTotals[item.expertUsername] += itemTotal
  })

  // Рассчитываем комиссию для каждого эксперта пропорционально его товарам
  Object.entries(expertTotals).forEach(([expertUsername, expertTotal]) => {
    const expertCommissionAmount = (expertTotal / basePrice) * expertCommission
    expertCommissions[expertUsername] = expertCommissionAmount
  })

  // Создаем детализацию по товарам для совместимости
  cartItems.forEach((item) => {
    const itemTotal = item.price * item.quantity
    const itemCommission = (itemTotal / basePrice) * expertCommission

    itemCommissions.push({
      productId: item.productId,
      itemTotal,
      commission: itemCommission,
    })
  })

  // Доставка рассчитывается как процент от базовой стоимости товаров
  const deliveryFee = basePrice * (CONFIG.DELIVERY_PERCENT / 100)
  const finalPrice = basePrice + expertCommission + deliveryFee
  const calculatedAt = Date.now()

  return {
    basePrice,
    expertCommission,
    expertCommissions,
    itemCommissions,
    deliveryFee,
    finalPrice,
    calculatedAt,
  }
}

export function calculateProductPrice(price: number): {basePrice: number; commission: number; finalPrice: number} {
  const commission = price * (CONFIG.EXPERT_COMMISSION_PERCENT / 100)
  const deliveryFee = price * (CONFIG.DELIVERY_PERCENT / 100)
  const finalPrice = price + commission + deliveryFee

  return {
    basePrice: price,
    commission,
    finalPrice,
  }
}

export function debugPricingCalculations(cartItems: CartItem[]): void {
  console.log('=== РАСЧЕТ КОМИССИЙ ===')
  console.log('Товары в корзине:', cartItems.length)

  cartItems.forEach((item, index) => {
    const itemTotal = item.price * item.quantity

    console.log(`${index + 1}. ${item.name}`)
    console.log(`   Цена: $${item.price} × ${item.quantity} шт = $${itemTotal}`)
    console.log(`   Эксперт: @${item.expertUsername}`)
    console.log('---')
  })

  const pricing = calculatePricing(cartItems)
  console.log('ИТОГО:')
  console.log(`Сумма товаров: $${pricing.basePrice}`)
  console.log(`Общая комиссия экспертов (${CONFIG.EXPERT_COMMISSION_PERCENT}%): $${pricing.expertCommission}`)
  console.log(`Доставка (${CONFIG.DELIVERY_PERCENT}%): $${pricing.deliveryFee}`)
  console.log('Комиссии по экспертам:', pricing.expertCommissions)
}

export function getExpertCommission(pricing: PricingBreakdown, expertUsername: string): number {
  return pricing.expertCommissions[expertUsername] || 0
}

export function getExpertsWithCommissions(pricing: PricingBreakdown): Array<{expertUsername: string; commission: number}> {
  return Object.entries(pricing.expertCommissions).map(([expertUsername, commission]) => ({
    expertUsername,
    commission,
  }))
}

export function isPricingExpired(calculatedAt: number): boolean {
  const now = Date.now()
  const expiryTime = CONFIG.CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000 // 7 days
  return now - calculatedAt > expiryTime
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price)
}
