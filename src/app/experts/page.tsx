export const metadata = {
  title: 'Эксперты',
}

import {preloadQuery, preloadedQueryResult} from 'convex/nextjs'
import {api} from '@convex/_generated/api'

import Container from '~/Global/Container'
import PageHero from '~/UI/PageHero'
import Grid, {ExpertCard} from '@/components/UI/Grid'

export default async function ExpertsPage() {
  const preloadedExperts = await preloadQuery(api.tables.experts.getExperts)
  const experts = preloadedQueryResult(preloadedExperts)

  return (
    <Container spacing="small">
      <PageHero heading="Наши эксперты" caption="Рекомендованные эксперты — в одном месте." />

      <Grid
        data={experts} // все эксперты
        renderItem={(expert) => <ExpertCard expert={expert} />}
      />
    </Container>
  )
}
