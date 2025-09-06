import {create} from 'zustand'
import {persist} from 'zustand/middleware'

export type CartItem = {
  productId: string
  name: string
  price: number
  quantity: number
  expertId: string
  expertUsername: string
  imageUrl?: string
  slug: string
}

export type Cart = {
  items: CartItem[]
}

type CartStore = {
  cart: Cart
  isLoaded: boolean

  // Actions
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void

  // Computed values
  totalItems: number
  totalPrice: number

  // Internal actions
  setLoaded: (loaded: boolean) => void
  computeTotals: () => void
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      cart: {items: []},
      isLoaded: false,
      totalItems: 0,
      totalPrice: 0,

      setLoaded: (loaded) => set({isLoaded: loaded}),

      computeTotals: () => {
        const {cart} = get()
        const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0)
        const totalPrice = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
        set({totalItems, totalPrice})
      },

      addItem: (item) => {
        set((state) => {
          const existingIndex = state.cart.items.findIndex((i) => i.productId === item.productId)

          let newItems: CartItem[]
          if (existingIndex >= 0) {
            // Update quantity if item already exists
            newItems = [...state.cart.items]
            newItems[existingIndex] = {
              ...newItems[existingIndex],
              quantity: newItems[existingIndex].quantity + 1,
            }
          } else {
            // Add new item
            newItems = [...state.cart.items, {...item, quantity: 1}]
          }

          const newCart = {...state.cart, items: newItems}
          const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0)
          const totalPrice = newItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

          console.log('Cart updated:', {totalItems, itemsCount: newItems.length})

          return {
            cart: newCart,
            totalItems,
            totalPrice,
          }
        })
      },

      removeItem: (productId) => {
        set((state) => {
          const newItems = state.cart.items.filter((item) => item.productId !== productId)
          const newCart = {...state.cart, items: newItems}
          const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0)
          const totalPrice = newItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

          return {
            cart: newCart,
            totalItems,
            totalPrice,
          }
        })
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId)
          return
        }

        set((state) => {
          const newItems = state.cart.items.map((item) => (item.productId === productId ? {...item, quantity} : item))
          const newCart = {...state.cart, items: newItems}
          const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0)
          const totalPrice = newItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

          return {
            cart: newCart,
            totalItems,
            totalPrice,
          }
        })
      },

      clearCart: () => {
        set({
          cart: {items: []},
          totalItems: 0,
          totalPrice: 0,
        })
      },
    }),
    {
      name: 'pickmy-cart',
      onRehydrateStorage: () => (state) => {
        // После загрузки из localStorage пересчитываем totals
        if (state) {
          state.computeTotals()
          state.setLoaded(true)
        }
      },
    },
  ),
)
