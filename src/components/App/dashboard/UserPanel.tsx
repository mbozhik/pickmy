'use client'

import type {Doc as Table} from '@convex/_generated/dataModel'
import type {AdminTableTabs} from '~~/dashboard/AdminPanel'

import {api} from '@convex/_generated/api'
import {useCurrentUser} from '@/hooks/use-current-user'

import {useState, useMemo, useCallback} from 'react'
import {useQuery} from 'convex/react'

import {Tabs, TabsList, TabsTrigger, TabsContent} from '~/core/tabs'
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '~/core/card'
import EntityModal, {type ModalMode} from '~~/dashboard/Modal'
import DataTable from '~~/dashboard/DataTable'

type UserTableTabs = 'orders' | 'settings'

export default function UserPanel() {
  const {convexUser} = useCurrentUser()
  const [activeTab, setActiveTab] = useState<UserTableTabs>('orders')
  const [modalState, setModalState] = useState<{
    isOpen: boolean
    mode: ModalMode
    entityType: AdminTableTabs
    data?: Table<'orders'>
  }>({
    isOpen: false,
    mode: 'view',
    entityType: 'orders',
    data: undefined,
  })

  const userOrders = useQuery(api.tables.orders.getUserOrders, convexUser && activeTab === 'orders' ? {} : 'skip')

  const ordersForTable: Table<'orders'>[] = useMemo(() => userOrders || [], [userOrders])

  const handleViewOrder = useCallback((order: Table<'orders'>) => {
    setModalState({
      isOpen: true,
      mode: 'view',
      entityType: 'orders',
      data: order,
    })
  }, [])

  const handleCloseModal = useCallback(() => {
    setModalState((prev) => ({...prev, isOpen: false}))
  }, [])

  const handleModalSuccess = useCallback(() => {
    // Данные автоматически обновятся через реактивность Convex
  }, [])

  // Пустые обработчики для DataTable (мемоизированные)
  const handleEdit = useCallback(() => {}, [])
  const handleDelete = useCallback(() => {}, [])
  const handleCreate = useCallback(() => {}, [])

  if (!convexUser) {
    return (
      <div className="text-center py-14">
        <p className="text-neutral-600">Необходимо войти в систему</p>
      </div>
    )
  }

  return (
    <section data-section="user-panel" className="space-y-6">
      <Tabs className="space-y-6" value={activeTab} onValueChange={(value) => setActiveTab(value as UserTableTabs)}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="orders" className="gap-2">
            История заказов
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2" disabled>
            Настройки
          </TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="space-y-4">
          {userOrders === undefined ? (
            <div className="text-center py-14">
              <p className="text-neutral-600">Загрузка заказов...</p>
            </div>
          ) : ordersForTable.length === 0 ? (
            <div className="text-center py-14">
              <p className="text-neutral-600">У вас пока нет заказов</p>
            </div>
          ) : (
            <DataTable data={ordersForTable} entityType="orders" onView={handleViewOrder} onEdit={handleEdit} onDelete={handleDelete} onCreate={handleCreate} isUserMode={true} />
          )}
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Настройки</CardTitle>
              <CardDescription>TODO: Настройки профиля и уведомлений</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-neutral-600">Скоро здесь будут настройки...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <EntityModal isOpen={modalState.isOpen} onClose={handleCloseModal} entityType={modalState.entityType} mode={modalState.mode} data={modalState.data} onSuccess={handleModalSuccess} isUserMode={true} />
    </section>
  )
}
