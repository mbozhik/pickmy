export const metadata = {
  title: 'Продукты',
}

import {preloadQuery, preloadedQueryResult} from 'convex/nextjs'
import {api} from '@convex/_generated/api'

import Container from '~/Global/Container'

export default async function IndexPage() {
  const preloadedProducts = await preloadQuery(api.tables.products.getProducts)
  const products = preloadedQueryResult(preloadedProducts)

  return (
    <Container spacing="small">
      <div>{JSON.stringify(products, null, 2)}</div>
    </Container>
  )
}
