'use client'

import type {ProductWithExtraData} from '~/UI/Grid'

import {cn} from '@/lib/utils'
import {useMediaQuery} from '@/hooks/use-media-query'

import {useState, useMemo, useEffect} from 'react'
import {useRouter, useSearchParams} from 'next/navigation'
import {motion} from 'motion/react'

import Grid, {ProductCard} from '~/UI/Grid'
import Button, {BUTTON_STYLES} from '~/UI/Button'
import {SPAN} from '~/UI/Typography'

type CategoryWithCount = {_id: string; name: string; slug: string; count: number}

export default function Catalog({products}: {products: ProductWithExtraData[]}) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const isDesktop = useMediaQuery('(min-width: 768px)')

  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string | null>(searchParams.get('category') || null)
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)

  const categoriesWithCount = useMemo(() => {
    const categoryMap = new Map<string, CategoryWithCount>()

    products.forEach((product) => {
      product.categoryData.forEach((category) => {
        const existing = categoryMap.get(category._id)

        if (existing) {
          existing.count += 1
        } else {
          categoryMap.set(category._id, {
            _id: category._id,
            name: category.name,
            slug: category.slug,
            count: 1,
          })
        }
      })
    })

    return Array.from(categoryMap.values()).sort((a, b) => b.count - a.count)
  }, [products])

  const filteredProducts = useMemo(() => {
    if (!selectedCategorySlug) return products
    return products.filter((product) => product.categoryData.some((c) => c.slug === selectedCategorySlug))
  }, [products, selectedCategorySlug])

  useEffect(() => {
    const current = new URLSearchParams(Array.from(searchParams.entries()))

    if (selectedCategorySlug) {
      current.set('category', selectedCategorySlug)
    } else {
      current.delete('category')
    }

    const search = current.toString()
    const query = search ? `?${search}` : ''
    router.push(`/products${query}`, {scroll: false})
  }, [selectedCategorySlug, searchParams, router])

  const handleCategorySelect = (categorySlug: string) => {
    if (selectedCategorySlug === categorySlug) {
      setSelectedCategorySlug(null)
    } else {
      setSelectedCategorySlug(categorySlug)
    }
    if (!isDesktop) setIsFiltersOpen(false)
  }

  return (
    <section data-section="catalog-products" className="space-y-8 xl:space-y-6 sm:space-y-4">
      <div className="flex sm:flex-col justify-center gap-2 sm:gap-1.5">
        <Button variant="solid" className="hidden sm:block" text={isFiltersOpen ? 'Скрыть фильтры' : 'Фильтры'} onClick={() => setIsFiltersOpen(!isFiltersOpen)} />

        <motion.div
          className="flex sm:grid sm:grid-cols-2 gap-2 sm:gap-1.5 w-full"
          initial={false}
          animate={
            isDesktop
              ? {height: 'auto', opacity: 1}
              : {
                  height: isFiltersOpen ? 'auto' : 0,
                  opacity: isFiltersOpen ? 1 : 0,
                }
          }
          transition={isDesktop ? {duration: 0} : {duration: 0.3, delay: 0.2, ease: 'easeInOut'}}
        >
          {categoriesWithCount.map((category) => (
            <button className={cn(BUTTON_STYLES.base, 'w-full', selectedCategorySlug !== category.slug ? 'bg-gray hover:bg-foreground/85 border-neutral-300 hover:border-foreground text-neutral-800 hover:text-background' : 'bg-foreground border-foreground text-background')} data-count={category.count} onClick={() => handleCategorySelect(category.slug)} key={category._id}>
              {category.name}
            </button>
          ))}
        </motion.div>
      </div>

      {filteredProducts.length > 0 ? (
        <Grid data={filteredProducts} renderItem={(product) => <ProductCard product={product} />} />
      ) : (
        <div className="text-center py-14 sm:py-10 bg-gray">
          <SPAN>Нет доступных данных</SPAN>
        </div>
      )}
    </section>
  )
}
