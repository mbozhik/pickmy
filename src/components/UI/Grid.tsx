import StarImage from '$/index/star.svg'
import {cloneElement, isValidElement} from 'react'

import type {Doc as Table} from '@convex/_generated/dataModel'
import {PATHS} from '@/lib/constants'

import {cn} from '@/lib/utils'

import Link from 'next/link'
import Image from 'next/image'
import {H3, H5, SPAN} from '~/UI/Typography'
import {CartButton} from '~~/products/ProductActions'

export type ProductWithExtraData = Omit<Table<'products'>, 'category' | 'expert'> & {
  categoryData: {
    _id: string
    name: string
    slug: string
  }[]
  expertData: {
    _id: string
    name: string
    role: string
    username: string
  }
  imageUrl?: string
}

type GridProps<T> = {
  data: T[] | undefined
  renderItem: (item: T) => React.ReactNode
}

export function ProductCard({product}: {product: ProductWithExtraData}) {
  return (
    <Link href={`${PATHS.global.products.link}/${product.slug}`} className={cn('p-3', 'flex flex-col items-center justify-between gap-1 xl:gap-3', 'bg-gray', 'group')}>
      <div className={cn('w-full sm:w-[70%] grid place-items-center aspect-square overflow-hidden', product.imageUrl ? 'p-4 xl:p-4 sm:p-0' : 'py-10 xl:py-8 sm:py-6')}>
        {product.imageUrl ? (
          <Image className={cn('w-full object-cover rounded-xl', 'group-hover:scale-[1.025] duration-500')} src={product.imageUrl} alt={`pickmy | ${product.name} – ${product.caption}`} width={500} height={500} /> // custom image
        ) : (
          <Image className={cn('rotate-45', 'w-[50%] object-contain', 'group-hover:scale-[1.1] duration-500')} src={StarImage} alt={`pickmy | ${product.name} – ${product.caption}`} />
        )}
      </div>

      <div className="w-full space-y-3.5 text-center">
        <H5 className="sm:text-xl text-center font-medium !leading-[1.2] tracking-tight mx-auto max-w-[20ch]">{product.name}</H5>

        <div className={cn('w-full p-1.25 pl-2', 'flex items-center justify-between', 'bg-neutral-200 rounded-lg')}>
          <H5 className="sm:text-xl">${product.price.toFixed(2)}</H5>

          <CartButton product={product} />
        </div>
      </div>
    </Link>
  )
}

export function ExpertCard({expert}: {expert: Table<'experts'>}) {
  return (
    <Link href={`${PATHS.global.experts.link}/${expert.username}`} className={cn('p-5 xl:p-4', 'flex flex-col items-center gap-2', 'bg-gray', 'group')}>
      <div className="py-10 xl:py-8 sm:py-6">
        <Image className={cn('size-36 xl:size-32 sm:size-28 object-contain', 'group-hover:scale-[1.1] duration-500')} src={StarImage} alt={`pickmy | ${expert.name} – ${expert.role}`} />
      </div>

      <div className="text-center">
        <H3>{expert.name}</H3>
        <SPAN className="font-light">{expert.role}</SPAN>
      </div>
    </Link>
  )
}

export default function Grid<T extends {_id: string}>({data, renderItem}: GridProps<T>) {
  return (
    <div className="grid grid-cols-4 xl:grid-cols-4 sm:grid-cols-1 gap-2">
      {data === undefined ? (
        <div className="col-span-full text-center py-14 sm:py-10 bg-gray">
          <SPAN>Загрузка данных..</SPAN>
        </div>
      ) : data.length === 0 ? (
        <div className="col-span-full text-center py-14 sm:py-10 bg-gray">
          <SPAN>Нет доступных данных</SPAN>
        </div>
      ) : (
        data.map((item, idx) => {
          const element = renderItem(item)
          return isValidElement(element) ? cloneElement(element, {key: idx}) : element
        })
      )}
    </div>
  )
}
