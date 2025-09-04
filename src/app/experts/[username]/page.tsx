import type {Metadata} from 'next'

import {preloadQuery, preloadedQueryResult} from 'convex/nextjs'
import {api} from '@convex/_generated/api'

import {notFound} from 'next/navigation'

import Container from '~/Global/Container'
import PageHero from '~/UI/PageHero'
import Grid, {ProductCard} from '~/UI/Grid'

type ParamsProps = {
  params: Promise<{username: string}>
}

export async function generateMetadata({params}: ParamsProps): Promise<Metadata> {
  const {username} = await params

  const preloadedExpert = await preloadQuery(api.tables.experts.getExpertByUsername, {username})
  const expert = preloadedQueryResult(preloadedExpert)

  return {
    title: expert?.name,
    description: expert?.role,
  }
}

export default async function ExpertsItemPage({params}: ParamsProps) {
  const {username} = await params

  const preloadedExpert = await preloadQuery(api.tables.experts.getExpertByUsername, {username})
  const expert = preloadedQueryResult(preloadedExpert)

  if (!expert) {
    notFound()
  }

  const preloadedProductsExpert = await preloadQuery(api.tables.products.getProductsByExpert, {expertId: expert._id})
  const productsExpert = preloadedQueryResult(preloadedProductsExpert)

  return (
    <Container spacing="small">
      <PageHero heading={expert.name} caption={expert.role} icon={true} link={expert.link} />

      <Grid
        data={productsExpert} // только этого expert'a
        renderItem={(product) => <ProductCard product={product} />}
      />
    </Container>
  )
}
