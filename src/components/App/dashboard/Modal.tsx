'use client'

import type {Id, Doc as Table} from '@convex/_generated/dataModel'
import type {AdminTableData, AdminTableTabs} from '~~/dashboard/AdminPanel'

import {api} from '@convex/_generated/api'
import {useMutation, useQuery} from 'convex/react'

import {generateSlug} from '@/utils/slug'

import {useState, useEffect} from 'react'
import {useForm} from 'react-hook-form'
import {zodResolver} from '@hookform/resolvers/zod'
import {z} from 'zod'
import {toast} from 'sonner'

import Image from 'next/image'
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter} from '~/core/dialog'
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from '~/core/form'
import {Input} from '~/core/input'
import {Textarea} from '~/core/textarea'
import {Button} from '~/core/button'
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '~/core/select'
import {Checkbox} from '~/core/checkbox'
import {Badge} from '~/core/badge'
import MultipleSelector, {type Option} from '~/Module/MultipleSelector'

export type ModalMode = 'create' | 'edit' | 'view'

const userSchema = z.object({
  email: z.email('Некорректный email'),
  role: z.enum(['user', 'expert', 'admin'], {message: 'Выберите роль'}),
})

// File validation constants
const MAX_FILE_SIZE = 500 * 1024 // 500KB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

const productSchema = z.object({
  name: z.string().min(1, 'Название обязательно'),
  category: z.array(z.string()).min(1, 'Выберите как минимум одну категорию'),
  caption: z.string().min(1, 'Краткое описание обязательно'),
  description: z.string().min(1, 'Описание обязательно'),
  link: z.url('Некорректная ссылка').min(1, 'Ссылка обязательна'),
  expert: z.string().min(1, 'Выберите эксперта'),
  slug: z.string().min(1, 'Токен обязателен'),
  featured: z.boolean().default(false),
  price: z.number().min(0.01, 'Цена должна быть больше 0'),
  image: z
    .any()
    .optional()
    .refine((file) => {
      // If it's a File object, validate size
      if (file instanceof File) {
        return file.size <= MAX_FILE_SIZE
      }
      // If it's a string (existing image ID), it's valid
      if (typeof file === 'string') {
        return true
      }
      // If it's undefined/null, it's valid (optional)
      return true
    }, `Максимальный размер файла 500KB.`)
    .refine((file) => {
      // If it's a File object, validate type
      if (file instanceof File) {
        return ACCEPTED_IMAGE_TYPES.includes(file.type)
      }
      // If it's a string (existing image ID) or undefined, it's valid
      return true
    }, 'Поддерживаются только форматы .jpg, .jpeg, .png и .webp.'),
})

const categorySchema = z.object({
  name: z.string().min(1, 'Название обязательно'),
  description: z.string().min(1, 'Описание обязательно').optional(),
  slug: z.string().min(1, 'Токен обязателен'),
})

const expertSchema = z.object({
  name: z.string().min(1, 'Имя обязательно'),
  role: z.string().min(1, 'Роль обязательна'),
  username: z.string().min(1, 'Токен обязателен'),
  link: z.string().optional(),
  userId: z.string().min(1, 'Выберите пользователя'),
  featured: z.boolean().default(false),
  isActive: z.boolean().default(true),
})

const expertSelfEditSchema = z.object({
  name: z.string().min(1, 'Имя обязательно'),
  role: z.string().min(1, 'Роль обязательна'),
  username: z.string().min(1, 'Токен обязателен'),
  link: z.string().optional(),
})

const orderSchema = z.object({
  orderToken: z.string().min(1, 'Токен заказа обязателен'),
  status: z.enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']),
  paymentStatus: z.enum(['pending', 'paid', 'failed', 'refunded']),
  notes: z.string().optional(),
})

type UserFormValues = z.infer<typeof userSchema>
type ProductFormValues = z.infer<typeof productSchema>
type CategoryFormValues = z.infer<typeof categorySchema>
type ExpertFormValues = z.infer<typeof expertSchema>
type OrderFormValues = z.infer<typeof orderSchema>

