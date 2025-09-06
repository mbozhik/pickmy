import type {CartItem} from '@/stores/cart-store'

const CONFIG = {
  EXPERT_COMMISSION_PERCENT: 3, // 3% комиссия эксперта с каждого продукта
  DELIVERY_FEE: 1000, // 1000₽ за доставку
  CACHE_EXPIRY_DAYS: 7, // Устаревание данных через 7 дней
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

  // Группируем товары по экспертам и считаем комиссию для каждого
  const expertCommissions: Record<string, number> = {}
  const itemCommissions: Array<{productId: string; itemTotal: number; commission: number}> = []

  cartItems.forEach((item) => {
    const itemTotal = item.price * item.quantity
    const itemCommission = Math.round(itemTotal * (CONFIG.EXPERT_COMMISSION_PERCENT / 100))

    // Сохраняем детализацию по товару
    itemCommissions.push({
      productId: item.productId,
      itemTotal,
      commission: itemCommission,
    })

    if (!expertCommissions[item.expertUsername]) {
      expertCommissions[item.expertUsername] = 0
    }
    expertCommissions[item.expertUsername] += itemCommission
  })

  // Общая сумма комиссий всех экспертов
  const expertCommission = Object.values(expertCommissions).reduce((total, commission) => total + commission, 0)

  const deliveryFee = CONFIG.DELIVERY_FEE
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
  const commission = Math.round(price * (CONFIG.EXPERT_COMMISSION_PERCENT / 100))
  const finalPrice = price + commission + CONFIG.DELIVERY_FEE

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
    const itemCommission = Math.round((itemTotal * CONFIG.EXPERT_COMMISSION_PERCENT) / 100)

    console.log(`${index + 1}. ${item.name}`)
    console.log(`   Цена: ${item.price}₽ × ${item.quantity} шт = ${itemTotal}₽`)
    console.log(`   Комиссия (${CONFIG.EXPERT_COMMISSION_PERCENT}%): ${itemCommission}₽`)
    console.log(`   Эксперт: @${item.expertUsername}`)
    console.log('---')
  })

  const pricing = calculatePricing(cartItems)
  console.log('ИТОГО:')
  console.log(`Сумма товаров: ${pricing.basePrice}₽`)
  console.log(`Общая комиссия: ${pricing.expertCommission}₽`)
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
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}
