'use client'

import {Eye, Edit, Trash2, Plus, Check, X, Link as SourceLink} from 'lucide-react'

import type {AdminTableData, AdminTableTabs} from '~~/dashboard/AdminPanel'

import * as React from 'react'
import {ColumnDef, flexRender, getCoreRowModel, getSortedRowModel, SortingState, useReactTable} from '@tanstack/react-table'

import Link from 'next/link'
import {Button} from '~/core/button'
import {Badge} from '~/core/badge'
import {AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger} from '~/core/alert-dialog'
import {Table as TableElement, TableBody, TableCell, TableHead, TableHeader, TableRow} from '~/core/table'
import {Toggle} from '~/core/toggle'

const BADGE_COLORS = {
  // Статусы заказов
  orderStatus: {
    pending: {bg: 'bg-[#fef9c3]', text: 'text-[#854d0e]'}, // Ожидает - яркий жёлтый
    confirmed: {bg: 'bg-[#fff4e6]', text: 'text-[#ea580c]'}, // Подтверждён - мягкий оранжевый
    processing: {bg: 'bg-[#f3e8ff]', text: 'text-[#9333ea]'}, // Обрабатывается - фиолетовый
    shipped: {bg: 'bg-[#e0f2fe]', text: 'text-[#0369a1]'}, // Отправлен - голубой
    delivered: {bg: 'bg-[#dcfce7]', text: 'text-[#166534]'}, // Доставлен - зелёный
    cancelled: {bg: 'bg-[#fef2f2]', text: 'text-[#dc2626]'}, // Отменён - красный
  },
  // Статусы оплаты
  paymentStatus: {
    pending: {bg: 'bg-[#fef9c3]', text: 'text-[#854d0e]'}, // Ожидает - яркий жёлтый
    paid: {bg: 'bg-[#dcfce7]', text: 'text-[#166534]'}, // Оплачен - зелёный
    failed: {bg: 'bg-[#fef2f2]', text: 'text-[#dc2626]'}, // Ошибка - красный
    refunded: {bg: 'bg-[#f8fafc]', text: 'text-[#475569]'}, // Возврат - серый
  },
} as const

interface DataTableProps<T extends AdminTableData> {
  data: T[]
  entityType: AdminTableTabs
  onView: (item: T) => void
  onEdit: (item: T) => void
  onDelete: (id: string) => void
  onCreate: () => void
  isExpertMode?: boolean // flag for expert panel (limited columns)
  isUserMode?: boolean // flag for user panel (view only)
}

const truncateId = (id: string, maxLength: number = 10) => {
  return id.length > maxLength ? `${id.substring(0, maxLength)}..` : id
}

