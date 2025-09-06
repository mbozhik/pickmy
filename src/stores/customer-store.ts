import {create} from 'zustand'
import {persist} from 'zustand/middleware'

export type CustomerInfo = {
  name: string
  email: string
  contact: string
  address: string
  comment: string
}

type CustomerStore = {
  customerInfo: CustomerInfo | null

  setCustomerInfo: (info: CustomerInfo) => void
  updateCustomerInfo: (field: keyof CustomerInfo, value: string) => void
  clearCustomerInfo: () => void
}

export const useCustomerStore = create<CustomerStore>()(
  persist(
    (set) => ({
      customerInfo: null,

      setCustomerInfo: (info) => set({customerInfo: info}),

      updateCustomerInfo: (field, value) =>
        set((state) => ({
          customerInfo: state.customerInfo ? {...state.customerInfo, [field]: value} : {name: '', email: '', contact: '', address: '', comment: '', [field]: value},
        })),

      clearCustomerInfo: () => set({customerInfo: null}),
    }),
    {
      name: 'pickmy-customer-info',
    },
  ),
)
