import Container from '~/Global/Container'
import Hero from '~~/index/Hero'
import Experts from '~~/index/Experts'
import Products from '~~/index/Products'

export default function IndexPage() {
  return (
    <>
      <Hero
        token="index"
        title="Советы специалистов, которым можно доверять"
        subtitle="Выбирайте лучшее из подборок специалистов — мы привезём без хлопот."
        button={{text: 'Лучшие эксперты', to: '/#experts'}} // блок экспертов (заменить)
      />

      <Container offset="small">
        <Experts />
        <Products />
      </Container>
    </>
  )
}
