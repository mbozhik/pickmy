import StarImage from '$/index/star.svg'

import type {Metadata} from 'next'
import {PATHS} from '@/lib/constants'

import {preloadQuery, preloadedQueryResult} from 'convex/nextjs'
import {api} from '@convex/_generated/api'

import {cn} from '@/lib/utils'

import {notFound} from 'next/navigation'

import Link from 'next/link'
import Image from 'next/image'
import Container from '~/Global/Container'
import ProductActions from '~~/products/ProductActions'
import {H2, P, SPAN} from '~/UI/Typography'
import Markdown from '~/UI/Markdown'

type ParamsProps = {
  params: Promise<{slug: string}>
}

export async function generateMetadata({params}: ParamsProps): Promise<Metadata> {
  const {slug} = await params

  const preloadedProduct = await preloadQuery(api.tables.products.getProductBySlug, {slug})
  const product = preloadedQueryResult(preloadedProduct)

  return {
    title: product?.name,
    description: product?.caption,
  }
}

export default async function ProductsItemPage({params}: ParamsProps) {
  const {slug} = await params

  const preloadedProduct = await preloadQuery(api.tables.products.getProductBySlug, {slug})
  const product = preloadedQueryResult(preloadedProduct)

  if (!product) {
    notFound()
  }

  return (
    <Container spacing="small" className="space-y-20 xl:space-y-20 sm:space-y-20">
      <div className="grid grid-cols-5 sm:grid-cols-1 gap-20 xl:gap-12 sm:gap-4">
        <div className={cn('col-span-2 sm:col-span-1', 'py-14 sm:py-8 grid place-items-center', 'group bg-gray')}>
          {product.imageUrl ? (
            <Image className={cn('size-[15vw] xl:size-[20vw] sm:size-[52vw] object-cover rounded-lg', 'group-hover:scale-[1.05] duration-500')} src={product.imageUrl} alt={`pickmy | ${product.name} – ${product.caption}`} width={1000} height={1000} /> // image from covex
          ) : (
            <Image className={cn('rotate-45', 'size-[15vw] xl:size-[20vw] sm:size-[52vw] object-contain', 'group-hover:scale-[1.1] duration-500')} src={StarImage} alt={`pickmy | ${product.name} – ${product.caption}`} />
          )}
        </div>

        <div className={cn('col-span-3 sm:col-span-1', 'flex flex-col justify-between sm:gap-8')}>
          <div className="space-y-4 xl:space-y-3.5">
            <div className="space-y-2.5 xl:space-y-1.5 sm:space-y-2">
              <H2 className="!leading-[1.15]">{product.name}</H2>

              <div className="space-y-1 sm:space-y-1.5 font-light">
                <P>{product.caption}</P>
                <P>
                  <span>Рекомендация от </span>

                  <Link href={`${PATHS.global.experts.link}/${product.expertData.username}`} className="w-fit font-medium hover:text-neutral-500 duration-300">
                    @{product.expertData.username}
                  </Link>
                </P>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {product.categoryData &&
                product.categoryData.length > 0 &&
                product.categoryData.map((cat) => (
                  <Link key={cat._id} href={PATHS.internal.category.link + (cat.slug ?? '')} className={cn('inline-block w-fit px-4 py-1.5', 'bg-foreground text-background rounded-lg', 'hover:bg-foreground/85 duration-300')}>
                    <SPAN>{cat.name}</SPAN>
                  </Link>
                ))}
            </div>
          </div>

          <ProductActions product={product} />
        </div>
      </div>

      <div className="space-y-3">
        <Markdown content={product.description} />
      </div>
    </Container>
  )
}
