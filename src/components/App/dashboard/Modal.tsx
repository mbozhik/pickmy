'use client'

import type {Id} from '@convex/_generated/dataModel'
import type {AdminTableData, AdminTableTabs} from '~~/dashboard/AdminPanel'
import {api} from '@convex/_generated/api'

import {useState, useEffect} from 'react'
import {zodResolver} from '@hookform/resolvers/zod'
import {useForm} from 'react-hook-form'
import {z} from 'zod'
import {toast} from 'sonner'
import {useMutation, useQuery} from 'convex/react'
import Image from 'next/image'

import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter} from '~/core/dialog'
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from '~/core/form'
import {Input} from '~/core/input'
import {Textarea} from '~/core/textarea'
import {Button} from '~/core/button'
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '~/core/select'
import {Checkbox} from '~/core/checkbox'
import {Badge} from '~/core/badge'

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
  category: z.string().min(1, 'Выберите категорию'),
  caption: z.string().min(1, 'Описание обязательно'),
  expert: z.string().min(1, 'Выберите эксперта'),
  slug: z.string().min(1, 'Токен обязателен'),
  featured: z.boolean().default(false),
  price: z.number().min(1, 'Цена обязательна'),
  image: z
    .any()
    .optional()
    .refine((file) => !file || file.size <= MAX_FILE_SIZE, `Максимальный размер файла 500KB.`)
    .refine((file) => !file || ACCEPTED_IMAGE_TYPES.includes(file?.type), 'Поддерживаются только форматы .jpg, .jpeg, .png и .webp.'),
})

const categorySchema = z.object({
  name: z.string().min(1, 'Название обязательно'),
  description: z.string().min(1, 'Описание обязательно'),
  slug: z.string().min(1, 'Токен обязателен'),
})

const expertSchema = z.object({
  name: z.string().min(1, 'Имя обязательно'),
  role: z.string().min(1, 'Роль обязательна'),
  username: z.string().min(1, 'Токен обязателен'),
  link: z.url('Некорректная ссылка').min(1, 'Ссылка обязательна'),
  userId: z.string().min(1, 'Выберите пользователя'),
  featured: z.boolean().default(false),
  isActive: z.boolean().default(true),
})

const expertSelfEditSchema = z.object({
  name: z.string().min(1, 'Имя обязательно'),
  role: z.string().min(1, 'Роль обязательна'),
  username: z.string().min(1, 'Токен обязателен'),
  link: z.url('Некорректная ссылка').min(1, 'Ссылка обязательна'),
})

type UserFormValues = z.infer<typeof userSchema>
type ProductFormValues = z.infer<typeof productSchema>
type CategoryFormValues = z.infer<typeof categorySchema>
type ExpertFormValues = z.infer<typeof expertSchema>

type FormValues = UserFormValues | ProductFormValues | CategoryFormValues | ExpertFormValues

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  entityType: AdminTableTabs
  mode: ModalMode
  data?: AdminTableData
  onSuccess?: () => void
  isExpertMode?: boolean // flag for expert panel (limited set of fields)
  currentExpertId?: string // for expert mode - auto-select current expert
}

export default function Modal({isOpen, onClose, entityType, mode, data, onSuccess, isExpertMode = false, currentExpertId}: ModalProps) {
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

  const getSchema = () => {
    switch (entityType) {
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
      users: {email: '', role: 'user' as const},
      products: {
        name: '',
        category: '',
        caption: '',
        expert: isExpertMode && currentExpertId ? currentExpertId : '',
        slug: '',
        featured: false,
        price: 0,
        image: undefined,
      },
      categories: {name: '', description: '', slug: ''},
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
              category: productValues.category as Id<'categories'>,
              caption: productValues.caption,
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
              category: productValues.category as Id<'categories'>,
              caption: productValues.caption,
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
                    <Input placeholder="Название продукта" disabled={isReadonly} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="caption"
              render={({field}) => (
                <FormItem>
                  <FormLabel>Описание</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Описание продукта" disabled={isReadonly} {...field} />
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
                  <FormLabel>Slug</FormLabel>
                  <FormControl>
                    <Input placeholder="product-slug" disabled={isReadonly} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({field}) => (
                <FormItem>
                  <FormLabel>Категория</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isReadonly}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите категорию" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories?.map((cat) => (
                        <SelectItem key={cat._id} value={cat._id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                  <FormLabel>Цена (₽)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="0" disabled={isReadonly} {...field} onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} />
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
                    <Input placeholder="Название категории" disabled={isReadonly} {...field} />
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
                  <FormLabel>Slug</FormLabel>
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
                    <Input placeholder="Имя эксперта" disabled={isReadonly} {...field} />
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
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="username" disabled={isReadonly} {...field} />
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
          {/* We show ID for view and edit modes */}
          {data?._id && mode !== 'create' && (
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
    users: 'Пользователь',
    products: 'Продукт',
    categories: 'Категория',
    experts: 'Эксперт',
  }
  return names[entityType]
}

function getEntityGender(entityType: AdminTableTabs): string {
  const genders = {
    users: '',
    products: '',
    categories: 'а',
    experts: '',
  }
  return genders[entityType]
}