const createColumns = <T extends AdminTableData>(entityType: AdminTableTabs, onView: (item: T) => void, onEdit: (item: T) => void, onDelete: (id: string) => void, isExpertMode: boolean = false, isUserMode: boolean = false): ColumnDef<T>[] => {
  const baseColumns: ColumnDef<T>[] = []

  // if (!isUserMode) {
  //   baseColumns.push({
  //     accessorKey: '_id',
  //     header: 'ID',
  //     cell: ({row}) => (
  //       <Badge variant="secondary" className="font-mono text-xs">
  //         {truncateId(row.getValue('_id'))}
  //       </Badge>
  //     ),
  //   })
  // }

  switch (entityType) {
    case 'orders':
      baseColumns.push(
        {
          accessorKey: 'orderToken',
          header: 'Токен заказа',
          cell: ({row}) => (
            <Badge variant="secondary" className="font-mono text-xs">
              {truncateId(row.getValue('orderToken'), 8)}
            </Badge>
          ),
        },
        {
          accessorKey: 'customerInfo',
          header: 'Покупатель',
          cell: ({row}) => {
            const customerInfo = row.getValue('customerInfo') as {name: string; email: string}
            return <div>{customerInfo?.name || 'Не указано'}</div>
          },
        },
        {
          accessorKey: 'pricing',
          header: 'Сумма',
          cell: ({row}) => {
            const pricing = row.getValue('pricing') as {finalPrice: number}
            return <div>${pricing?.finalPrice || 0}</div>
          },
        },
        {
          accessorKey: 'status',
          header: 'Статус',
          cell: ({row}) => {
            const status = row.getValue('status') as string
            const statusLabels = {
              pending: 'Ожидает',
              confirmed: 'Подтверждён',
              processing: 'Обрабатывается',
              shipped: 'Отправлен',
              delivered: 'Доставлен',
              cancelled: 'Отменён',
            }
            const colors = BADGE_COLORS.orderStatus[status as keyof typeof BADGE_COLORS.orderStatus] || {bg: 'bg-[#f8fafc]', text: 'text-[#475569]'}
            return (
              <Badge variant="secondary" className={`text-xs font-normal ${colors.bg} ${colors.text}`}>
                {statusLabels[status as keyof typeof statusLabels] || status}
              </Badge>
            )
          },
        },
        {
          accessorKey: 'paymentStatus',
          header: 'Оплата',
          cell: ({row}) => {
            const paymentStatus = row.getValue('paymentStatus') as string
            const paymentLabels = {
              pending: 'Ожидает оплаты',
              paid: 'Оплачен',
              failed: 'Ошибка',
              refunded: 'Возврат',
            }
            const colors = BADGE_COLORS.paymentStatus[paymentStatus as keyof typeof BADGE_COLORS.paymentStatus] || {bg: 'bg-[#f8fafc]', text: 'text-[#475569]'}
            return (
              <Badge variant="secondary" className={`text-xs font-normal ${colors.bg} ${colors.text}`}>
                {paymentLabels[paymentStatus as keyof typeof paymentLabels] || paymentStatus}
              </Badge>
            )
          },
        },
        {
          accessorKey: '_creationTime',
          header: 'Создан',
          cell: ({row}) => {
            const creationTime = row.getValue('_creationTime') as number
            return (
              <div className="text-sm text-neutral-500">
                {isUserMode
                  ? // Для пользователей - только дата
                    new Date(creationTime).toLocaleDateString('ru-RU', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })
                  : // Для админов - дата и время
                    new Date(creationTime).toLocaleDateString('ru-RU', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
              </div>
            )
          },
        },
      )
      break

    case 'users':
      baseColumns.push(
        {
          accessorKey: 'email',
          header: 'Email',
          cell: ({row}) => <div>{row.getValue('email')}</div>,
        },
        {
          accessorKey: 'role',
          header: 'Роль',
          cell: ({row}) => {
            const role = row.getValue('role') as string
            const roleLabels = {
              user: 'Пользователь',
              expert: 'Эксперт',
              admin: 'Администратор',
            }
            return (
              <Badge variant="secondary" className="text-xs">
                {roleLabels[role as keyof typeof roleLabels]}
              </Badge>
            )
          },
        },
      )
      break

    case 'products':
      baseColumns.push(
        {
          accessorKey: 'name',
          header: 'Название',
          cell: ({row}) => <div>{row.getValue('name')}</div>,
        },
        {
          accessorKey: 'categoryName',
          header: 'Категория',
          cell: ({row}) => {
            const categoryName = row.getValue('categoryName') as string

            const originalCategory = (row.original as unknown as {category?: string | string[]}).category
            const extraCount = Array.isArray(originalCategory) && originalCategory.length > 1 ? originalCategory.length - 1 : 0
            return (
              <div className="flex items-center gap-1 text-neutral-500 text-xs tracking-tight">
                <Badge variant="secondary">{categoryName}</Badge>
                {extraCount > 0 && (
                  <Badge variant="outline" className="px-1.25">
                    +{extraCount}
                  </Badge>
                )}
              </div>
            )
          },
        },
        // {
        //   accessorKey: 'caption',
        //   header: 'Описание',
        //   cell: ({row}) => <div className="max-w-xs truncate">{row.getValue('caption')}</div>,
        // },
        {
          accessorKey: 'price',
          header: 'Цена',
          cell: ({row}) => {
            const price = row.getValue('price') as number
            return <div>${price.toFixed(2)}</div>
          },
        },
        {
          accessorKey: 'link',
          header: 'Ссылка',
          cell: ({row}) => {
            const link = (row.original as {link: string}).link
            return (
              <Link href={link || '#'} target="_blank">
                <Toggle pressed={Boolean(link)} disabled className="data-[state=on]:bg-neutral-200">
                  <SourceLink className="h-4 w-4" strokeWidth={2} />
                </Toggle>
              </Link>
            )
          },
        },
        {
          accessorKey: 'imageUrl',
          header: '',
          size: 0,
          cell: () => null,
        },
      )

      // Add featured column only for admin mode
      if (!isExpertMode) {
        baseColumns.push({
          accessorKey: 'featured',
          header: 'Рекомендуемый',
          cell: ({row}) => {
            const featured = row.getValue('featured') as boolean
            return (
              <Toggle pressed={featured} disabled className="data-[state=on]:bg-neutral-200">
                {featured ? '★' : '☆'}
              </Toggle>
            )
          },
        })
      }

      break

    case 'categories':
      baseColumns.push(
        {
          accessorKey: 'name',
          header: 'Название',
          cell: ({row}) => <div>{row.getValue('name')}</div>,
        },
        {
          accessorKey: 'description',
          header: 'Описание',
          cell: ({row}) => <div className="max-w-xs truncate">{row.getValue('description')}</div>,
        },
        {
          accessorKey: 'slug',
          header: 'Токен',
          cell: ({row}) => (
            <Badge variant="secondary" className="font-mono text-xs">
              {row.getValue('slug')}
            </Badge>
          ),
        },
      )
      break

    case 'experts':
      baseColumns.push(
        {
          accessorKey: 'name',
          header: 'Имя',
          cell: ({row}) => <div>{row.getValue('name')}</div>,
        },
        {
          accessorKey: 'role',
          header: 'Роль',
          cell: ({row}) => <div>{row.getValue('role')}</div>,
        },
        {
          accessorKey: 'username',
          header: 'Токен',
          cell: ({row}) => (
            <Badge variant="secondary" className="font-mono text-xs">
              {row.getValue('username')}
            </Badge>
          ),
        },
        {
          accessorKey: 'featured',
          header: 'Рекомендуемый',
          cell: ({row}) => {
            const featured = row.getValue('featured') as boolean
            return (
              <Toggle pressed={featured} disabled className="data-[state=on]:bg-neutral-200">
                {featured ? '★' : '☆'}
              </Toggle>
            )
          },
        },
        {
          accessorKey: 'isActive',
          header: 'Активный',
          cell: ({row}) => {
            const isActive = row.getValue('isActive') as boolean
            return (
              <Toggle pressed={isActive} disabled className="data-[state=on]:bg-neutral-200">
                {isActive ? <Check className="h-4 w-4" strokeWidth={3} /> : <X className="h-4 w-4" strokeWidth={3} />}
              </Toggle>
            )
          },
        },
      )
      break
  }

  baseColumns.push({
    id: 'actions',
    header: () => <div className="text-right">Действия</div>,
    enableHiding: false,
    cell: ({row}) => {
      const item = row.original
      return (
        <div className="flex items-center justify-end gap-2">
          <Button variant="default" size="icon" className="h-8 w-8" onClick={() => onView(item)}>
            <Eye className="h-4 w-4" strokeWidth={1.7} />
            <span className="sr-only">Посмотреть</span>
          </Button>

          {!isUserMode && (
            <>
              <Button variant="default" size="icon" className="h-8 w-8" onClick={() => onEdit(item)}>
                <Edit className="h-4 w-4" strokeWidth={1.7} />
                <span className="sr-only">Изменить</span>
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="icon" className="h-8 w-8">
                    <Trash2 className="h-4 w-4" strokeWidth={1.7} />
                    <span className="sr-only">Удалить</span>
                  </Button>
                </AlertDialogTrigger>

                <AlertDialogContent className="w-[20vw] xl:w-[30vw] sm:w-[90vw]">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
                    <AlertDialogDescription>Это действие нельзя отменить.</AlertDialogDescription>
                  </AlertDialogHeader>

                  <AlertDialogFooter>
                    <AlertDialogCancel>Отмена</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onDelete(item._id)}>Удалить</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
        </div>
      )
    },
  })

  return baseColumns
}

export default function DataTable<T extends AdminTableData>({data, entityType, onView, onEdit, onDelete, onCreate, isExpertMode = false, isUserMode = false}: DataTableProps<T>) {
  const [sorting, setSorting] = React.useState<SortingState>([])

  const columns = React.useMemo(() => createColumns(entityType, onView, onEdit, onDelete, isExpertMode, isUserMode), [entityType, onView, onEdit, onDelete, isExpertMode, isUserMode])

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  })

  const getEntityLabel = (type: AdminTableTabs, action: 'view' | 'edit') => {
    switch (type) {
      case 'orders':
        switch (action) {
          case 'view':
            return 'Заказы'
          case 'edit':
            return 'Заказ'
        }
      case 'users':
        switch (action) {
          case 'view':
            return 'Пользователи'
          case 'edit':
            return 'Пользователя'
        }
      case 'products':
        switch (action) {
          case 'view':
            return 'Продукты'
          case 'edit':
            return 'Продукт'
        }
      case 'categories':
        switch (action) {
          case 'view':
            return 'Категории'
          case 'edit':
            return 'Категорию'
        }
      case 'experts':
        switch (action) {
          case 'view':
            return 'Эксперты'
          case 'edit':
            return 'Эксперта'
        }
    }
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{getEntityLabel(entityType, 'view')}</h2>

        {!isUserMode && (
          <Button onClick={onCreate} className="gap-2 sm:text-sm sm:px-3 sm:py-2">
            <Plus className="h-4 w-4" />
            <span className="sm:hidden">Создать {getEntityLabel(entityType, 'edit')}</span>
            <span className="hidden sm:inline">Создать</span>
          </Button>
        )}
      </div>

      <div className="overflow-hidden rounded-md border border-neutral-200">
        <TableElement>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}</TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Нет данных
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </TableElement>
      </div>
    </div>
  )
}
