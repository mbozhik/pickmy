import Hero from '~~/index/Hero'

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
    </>
  )
}