type FormValues = UserFormValues | ProductFormValues | CategoryFormValues | ExpertFormValues | OrderFormValues

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  entityType: AdminTableTabs
  mode: ModalMode
  data?: AdminTableData
  onSuccess?: () => void
  isExpertMode?: boolean // flag for expert panel (limited set of fields)
  currentExpertId?: string // for expert mode - auto-select current expert
  isUserMode?: boolean // flag for user panel (simplified view)
}

export default function Modal({isOpen, onClose, entityType, mode, data, onSuccess, isExpertMode = false, currentExpertId, isUserMode = false}: ModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  // data for selects
  const categories = useQuery(api.tables.categories.getCategories, entityType === 'products' ? {} : 'skip')
  const experts = useQuery(api.tables.experts.getAllExperts, entityType === 'products' ? {} : 'skip')
  const users = useQuery(api.tables.users.getAllUsers, entityType === 'experts' ? {} : 'skip')

  const createProduct = useMutation(api.tables.products.createProduct)
  const updateProduct = useMutation(api.tables.products.updateProduct)
  const generateUploadUrl = useMutation(api.tables.products.generateUploadUrl)
  const createCategory = useMutation(api.tables.categories.createCategory)
  const updateCategory = useMutation(api.tables.categories.updateCategory)
  const createExpert = useMutation(api.tables.experts.createExpert)
  const updateExpert = useMutation(api.tables.experts.updateExpert)
  const updateUser = useMutation(api.tables.users.updateUser)
  const updateOrderStatus = useMutation(api.tables.orders.updateOrderStatus)

  const getSchema = () => {
    switch (entityType) {
      case 'orders':
        return orderSchema
      case 'users':
        return userSchema
      case 'products':
        return productSchema
      case 'categories':
        return categorySchema
      case 'experts':
        return isExpertMode ? expertSelfEditSchema : expertSchema
    }
  }

  const getDefaultValues = () => {
    const defaults = {
      orders: {orderToken: '', status: 'pending' as const, paymentStatus: 'pending' as const, notes: ''},
      users: {email: '', role: 'user' as const},
      products: {
        name: '',
        category: [],
        caption: '',
        description: '',
        link: '',
        expert: isExpertMode && currentExpertId ? currentExpertId : '',
        slug: '',
        featured: false,
        price: 0,
        image: undefined,
      },
      categories: {name: '', description: undefined, slug: ''},
      experts: isExpertMode ? {name: '', role: '', username: '', link: ''} : {name: '', role: '', username: '', link: '', userId: '', featured: false, isActive: true},
    }

    if (data && data._id && mode !== 'create') {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const {_id, _creationTime, ...editableData} = data

      // In expert mode we exclude system fields
      if (isExpertMode && entityType === 'experts') {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const {userId, featured, isActive, ...expertSafeData} = editableData as Record<string, unknown>
        return {...defaults[entityType], ...expertSafeData}
      }

      // For products in expert mode, ensure expert is set to current expert
      if (isExpertMode && entityType === 'products' && currentExpertId) {
        return {...defaults[entityType], ...editableData, expert: currentExpertId, featured: false}
      }

      // For products, ensure image field is properly set
      if (entityType === 'products') {
        const productData = editableData as Record<string, unknown>
        return {
          ...defaults[entityType],
          ...editableData,
          image: productData.image || undefined, // Keep existing image ID or undefined
        }
      }

      return {...defaults[entityType], ...editableData}
    }

    return defaults[entityType]
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const form = useForm<any>({
    resolver: zodResolver(getSchema()),
    defaultValues: getDefaultValues(),
  })

  // Reset form on data change
  useEffect(() => {
    const defaultValues = getDefaultValues()
    form.reset(defaultValues)
    // Reset image state
    setSelectedImage(null)
    setImagePreview(null)

    // Show existing image if viewing or editing product
    if ((mode === 'edit' || mode === 'view') && entityType === 'products' && data && (data as Record<string, unknown>).imageUrl) {
      setImagePreview((data as Record<string, unknown>).imageUrl as string)
    }

    // Add debug logging to see what data we receive
    if (entityType === 'products' && data) {
      console.log('Modal product data:', data)
      console.log('Image URL:', (data as Record<string, unknown>).imageUrl)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, mode, entityType])

  const uploadImage = async (): Promise<string | undefined> => {
    if (!selectedImage) return undefined

    try {
      // Get upload URL
      const uploadUrl = await generateUploadUrl()

      // Upload file
      const result = await fetch(uploadUrl, {
        method: 'POST',
        headers: {'Content-Type': selectedImage.type},
        body: selectedImage,
      })

      if (!result.ok) {
        throw new Error('File upload error')
      }

      const {storageId} = await result.json()
      return storageId
    } catch (error) {
      console.error('Image upload error:', error)
      toast.error('Ошибка загрузки изображения')
      return undefined
    }
  }

  const handleSubmit = async (values: FormValues) => {
    setIsLoading(true)
    try {
      if (mode === 'create') {
        switch (entityType) {
          case 'products': {
            const productValues = values as ProductFormValues

            // Upload image if selected
            const imageId = await uploadImage()

            await createProduct({
              name: productValues.name,
              category: productValues.category as Id<'categories'>[],
              caption: productValues.caption,
              description: productValues.description,
              link: productValues.link,
              expert: (isExpertMode && currentExpertId ? currentExpertId : productValues.expert) as Id<'experts'>,
              slug: productValues.slug,
              featured: isExpertMode ? false : productValues.featured,
              price: productValues.price,
              image: imageId as Id<'_storage'> | undefined,
            })
            break
          }
          case 'categories': {
            const categoryValues = values as CategoryFormValues
            await createCategory({
              name: categoryValues.name,
              description: categoryValues.description,
              slug: categoryValues.slug,
            })
            break
          }
          case 'experts': {
            const expertValues = values as ExpertFormValues
            await createExpert({
              name: expertValues.name,
              role: expertValues.role,
              username: expertValues.username,
              link: expertValues.link,
              userId: expertValues.userId as Id<'users'>,
              featured: expertValues.featured,
              isActive: expertValues.isActive,
            })
            break
          }
          case 'users':
            toast.error('Создание пользователей доступно только через Clerk')
            return
          case 'orders':
            toast.error('Заказы создаются только через корзину')
            return
        }
        toast.success(`${getEntityName(entityType)} успешно создан${getEntityGender(entityType)}`)
      } else if (mode === 'edit' && data?._id) {
        switch (entityType) {
          case 'products': {
            const productValues = values as ProductFormValues

            // Upload new image if selected, otherwise keep the old one
            const imageId = selectedImage ? await uploadImage() : (data as Record<string, unknown>)?.image

            await updateProduct({
              id: data._id as Id<'products'>,
              name: productValues.name,
              category: productValues.category as Id<'categories'>[],
              caption: productValues.caption,
              description: productValues.description,
              link: productValues.link,
              expert: (isExpertMode && currentExpertId ? currentExpertId : productValues.expert) as Id<'experts'>,
              slug: productValues.slug,
              featured: isExpertMode ? false : productValues.featured,
              price: productValues.price,
              image: imageId as Id<'_storage'> | undefined,
            })
            break
          }
          case 'categories': {
            const categoryValues = values as CategoryFormValues
            await updateCategory({
              id: data._id as Id<'categories'>,
              name: categoryValues.name,
              description: categoryValues.description,
              slug: categoryValues.slug,
            })
            break
          }
          case 'experts': {
            const expertValues = values as ExpertFormValues

            if (isExpertMode) {
              // In expert mode we save only basic fields
              const expertData = data as Record<string, unknown>
              await updateExpert({
                id: data._id as Id<'experts'>,
                name: expertValues.name,
                role: expertValues.role,
                username: expertValues.username,
                link: expertValues.link,
                // System fields are taken from existing data
                userId: expertData.userId as Id<'users'>,
                featured: expertData.featured as boolean,
                isActive: expertData.isActive as boolean,
              })
            } else {
              // In admin mode we save all fields
              await updateExpert({
                id: data._id as Id<'experts'>,
                name: expertValues.name,
                role: expertValues.role,
                username: expertValues.username,
                link: expertValues.link,
                userId: expertValues.userId as Id<'users'>,
                featured: expertValues.featured,
                isActive: expertValues.isActive,
              })
            }
            break
          }
          case 'users': {
            const userValues = values as UserFormValues
            await updateUser({
              id: data._id as Id<'users'>,
              email: userValues.email,
              role: userValues.role,
            })
            break
          }
          case 'orders': {
            const orderValues = values as OrderFormValues
            await updateOrderStatus({
              orderId: data._id as Id<'orders'>,
              status: orderValues.status,
              paymentStatus: orderValues.paymentStatus,
              notes: orderValues.notes,
            })
            break
          }
        }
        toast.success(`${getEntityName(entityType)} успешно обновлен${getEntityGender(entityType)}`)
      }

      onSuccess?.()
      // Reset image state
      setSelectedImage(null)
      setImagePreview(null)
      onClose()
    } catch (error) {
      console.error('Error saving entity:', error)
      toast.error('Произошла ошибка при сохранении')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setSelectedImage(null)
    setImagePreview(null)
    onClose()
  }

  const getTitle = () => {
    const titles = {
      orders: {create: 'Создать заказ', edit: 'Редактировать заказ', view: 'Просмотр заказа'},
      users: {create: 'Создать пользователя', edit: 'Редактировать пользователя', view: 'Просмотр пользователя'},
      products: {create: 'Создать продукт', edit: 'Редактировать продукт', view: 'Просмотр продукта'},
      categories: {create: 'Создать категорию', edit: 'Редактировать категорию', view: 'Просмотр категории'},
      experts: {create: 'Создать эксперта', edit: 'Редактировать эксперта', view: 'Просмотр эксперта'},
    }
    return titles[entityType][mode]
  }

  const renderFields = () => {
    const isReadonly = mode === 'view'

    switch (entityType) {
      case 'orders':
        return (
          <>
            <FormField
              control={form.control}
              name="orderToken"
              render={({field}) => (
                <FormItem>
                  <FormLabel>Токен заказа</FormLabel>
                  <FormControl>
                    <Input disabled={true} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {isUserMode && mode === 'view' && data ? (
              // Упрощенное отображение статусов для пользователей
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-neutral-600">Статус заказа</label>
                  <div className="mt-1">
                    <Badge variant="secondary">
                      {(data as Table<'orders'>).status === 'pending' && 'Ожидает'}
                      {(data as Table<'orders'>).status === 'confirmed' && 'Подтверждён'}
                      {(data as Table<'orders'>).status === 'processing' && 'Обрабатывается'}
                      {(data as Table<'orders'>).status === 'shipped' && 'Отправлен'}
                      {(data as Table<'orders'>).status === 'delivered' && 'Доставлен'}
                      {(data as Table<'orders'>).status === 'cancelled' && 'Отменён'}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-600">Статус оплаты</label>
                  <div className="mt-1">
                    <Badge variant="secondary">
                      {(data as Table<'orders'>).paymentStatus === 'pending' && 'Ожидает оплаты'}
                      {(data as Table<'orders'>).paymentStatus === 'paid' && 'Оплачен'}
                      {(data as Table<'orders'>).paymentStatus === 'failed' && 'Ошибка'}
                      {(data as Table<'orders'>).paymentStatus === 'refunded' && 'Возврат'}
                    </Badge>
                  </div>
                </div>
              </div>
            ) : (
              // Полные селекты для админов
              <>
                <FormField
                  control={form.control}
                  name="status"
                  render={({field}) => (
                    <FormItem>
                      <FormLabel>Статус заказа</FormLabel>
                      <Select disabled={isReadonly} onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Выберите статус" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="pending">Ожидает</SelectItem>
                          <SelectItem value="confirmed">Подтверждён</SelectItem>
                          <SelectItem value="processing">Обрабатывается</SelectItem>
                          <SelectItem value="shipped">Отправлен</SelectItem>
                          <SelectItem value="delivered">Доставлен</SelectItem>
                          <SelectItem value="cancelled">Отменён</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="paymentStatus"
                  render={({field}) => (
                    <FormItem>
                      <FormLabel>Статус оплаты</FormLabel>
                      <Select disabled={isReadonly} onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Выберите статус оплаты" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="pending">Ожидает оплаты</SelectItem>
                          <SelectItem value="paid">Оплачен</SelectItem>
                          <SelectItem value="failed">Ошибка</SelectItem>
                          <SelectItem value="refunded">Возврат</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
            {mode === 'view' && data && isUserMode && <div className="text-sm text-neutral-600">Заказ создан: {new Date(data._creationTime).toLocaleDateString('ru-RU')}</div>}
            {!isUserMode && (
              <FormField
                control={form.control}
                name="notes"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Заметки</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Заметки по заказу..." disabled={isReadonly} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            {mode === 'view' && data && !isUserMode && (
              <div className="space-y-4 border-t border-neutral-200 pt-6 mt-6">
                <h4 className="font-medium text-sm text-neutral-700">Системная информация</h4>
                <div className="grid grid-cols-1 gap-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-600">ID пользователя:</span>
                    <Badge variant="secondary" className="font-mono text-xs">
                      {(data as Table<'orders'>).userId.slice(-6)}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-600">Заказ создан:</span>
                    <span className="text-neutral-800">{new Date(data._creationTime).toLocaleString('ru-RU')}</span>
                  </div>
                </div>
              </div>
            )}
            {mode === 'view' && data && (data as Table<'orders'>).customerInfo && (
              <div className="space-y-4 border-t border-neutral-200 pt-6">
                <h4 className="font-medium text-sm text-neutral-700">Информация о заказчике</h4>
                <div className="grid grid-cols-1 gap-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-600">Имя:</span>
                    <span className="text-neutral-800 font-medium">{(data as Table<'orders'>).customerInfo.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-600">Email:</span>
                    <span className="text-neutral-800">{(data as Table<'orders'>).customerInfo.email}</span>
                  </div>
                  {(data as Table<'orders'>).customerInfo.contact && (
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-600">Контакт:</span>
                      <span className="text-neutral-800">{(data as Table<'orders'>).customerInfo.contact}</span>
                    </div>
                  )}
                  {(data as Table<'orders'>).customerInfo.address && (
                    <div className="flex items-start justify-between">
                      <span className="text-neutral-600 flex-shrink-0">Адрес:</span>
                      <span className="text-neutral-800 text-right max-w-[200px]">{(data as Table<'orders'>).customerInfo.address}</span>
                    </div>
                  )}
                  {(data as Table<'orders'>).customerInfo.comment && (
                    <div className="flex items-start justify-between">
                      <span className="text-neutral-600 flex-shrink-0">Комментарий:</span>
                      <span className="text-neutral-800 text-right max-w-[200px]">{(data as Table<'orders'>).customerInfo.comment}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
            {mode === 'view' && data && (data as Table<'orders'>).items && (
              <div className="space-y-4 border-t border-neutral-200 pt-6">
                <h4 className="font-medium text-sm text-neutral-700">Товары в заказе</h4>
                <div className="space-y-3">
                  {(data as Table<'orders'>).items.map((item, index: number) => (
                    <div key={index} className="bg-neutral-50 border border-neutral-200 p-4 rounded-lg">
                      <div className="flex items-start gap-3">
                        {item.imageUrl && (
                          <div className="w-14 h-14 bg-neutral-200 rounded-lg overflow-hidden flex-shrink-0">
                            <Image src={item.imageUrl} alt={item.name} width={56} height={56} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm text-neutral-800 mb-1">{item.name}</div>
                          <div className="text-xs text-neutral-600 mb-1">
                            Эксперт: <span className="text-neutral-700">{item.expertUsername}</span>
                          </div>
                          <div className="text-xs text-neutral-600">
                            <span className="text-neutral-700">${item.price.toFixed(2)}</span> × <span className="text-neutral-700">{item.quantity}</span> = <span className="font-medium text-neutral-800">${(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {mode === 'view' && data && (data as Table<'orders'>).pricing && (
              <div className="space-y-4 border-t border-neutral-200 pt-6">
                <h4 className="font-medium text-sm text-neutral-700">Стоимость</h4>
                <div className="space-y-3 text-sm">
                  {isUserMode ? (
                    // Упрощенная версия для пользователей - только итоговая стоимость
                    <div className="flex justify-between items-center font-medium">
                      <span className="text-neutral-700">Итого к оплате:</span>
                      <span className="text-neutral-900 font-semibold text-lg">${(data as Table<'orders'>).pricing.finalPrice}</span>
                    </div>
                  ) : (
                    // Полная версия для админов
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-neutral-600">Сумма товаров:</span>
                        <span className="text-neutral-800">${(data as Table<'orders'>).pricing.basePrice}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-neutral-600">Комиссия экспертов:</span>
                        <span className="text-neutral-800">${(data as Table<'orders'>).pricing.expertCommission}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-neutral-600">Доставка:</span>
                        <span className="text-neutral-800">${(data as Table<'orders'>).pricing.deliveryFee}</span>
                      </div>
                      <div className="flex justify-between items-center font-medium border-t border-neutral-200 pt-3">
                        <span className="text-neutral-700">Итого:</span>
                        <span className="text-neutral-900 font-semibold">${(data as Table<'orders'>).pricing.finalPrice}</span>
                      </div>

                      {/* Детализация комиссий экспертов */}
                      {Object.keys((data as Table<'orders'>).pricing.expertCommissions).length > 0 && (
                        <details className="mt-4 bg-neutral-50 border border-neutral-200 rounded-lg p-3">
                          <summary className="cursor-pointer text-xs text-neutral-600 hover:text-neutral-800 font-medium">Детализация комиссий экспертов</summary>
                          <div className="mt-3 space-y-2">
                            {Object.entries((data as Table<'orders'>).pricing.expertCommissions).map(([expert, commission]) => (
                              <div key={expert} className="flex justify-between text-xs">
                                <span className="text-neutral-600">{expert}:</span>
                                <span className="text-neutral-800">${commission}</span>
                              </div>
                            ))}
                          </div>
                        </details>
                      )}

                      <div className="text-xs text-neutral-500 mt-4 pt-3 border-t border-neutral-200">Рассчитано: {new Date((data as Table<'orders'>).pricing.calculatedAt).toLocaleString('ru-RU')}</div>
                    </>
                  )}
                </div>
              </div>
            )}
          </>
        )
      case 'users':
        return (
          <>
            <FormField
              control={form.control}
              name="email"
              render={({field}) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="user@example.com" disabled={isReadonly} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({field}) => (
                <FormItem>
                  <FormLabel>Роль</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isReadonly}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите роль" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="user">Пользователь</SelectItem>
                      <SelectItem value="expert">Эксперт</SelectItem>
                      <SelectItem value="admin">Администратор</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )

      case 'products':
        return (
          <>
            <FormField
              control={form.control}
              name="name"
              render={({field}) => (
                <FormItem>
                  <FormLabel>Название</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Название продукта"
                      disabled={isReadonly}
                      {...field}
                      onChange={(e) => {
                        field.onChange(e)
                        if (e.target.value) {
                          form.setValue('slug', generateSlug(e.target.value))
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({field}) => {
                const opts: Option[] = (categories || []).map((cat) => ({value: cat._id, label: cat.name}))
                const selected: Option[] = Array.isArray(field.value) ? field.value.map((id) => opts.find((o) => o.value === id) ?? {value: id, label: id}) : []

                return (
                  <FormItem>
                    <FormLabel>Категория</FormLabel>
                    <FormControl>
                      <MultipleSelector value={selected} options={opts} onChange={(newVals: Option[]) => field.onChange(newVals.map((v) => v.value))} disabled={isReadonly} className="w-full" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )
              }}
            />
            <FormField
              control={form.control}
              name="caption"
              render={({field}) => (
                <FormItem>
                  <FormLabel>Краткое описание</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Краткое описание продукта" disabled={isReadonly} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({field}) => (
                <FormItem>
                  <FormLabel>Описание</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={`Описание продукта

Пример:
# Заголовок
## Текст для блока
`}
                      disabled={isReadonly}
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="link"
              render={({field}) => (
                <FormItem>
                  <FormLabel>Ссылка на источник</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com" disabled={isReadonly} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="slug"
              render={({field}) => (
                <FormItem>
                  <FormLabel>Токен</FormLabel>
                  <FormControl>
                    <Input placeholder="product-slug" disabled={isReadonly} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Expert selection - only for admin mode */}
            {!isExpertMode && (
              <FormField
                control={form.control}
                name="expert"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Эксперт</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isReadonly}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите эксперта" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {experts?.map((exp) => (
                          <SelectItem key={exp._id} value={exp._id}>
                            {exp.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="price"
              render={({field}) => (
                <FormItem>
                  <FormLabel>Цена ($)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      disabled={isReadonly}
                      {...field}
                      value={field.value || ''}
                      onChange={(e) => {
                        const value = e.target.value
                        if (value === '') {
                          field.onChange(0)
                        } else {
                          const numValue = parseFloat(value)
                          if (!isNaN(numValue)) {
                            field.onChange(numValue)
                          }
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Image field - always show, different behavior for edit/view */}
            <FormField
              control={form.control}
              name="image"
              render={({field, fieldState}) => (
                <FormItem>
                  <FormLabel>Изображение</FormLabel>
                  <FormControl>
                    <div className="relative group">
                      {!isReadonly && (
                        <input
                          type="file"
                          accept=".jpg,.jpeg,.png,.webp"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              field.onChange(file)
                              setSelectedImage(file)
                              // Create preview
                              const reader = new FileReader()
                              reader.onload = (e) => {
                                setImagePreview(e.target?.result as string)
                              }
                              reader.readAsDataURL(file)
                            }
                          }}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          id="image-upload"
                          title=""
                        />
                      )}
                      <div className={`relative min-h-[100px] border ${fieldState.error ? 'border-red-500' : 'border-neutral-500'} rounded-lg flex flex-col items-center justify-center ${!isReadonly ? 'group-hover:border-neutral-700 transition-colors duration-300 bg-background group-hover:bg-neutral-100' : 'bg-neutral-50'}`}>
                        {imagePreview ? (
                          <>
                            <div className="p-4">
                              <Image src={imagePreview} alt="Preview" width={300} height={300} className="w-auto h-40 object-contain rounded-lg" />
                            </div>
                            {!isReadonly && (
                              <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/40 transition-all duration-200 rounded-lg flex items-center justify-center">
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-foreground px-4 py-2 rounded-lg">
                                  <span className="text-sm font-medium tracking-tight text-background">Заменить файл</span>
                                </div>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="text-center py-6">
                            <div className="font-medium tracking-tight text-neutral-600">{isReadonly ? 'Изображение не загружено' : 'Выберите файл'}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Featured checkbox - only for admin mode */}
            {!isExpertMode && (
              <FormField
                control={form.control}
                name="featured"
                render={({field}) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} disabled={isReadonly} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="cursor-pointer">Рекомендуемый</FormLabel>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </>
        )

      case 'categories':
        return (
          <>
            <FormField
              control={form.control}
              name="name"
              render={({field}) => (
                <FormItem>
                  <FormLabel>Название</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Название категории"
                      disabled={isReadonly}
                      {...field}
                      onChange={(e) => {
                        field.onChange(e)
                        if (e.target.value) {
                          form.setValue('slug', generateSlug(e.target.value))
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({field}) => (
                <FormItem>
                  <FormLabel>Описание</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Описание категории" disabled={isReadonly} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="slug"
              render={({field}) => (
                <FormItem>
                  <FormLabel>Токен</FormLabel>
                  <FormControl>
                    <Input placeholder="category-slug" disabled={isReadonly} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )

      case 'experts':
        return (
          <>
            <FormField
              control={form.control}
              name="name"
              render={({field}) => (
                <FormItem>
                  <FormLabel>Имя</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Имя эксперта"
                      disabled={isReadonly}
                      {...field}
                      onChange={(e) => {
                        field.onChange(e)
                        if (e.target.value) {
                          form.setValue('username', generateSlug(e.target.value))
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({field}) => (
                <FormItem>
                  <FormLabel>Роль</FormLabel>
                  <FormControl>
                    <Input placeholder="Должность эксперта" disabled={isReadonly} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="username"
              render={({field}) => (
                <FormItem>
                  <FormLabel>Токен</FormLabel>
                  <FormControl>
                    <Input placeholder="Токен" disabled={isReadonly} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="link"
              render={({field}) => (
                <FormItem>
                  <FormLabel>Ссылка</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com" disabled={isReadonly} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!isExpertMode && (
              <>
                <FormField
                  control={form.control}
                  name="userId"
                  render={({field}) => (
                    <FormItem>
                      <FormLabel>Пользователь</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isReadonly}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Выберите пользователя" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {users?.map((user) => (
                            <SelectItem key={user._id} value={user._id}>
                              {user.email}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="featured"
                  render={({field}) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} disabled={isReadonly} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="cursor-pointer">Рекомендуемый</FormLabel>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({field}) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} disabled={isReadonly} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="cursor-pointer">Активный</FormLabel>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
          </>
        )
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md sm:max-w-[90vw] xl:max-h-[75vh] sm:max-h-[75vh] max-h-[80vh] overflow-hidden flex flex-col p-0">
        {/* Fixed Header */}
        <DialogHeader className="border-b border-neutral-200 xl:px-5 xl:py-3 sm:px-4 sm:py-3 px-6 py-4">
          <DialogTitle>{getTitle()}</DialogTitle>
        </DialogHeader>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto xl:px-5 xl:py-3 sm:px-4 sm:py-3 px-6 py-4">
          {/* We show ID for view and edit modes (except for user mode) */}
          {data?._id && mode !== 'create' && !isUserMode && (
            <div className="mb-4">
              <span className="text-sm font-medium text-neutral-600">ID: </span>
              <Badge variant="secondary" className="font-mono text-xs">
                {data._id.slice(-6)}
              </Badge>
            </div>
          )}

          <Form {...form}>
            <form id="modal-form" onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              {renderFields()}
            </form>
          </Form>
        </div>

        {/* Fixed Footer */}
        {mode !== 'view' && (
          <DialogFooter className="border-t border-neutral-200 xl:px-5 xl:py-3 sm:px-4 sm:py-3 px-6 py-4">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
              Отмена
            </Button>
            <Button type="submit" form="modal-form" disabled={isLoading}>
              {isLoading ? 'Сохранение...' : mode === 'create' ? 'Создать' : 'Сохранить'}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}

function getEntityName(entityType: AdminTableTabs): string {
  const names = {
    orders: 'Заказ',
    users: 'Пользователь',
    products: 'Продукт',
    categories: 'Категория',
    experts: 'Эксперт',
  }
  return names[entityType]
}

function getEntityGender(entityType: AdminTableTabs): string {
  const genders = {
    orders: '',
    users: '',
    products: '',
    categories: 'а',
    experts: '',
  }
  return genders[entityType]
}
