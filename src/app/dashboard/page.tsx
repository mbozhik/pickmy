'use client'

import {useCurrentUser} from '@/utils/use-current-user'

import Container from '~/Global/Container'
import PageHero from '~/UI/PageHero'
import {P} from '~/UI/Typography'
import AdminPanel from '~~/dashboard/AdminPanel'
import ExpertPanel from '~~/dashboard/ExpertPanel'
import UserPanel from '~~/dashboard/UserPanel'

export default function DashboardPage() {
  const {isLoading, role} = useCurrentUser()

  if (isLoading) {
    return (
      <Container spacing="small">
        <div className="text-center py-14 sm:py-10">
          <P>Загрузка..</P>
        </div>
      </Container>
    )
  }

  return (
    <Container spacing="small">
      <PageHero heading="Панель управления" tagline={`${role === 'admin' ? 'Администратор' : 'Эксперт'}`} />

      {role === 'admin' && <AdminPanel />}
      {role === 'expert' && <ExpertPanel />}
      {role === 'user' && <UserPanel />}
    </Container>
  )
}
