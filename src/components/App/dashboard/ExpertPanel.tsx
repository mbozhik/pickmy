'use client'

import {Edit} from 'lucide-react'

import type {Id, Doc as Table} from '@convex/_generated/dataModel'
import type {AdminTableTabs} from '~~/dashboard/AdminPanel'

import {PATHS} from '@/lib/constants'
import {api} from '@convex/_generated/api'

import {useCurrentUser} from '@/utils/use-current-user'

import {useState} from 'react'
import {useQuery, useMutation} from 'convex/react'
import {toast} from 'sonner'

import Link from 'next/link'
import {Tabs, TabsList, TabsTrigger, TabsContent} from '~/core/tabs'
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '~/core/card'
import {Button} from '~/core/button'
import {Badge} from '~/core/badge'
import EntityModal, {type ModalMode} from '~~/dashboard/Modal'
import DataTable from '~~/dashboard/DataTable'

type ExpertTableTabs = 'profile' | 'products'

export default function ExpertPanel() {
  const {convexUser} = useCurrentUser()
  const [activeTab, setActiveTab] = useState<ExpertTableTabs>('profile')
  const [modalState, setModalState] = useState<{
    isOpen: boolean
    mode: ModalMode
    entityType: AdminTableTabs
    data?: Table<'products'> | Table<'experts'>
  }>({
    isOpen: false,
    mode: 'view',
    entityType: 'experts',
    data: undefined,
  })

  const expert = useQuery(api.tables.experts.getExpertByUserId, convexUser ? {userId: convexUser._id} : 'skip')
  const expertProducts = useQuery(api.tables.products.getProductsByExpert, expert ? {expertId: expert._id} : 'skip')
  const deleteProduct = useMutation(api.tables.products.deleteProduct)

  const productsForTable: Table<'products'>[] =
    expertProducts?.map((product) => ({
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

  const handleViewProduct = (product: Table<'products'>) => {
    setModalState({
      isOpen: true,
      mode: 'view',
      entityType: 'products',
      data: product,
    })
  }

  const handleEditProduct = (product: Table<'products'>) => {
    setModalState({
      isOpen: true,
      mode: 'edit',
      entityType: 'products',
      data: product,
    })
  }

  const handleDeleteProduct = async (id: string) => {
    try {
      await deleteProduct({id: id as Id<'products'>})
      toast.success('Продукт успешно удален')
    } catch (error) {
      console.error('Error deleting product:', error)
      toast.error('Ошибка при удалении продукта')
    }
  }

  const handleCreateProduct = () => {
    setModalState({
      isOpen: true,
      mode: 'create',
      entityType: 'products',
      data: undefined,
    })
  }

  const handleEditProfile = () => {
    if (expert) {
      setModalState({
        isOpen: true,
        mode: 'edit',
        entityType: 'experts',
        data: expert,
      })
    }
  }

  const handleCloseModal = () => {
    setModalState((prev) => ({...prev, isOpen: false}))
  }

  const handleModalSuccess = () => {
    // Данные автоматически обновятся через реактивность Convex
  }

  if (!expert) {
    return (
      <div className="text-center py-14">
        <p className="text-neutral-600">Профиль эксперта не найден</p>
      </div>
    )
  }

  const EXPERT_PAGE_LINK = 'pickmy.ru' + PATHS.global.experts.link + `/${expert.username}`

  return (
    <section data-section="expert-panel" className="space-y-6">
      <Tabs className="space-y-6" value={activeTab} onValueChange={(value) => setActiveTab(value as ExpertTableTabs)}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profile">Профиль</TabsTrigger>
          <TabsTrigger value="products">Мои продукты</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle>Профиль эксперта</CardTitle>
                  <CardDescription>Ваши данные в системе</CardDescription>
                </div>

                <Button onClick={handleEditProfile} variant="outline" className="gap-2">
                  <Edit className="h-4 w-4" />
                  Редактировать
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-neutral-600">Имя</label>
                  <p className="text-sm">{expert.name}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-neutral-600">Роль</label>
                  <p className="text-sm">{expert.role}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-neutral-600">Username</label>
                  <Link className="block w-fit group" href={'https://' + EXPERT_PAGE_LINK} target="_blank">
                    <Badge variant="secondary" className="font-mono group-hover:bg-neutral-300 duration-300">
                      {EXPERT_PAGE_LINK}
                    </Badge>
                  </Link>
                </div>

                <div>
                  <label className="text-sm font-medium text-neutral-600">Ссылка</label>
                  <Link className="block w-fit group" href={expert.link} target="_blank">
                    <Badge variant="secondary" className="font-mono group-hover:bg-neutral-300 duration-300">
                      {expert.link}
                    </Badge>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          {expertProducts && <DataTable data={productsForTable} entityType="products" onView={handleViewProduct} onEdit={handleEditProduct} onDelete={handleDeleteProduct} onCreate={handleCreateProduct} isExpertMode={true} />}
        </TabsContent>
      </Tabs>

      <EntityModal isOpen={modalState.isOpen} onClose={handleCloseModal} entityType={modalState.entityType} mode={modalState.mode} data={modalState.data} onSuccess={handleModalSuccess} isExpertMode={true} currentExpertId={expert?._id} />
    </section>
  )
}
