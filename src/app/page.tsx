import Container from '~/Global/Container'
import Hero from '~~/index/Hero'
import Experts from '~~/index/Experts'
import Products from '~~/index/Products'

export default function IndexPage() {
  return (
    <>
      <Hero />

      <Container>
        <Experts />
        <Products />
      </Container>
    </>
  )
}
