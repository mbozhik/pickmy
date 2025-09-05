'use client'

import type {Id} from '@convex/_generated/dataModel'
import type {TableData, TableTabs} from '~~/dashboard/AdminPanel'

import {useState, useEffect} from 'react'
import {zodResolver} from '@hookform/resolvers/zod'
import {useForm} from 'react-hook-form'
import {z} from 'zod'
import {toast} from 'sonner'
import {useMutation, useQuery} from 'convex/react'
import {api} from '@convex/_generated/api'

import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter} from '~/Core/dialog'
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from '~/Core/form'
import {Input} from '~/Core/input'
import {Textarea} from '~/Core/textarea'
import {Button} from '~/Core/button'
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '~/Core/select'
import {Checkbox} from '~/Core/checkbox'
import {Badge} from '~/Core/badge'

export type ModalMode = 'create' | 'edit' | 'view'

// Схемы валидации для каждой сущности
const userSchema = z.object({
  email: z.email('Некорректный email'),
  role: z.enum(['user', 'expert', 'admin'], {message: 'Выберите роль'}),
})

const productSchema = z.object({
  name: z.string().min(1, 'Название обязательно'),
  caption: z.string().min(1, 'Описание обязательно'),
  slug: z.string().min(1, 'Slug обязателен'),
  category: z.string().min(1, 'Выберите категорию'),
  expert: z.string().min(1, 'Выберите эксперта'),
  featured: z.boolean().default(false),
})

const categorySchema = z.object({
  name: z.string().min(1, 'Название обязательно'),
  description: z.string().min(1, 'Описание обязательно'),
  slug: z.string().min(1, 'Slug обязателен'),
})

const expertSchema = z.object({
  name: z.string().min(1, 'Имя обязательно'),
  role: z.string().min(1, 'Роль обязательна'),
  username: z.string().min(1, 'Username обязателен'),
  link: z.string().url('Некорректная ссылка').min(1, 'Ссылка обязательна'),
  userId: z.string().min(1, 'Выберите пользователя'),
  featured: z.boolean().default(false),
  isActive: z.boolean().default(true),
})

// Типы для form values
type UserFormValues = z.infer<typeof userSchema>
type ProductFormValues = z.infer<typeof productSchema>
type CategoryFormValues = z.infer<typeof categorySchema>
type ExpertFormValues = z.infer<typeof expertSchema>

type FormValues = UserFormValues | ProductFormValues | CategoryFormValues | ExpertFormValues

interface EntityModalProps {
  isOpen: boolean
  onClose: () => void
  entityType: TableTabs
  mode: ModalMode
  data?: TableData
  onSuccess?: () => void
}

export default function EntityModal({isOpen, onClose, entityType, mode, data, onSuccess}: EntityModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  // Загружаем данные для select'ов
  const categories = useQuery(api.tables.categories.getCategories, entityType === 'products' ? {} : 'skip')
  const experts = useQuery(api.tables.experts.getAllExperts, entityType === 'products' ? {} : 'skip')
  const users = useQuery(api.tables.users.getAllUsers, entityType === 'experts' ? {} : 'skip')

  // Мутации для создания и обновления
  const createProduct = useMutation(api.tables.products.createProduct)
  const updateProduct = useMutation(api.tables.products.updateProduct)
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
        return expertSchema
    }
  }

  const getDefaultValues = () => {
    const defaults = {
      users: {email: '', role: 'user' as const},
      products: {name: '', caption: '', slug: '', category: '', expert: '', featured: false},
      categories: {name: '', description: '', slug: ''},
      experts: {name: '', role: '', username: '', link: '', userId: '', featured: false, isActive: true},
    }

    if (data && data._id && mode !== 'create') {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const {_id, _creationTime, ...editableData} = data
      return {...defaults[entityType], ...editableData}
    }

    return defaults[entityType]
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const form = useForm<any>({
    resolver: zodResolver(getSchema()),
    defaultValues: getDefaultValues(),
  })

  // Сброс формы при смене данных
  useEffect(() => {
    const defaultValues = getDefaultValues()
    form.reset(defaultValues)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, mode, entityType])

  const handleSubmit = async (values: FormValues) => {
    setIsLoading(true)
    try {
      if (mode === 'create') {
        switch (entityType) {
          case 'products': {
            const productValues = values as ProductFormValues
            await createProduct({
              name: productValues.name,
              caption: productValues.caption,
              slug: productValues.slug,
              category: productValues.category as Id<'categories'>,
              expert: productValues.expert as Id<'experts'>,
              featured: productValues.featured,
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
            await updateProduct({
              id: data._id as Id<'products'>,
              name: productValues.name,
              caption: productValues.caption,
              slug: productValues.slug,
              category: productValues.category as Id<'categories'>,
              expert: productValues.expert as Id<'experts'>,
              featured: productValues.featured,
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
      onClose()
    } catch (error) {
      console.error('Error saving entity:', error)
      toast.error('Произошла ошибка при сохранении')
    } finally {
      setIsLoading(false)
    }
  }

  const getTitle = () => {
    const titles = {
      users: {create: 'Создать пользователя', edit: 'Редактировать пользователя', view: 'Просмотр пользователя'},
      products: {create: 'Создать товар', edit: 'Редактировать товар', view: 'Просмотр товара'},
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
                    <Input placeholder="Название товара" disabled={isReadonly} {...field} />
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
                    <Textarea placeholder="Описание товара" disabled={isReadonly} {...field} />
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
        )
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
        </DialogHeader>

        {/* Показываем ID для режимов просмотра и редактирования */}
        {data?._id && mode !== 'create' && (
          <div className="mb-4">
            <span className="text-sm font-medium text-muted-foreground">ID: </span>
            <Badge variant="secondary" className="font-mono text-xs">
              {data._id.slice(-6)}
            </Badge>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {renderFields()}

            {mode !== 'view' && (
              <DialogFooter>
                <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                  Отмена
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Сохранение...' : mode === 'create' ? 'Создать' : 'Сохранить'}
                </Button>
              </DialogFooter>
            )}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

// Утилиты
function getEntityName(entityType: TableTabs): string {
  const names = {
    users: 'Пользователь',
    products: 'Товар',
    categories: 'Категория',
    experts: 'Эксперт',
  }
  return names[entityType]
}

function getEntityGender(entityType: TableTabs): string {
  const genders = {
    users: '',
    products: '',
    categories: 'а',
    experts: '',
  }
  return genders[entityType]
}
