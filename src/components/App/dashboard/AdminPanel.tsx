'use client'

import type {Id} from '@convex/_generated/dataModel'
import type {Doc as Table} from '@convex/_generated/dataModel'

import {api} from '@convex/_generated/api'

import {useState} from 'react'
import {useQuery, useMutation} from 'convex/react'
import {toast} from 'sonner'

import {Tabs, TabsList, TabsTrigger, TabsContent} from '~/core/tabs'
import EntityModal, {type ModalMode} from '~~/dashboard/Modal'
import DataTable from '~~/dashboard/DataTable'

export type User = Table<'users'>
export type Product = Table<'products'>
export type Category = Table<'categories'>
export type Expert = Table<'experts'>
export type Order = Table<'orders'>

export type AdminTableData = Table<'users'> | Table<'products'> | Table<'categories'> | Table<'experts'> | Table<'orders'>

export type AdminTableTabs = 'orders' | 'experts' | 'products' | 'categories' | 'users'

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<AdminTableTabs>('orders')
  const [modalState, setModalState] = useState<{
    isOpen: boolean
    mode: ModalMode
    entityType: AdminTableTabs
    data?: AdminTableData
  }>({
    isOpen: false,
    mode: 'create',
    entityType: 'orders',
  })

  const users = useQuery(api.tables.users.getAllUsers, activeTab === 'users' ? {} : 'skip') as User[] | undefined
  const products = useQuery(api.tables.products.getAllProducts, activeTab === 'products' ? {} : 'skip')
  const categories = useQuery(api.tables.categories.getCategories, activeTab === 'categories' ? {} : 'skip') as Category[] | undefined
  const experts = useQuery(api.tables.experts.getAllExperts, activeTab === 'experts' ? {} : 'skip') as Expert[] | undefined
  const orders = useQuery(api.tables.orders.getAllOrders, activeTab === 'orders' ? {} : 'skip') as Order[] | undefined

  const deleteUser = useMutation(api.tables.users.deleteUser)
  const deleteProduct = useMutation(api.tables.products.deleteProduct)
  const deleteCategory = useMutation(api.tables.categories.deleteCategory)
  const deleteExpert = useMutation(api.tables.experts.deleteExpert)

  const handleView = (item: AdminTableData) => {
    setModalState({
      isOpen: true,
      mode: 'view',
      entityType: activeTab,
      data: item,
    })
  }

  const handleEdit = (item: AdminTableData) => {
    setModalState({
      isOpen: true,
      mode: 'edit',
      entityType: activeTab,
      data: item,
    })
  }

  const handleDelete = async (id: string) => {
    try {
      switch (activeTab) {
        case 'orders':
          // Orders обычно не удаляют, но можно добавить функцию если нужно
          toast.error('Удаление заказов не разрешено')
          return
        case 'users':
          await deleteUser({id: id as Id<'users'>})
          break
        case 'products':
          await deleteProduct({id: id as Id<'products'>})
          break
        case 'categories':
          await deleteCategory({id: id as Id<'categories'>})
          break
        case 'experts':
          await deleteExpert({id: id as Id<'experts'>})
          break
      }
      toast.success('Элемент успешно удален')
    } catch (error) {
      console.error('Error deleting item:', error)
      toast.error('Произошла ошибка при удалении')
    }
  }

  const handleCreate = () => {
    if (activeTab === 'orders') {
      toast.error('Заказы создаются только через корзину')
      return
    }

    setModalState({
      isOpen: true,
      mode: 'create',
      entityType: activeTab,
    })
  }

  const handleModalClose = () => {
    setModalState((prev) => ({...prev, isOpen: false}))
  }

  const handleModalSuccess = () => {
    setModalState((prev) => ({...prev, isOpen: false}))
  }

  const getCurrentData = () => {
    switch (activeTab) {
      case 'orders':
        return orders || []
      case 'users':
        return users || []
      case 'products':
        return (
          products?.map((product) => ({
            _id: product._id,
            _creationTime: product._creationTime,
            name: product.name,
            category: product.categoryData._id,
            categoryName: product.categoryData.name,
            caption: product.caption,
            expert: product.expertData._id,
            slug: product.slug,
            featured: product.featured,
            price: product.price,
            image: product.image,
            imageUrl: product.imageUrl,
          })) || []
        )
      case 'categories':
        return categories || []
      case 'experts':
        return experts || []
    }
  }

  return (
    <section data-section="admin-panel" className="space-y-6">
      <Tabs className="space-y-6" value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)}>
        <TabsList className="w-full sm:h-auto grid grid-cols-5 sm:grid-cols-2 sm:gap-x-2 sm:gap-y-2.5">
          <TabsTrigger value="orders">Заказы</TabsTrigger>
          <TabsTrigger value="experts">Эксперты</TabsTrigger>
          <TabsTrigger value="products">Продукты</TabsTrigger>
          <TabsTrigger value="categories">Категории</TabsTrigger>
          <TabsTrigger value="users">Пользователи</TabsTrigger>
        </TabsList>

        <TabsContent value="orders">
          <DataTable data={(getCurrentData() || []) as AdminTableData[]} entityType="orders" onView={handleView} onEdit={handleEdit} onDelete={handleDelete} onCreate={handleCreate} />
        </TabsContent>

        <TabsContent value="experts">
          <DataTable data={(getCurrentData() || []) as AdminTableData[]} entityType="experts" onView={handleView} onEdit={handleEdit} onDelete={handleDelete} onCreate={handleCreate} />
        </TabsContent>

        <TabsContent value="products">
          <DataTable data={(getCurrentData() || []) as AdminTableData[]} entityType="products" onView={handleView} onEdit={handleEdit} onDelete={handleDelete} onCreate={handleCreate} />
        </TabsContent>

        <TabsContent value="categories">
          <DataTable data={(getCurrentData() || []) as AdminTableData[]} entityType="categories" onView={handleView} onEdit={handleEdit} onDelete={handleDelete} onCreate={handleCreate} />
        </TabsContent>

        <TabsContent value="users">
          <DataTable data={(getCurrentData() || []) as AdminTableData[]} entityType="users" onView={handleView} onEdit={handleEdit} onDelete={handleDelete} onCreate={handleCreate} />
        </TabsContent>
      </Tabs>

      <EntityModal isOpen={modalState.isOpen} onClose={handleModalClose} entityType={modalState.entityType} mode={modalState.mode} data={modalState.data} onSuccess={handleModalSuccess} />
    </section>
  )
}
