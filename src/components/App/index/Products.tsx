import {PATHS} from '@/lib/constants'

import {preloadQuery, preloadedQueryResult} from 'convex/nextjs'
import {api} from '@convex/_generated/api'

import Grid, {ProductCard} from '~/UI/Grid'
import {H1, H5, P} from '~/UI/Typography'
import Button from '~/UI/Button'

export default async function Products() {
  const preloadedProductsFeatured = await preloadQuery(api.tables.products.getProductsFeatured)
  const productsFeatured = preloadedQueryResult(preloadedProductsFeatured)

  return (
    <section data-section="products-index" id="products" className="space-y-10 sm:space-y-6">
      <div className="flex sm:flex-col items-center sm:items-start justify-between sm:gap-3">
        <div className="space-y-1 sm:space-y-0">
          <H5 className="font-light sm:hidden">Лучшие</H5>
          <H1 className="hidden sm:inline leading-[1.2]">Лучшие</H1>
          <H1 className="leading-[1]">Продукты</H1>
        </div>

        <div className="flex flex-col items-end sm:items-start gap-3 sm:w-full">
          <P className="font-light max-w-[30ch] sm:max-w-none text-right sm:text-left">Проверенные продукты для здоровья и красоты от ведущих специалистов.</P>
          <Button to={PATHS.global.products.link} variant="solid" className="sm:w-full" text="Все продукты" />
        </div>
      </div>

      <Grid
        data={productsFeatured} // только featured = true
        renderItem={(product) => <ProductCard product={product} />}
      />
    </section>
  )
}
