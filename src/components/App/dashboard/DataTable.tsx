'use client'

import {Eye, Edit, Trash2, Plus, Check, X} from 'lucide-react'

import type {AdminTableData, AdminTableTabs} from '~~/dashboard/AdminPanel'

import * as React from 'react'
import {ColumnDef, flexRender, getCoreRowModel, getSortedRowModel, SortingState, useReactTable} from '@tanstack/react-table'

import {Button} from '~/core/button'
import {Badge} from '~/core/badge'
import {AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger} from '~/core/alert-dialog'
import {Table as TableElement, TableBody, TableCell, TableHead, TableHeader, TableRow} from '~/core/table'
import {Toggle} from '~/core/toggle'

interface DataTableProps<T extends AdminTableData> {
  data: T[]
  entityType: AdminTableTabs
  onView: (item: T) => void
  onEdit: (item: T) => void
  onDelete: (id: string) => void
  onCreate: () => void
  isExpertMode?: boolean // flag for expert panel (limited columns)
}

const truncateId = (id: string, maxLength: number = 10) => {
  return id.length > maxLength ? `${id.substring(0, maxLength)}..` : id
}

const createColumns = <T extends AdminTableData>(entityType: AdminTableTabs, onView: (item: T) => void, onEdit: (item: T) => void, onDelete: (id: string) => void, isExpertMode: boolean = false): ColumnDef<T>[] => {
  const baseColumns: ColumnDef<T>[] = [
    {
      accessorKey: '_id',
      header: 'ID',
      cell: ({row}) => (
        <Badge variant="secondary" className="font-mono text-xs">
          {truncateId(row.getValue('_id'))}
        </Badge>
      ),
    },
  ]

  switch (entityType) {
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
            return (
              <Badge variant="secondary" className="text-xs tracking-tight">
                {categoryName}
              </Badge>
            )
          },
        },
        {
          accessorKey: 'caption',
          header: 'Описание',
          cell: ({row}) => <div className="max-w-xs truncate">{row.getValue('caption')}</div>,
        },
        {
          accessorKey: 'price',
          header: 'Цена',
          cell: ({row}) => {
            const price = row.getValue('price') as number
            return <div>{price} ₽</div>
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
        </div>
      )
    },
  })

  return baseColumns
}

export default function DataTable<T extends AdminTableData>({data, entityType, onView, onEdit, onDelete, onCreate, isExpertMode = false}: DataTableProps<T>) {
  const [sorting, setSorting] = React.useState<SortingState>([])

  const columns = React.useMemo(() => createColumns(entityType, onView, onEdit, onDelete, isExpertMode), [entityType, onView, onEdit, onDelete, isExpertMode])

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

        <Button onClick={onCreate} className="gap-2 sm:text-sm sm:px-3 sm:py-2">
          <Plus className="h-4 w-4" />
          <span className="sm:hidden">Создать {getEntityLabel(entityType, 'edit')}</span>
          <span className="hidden sm:inline">Создать</span>
        </Button>
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
