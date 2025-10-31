import Container from '~/Global/Container'
import Hero from '~~/index/Hero'
import Experts from '~~/index/Experts'
import Advantages from '~~/for-experts/Advantages'
import Metrics from '~~/for-experts/Metrics'
import FAQ from '~~/for-experts/FAQ'
import ApplicationForm from '~~/for-experts/ApplicationForm'

export const metadata = {
  title: 'Станьте экспертом',
  description: 'Ваши советы приносят прибыль: создавайте подборки, получайте до 10% с продаж, а мы берём на себя всё остальное.',
}

export default function ForExpertsPage() {
  return (
    <>
      <Hero
        token="for-experts"
        title="Зарабатывайте на своих рекомендациях"
        subtitle="Рекомендуйте товары и получайте процент с каждой совершённой продажи"
        button={{text: 'Стать экспертом', to: '#apply'}} // ввв
      />

      <Container offset="small" spacing="large">
        <Advantages />
        <Experts page="for-experts" />
        <Metrics />
        <FAQ />
        <ApplicationForm />
      </Container>
    </>
  )
}
