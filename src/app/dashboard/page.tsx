'use client'

import {useCurrentUser} from '@/utils/use-current-user'

import {useRouter} from 'next/navigation'
import {useEffect} from 'react'

import Container from '~/Global/Container'
import PageHero from '~/UI/PageHero'
import {P} from '~/UI/Typography'
import AdminPanel from '~~/dashboard/AdminPanel'

export default function DashboardPage() {
  const {isLoading, isExpertOrAdmin, role} = useCurrentUser()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isExpertOrAdmin) {
      router.push('/')
    }
  }, [isLoading, isExpertOrAdmin, router])

  if (isLoading) {
    return (
      <Container spacing="small">
        <div className="text-center py-14 sm:py-10">
          <P>Загрузка..</P>
        </div>
      </Container>
    )
  }

  if (!isExpertOrAdmin) {
    return null
  }

  return (
    <Container spacing="small">
      <PageHero heading="Панель управления" tagline={`${role === 'admin' ? 'Администратор' : 'Эксперт'}`} />

      {role === 'admin' && <AdminPanel />}
    </Container>
  )
}
