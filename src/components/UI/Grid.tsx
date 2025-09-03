import StarImage from '$/index/star.svg'

import type {Doc as Table} from '@convex/_generated/dataModel'
import {PATHS} from '@/lib/constants'

import {cn} from '@/lib/utils'

import Link from 'next/link'
import Image from 'next/image'
import {H3, SPAN} from '~/UI/Typography'

export type ProductWithExtraData = Omit<Table<'products'>, 'category' | 'expert'> & {
  categoryData: {
    _id: string
    name: string
    slug: string
  }
  expertData: {
    _id: string
    name: string
    role: string
    username: string
  }
}

type GridProps<T> = {
  data: T[] | undefined
  renderItem: (item: T) => React.ReactNode
}

export function ProductCard({product}: {product: ProductWithExtraData}) {
  return (
    <Link href={`${PATHS.internal.product.link}/${product.slug}`} className={cn('p-5 xl:p-4', 'flex flex-col items-center gap-2', 'bg-gray', 'group')}>
      <div className="py-10 xl:py-8 sm:py-6">
        <Image className={cn('rotate-45', 'size-36 xl:size-32 sm:size-28 object-contain', 'group-hover:scale-[1.1] duration-500')} src={StarImage} alt={`Cargo | ${product.name} – ${product.caption}`} />
      </div>

      <div className="text-center">
        <H3>{product.name}</H3>
        <SPAN className="font-light lowercase">{product.categoryData.name}</SPAN>
      </div>
    </Link>
  )
}

export function ExpertCard({expert}: {expert: Table<'experts'>}) {
  return (
    <Link href={`${PATHS.internal.expert.link}/${expert.username}`} className={cn('p-5 xl:p-4', 'flex flex-col items-center gap-2', 'bg-gray', 'group')}>
      <div className="py-10 xl:py-8 sm:py-6">
        <Image className={cn('size-36 xl:size-32 sm:size-28 object-contain', 'group-hover:scale-[1.1] duration-500')} src={StarImage} alt={`Cargo | ${expert.name} – ${expert.role}`} />
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
    <div className="grid grid-cols-4 xl:grid-cols-3 sm:grid-cols-1 gap-2">
      {data === undefined ? (
        <div className="col-span-full text-center py-14 sm:py-10 bg-gray">
          <SPAN>Загрузка данных..</SPAN>
        </div>
      ) : data.length === 0 ? (
        <div className="col-span-full text-center py-14 sm:py-10 bg-gray">
          <SPAN>Нет доступных данных</SPAN>
        </div>
      ) : (
        data.map((item) => <div key={item._id}>{renderItem(item)}</div>)
      )}
    </div>
  )
}
