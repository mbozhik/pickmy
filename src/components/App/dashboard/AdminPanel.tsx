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

export type AdminTableData = Table<'users'> | Table<'products'> | Table<'categories'> | Table<'experts'>

export type AdminTableTabs = 'experts' | 'products' | 'categories' | 'users'

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<AdminTableTabs>('experts')
  const [modalState, setModalState] = useState<{
    isOpen: boolean
    mode: ModalMode
    entityType: AdminTableTabs
    data?: AdminTableData
  }>({
    isOpen: false,
    mode: 'create',
    entityType: 'experts',
  })

  const users = useQuery(api.tables.users.getAllUsers, activeTab === 'users' ? {} : 'skip') as User[] | undefined
  const products = useQuery(api.tables.products.getAllProducts, activeTab === 'products' ? {} : 'skip') as Product[] | undefined
  const categories = useQuery(api.tables.categories.getCategories, activeTab === 'categories' ? {} : 'skip') as Category[] | undefined
  const experts = useQuery(api.tables.experts.getAllExperts, activeTab === 'experts' ? {} : 'skip') as Expert[] | undefined

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

  const handleEdit = (item: Expert | Product | Category | User) => {
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
      case 'users':
        return users || []
      case 'products':
        return products || []
      case 'categories':
        return categories || []
      case 'experts':
        return experts || []
    }
  }

  return (
    <section data-section="admin-panel" className="space-y-6">
      <Tabs className="space-y-6" value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)}>
        <TabsList className="w-full sm:h-auto grid grid-cols-4 sm:grid-cols-2 sm:gap-x-2 sm:gap-y-2.5">
          <TabsTrigger value="experts">Эксперты</TabsTrigger>
          <TabsTrigger value="products">Продукты</TabsTrigger>
          <TabsTrigger value="categories">Категории</TabsTrigger>
          <TabsTrigger value="users">Пользователи</TabsTrigger>
        </TabsList>

        <TabsContent value="experts">
          <DataTable data={getCurrentData()} entityType="experts" onView={handleView} onEdit={handleEdit} onDelete={handleDelete} onCreate={handleCreate} />
        </TabsContent>

        <TabsContent value="products">
          <DataTable data={getCurrentData()} entityType="products" onView={handleView} onEdit={handleEdit} onDelete={handleDelete} onCreate={handleCreate} />
        </TabsContent>

        <TabsContent value="categories">
          <DataTable data={getCurrentData()} entityType="categories" onView={handleView} onEdit={handleEdit} onDelete={handleDelete} onCreate={handleCreate} />
        </TabsContent>

        <TabsContent value="users">
          <DataTable data={getCurrentData()} entityType="users" onView={handleView} onEdit={handleEdit} onDelete={handleDelete} onCreate={handleCreate} />
        </TabsContent>
      </Tabs>

      <EntityModal isOpen={modalState.isOpen} onClose={handleModalClose} entityType={modalState.entityType} mode={modalState.mode} data={modalState.data} onSuccess={handleModalSuccess} />
    </section>
  )
}
