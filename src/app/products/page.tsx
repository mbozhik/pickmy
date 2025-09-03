export const metadata = {
  title: 'Продукты',
}

import {preloadQuery, preloadedQueryResult} from 'convex/nextjs'
import {api} from '@convex/_generated/api'

import Container from '~/Global/Container'
import PageHero from '~/UI/PageHero'
import Catalog from '~~/products/Catalog'

export default async function ProductsPage() {
  const preloadedProducts = await preloadQuery(api.tables.products.getProducts)
  const products = preloadedQueryResult(preloadedProducts)

  return (
    <Container spacing="small">
      <PageHero heading="Продукты от экспертов" caption="Рекомендованные товары — в одном месте." />

      <Catalog products={products} />
    </Container>
  )
}
