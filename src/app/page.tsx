import Container from '~/Global/Container'
import Hero from '~~/index/Hero'
import Experts from '~~/index/Experts'

export default function IndexPage() {
  return (
    <>
      <Hero />

      <Container>
        <Experts />
      </Container>
    </>
  )
}
