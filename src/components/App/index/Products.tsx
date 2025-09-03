import StarImage from '$/index/star.svg'

import {PATHS} from '@/lib/constants'

import {cn} from '@/lib/utils'

import Link from 'next/link'
import Image from 'next/image'
import {H1, H3, H5, P, SPAN} from '~/UI/Typography'
import Button from '~/UI/Button'

const MOCK_PRODUCTS = {
  omega_complex: {
    name: 'Omega Complex',
    category: 'добавки',
  },
  collagen_boost: {
    name: 'Collagen Boost',
    category: 'красота',
  },
  energy_mix: {
    name: 'Energy Mix',
    category: 'энергия',
  },
  immune_guard: {
    name: 'Immune Guard',
    category: 'иммунитет',
  },
  sleep_calm: {
    name: 'Sleep Calm',
    category: 'сон',
  },
  brain_focus: {
    name: 'Brain Focus',
    category: 'концентрация',
  },
  detox_clean: {
    name: 'Detox Clean',
    category: 'очищение',
  },
  protein_power: {
    name: 'Protein Power',
    category: 'спорт',
  },
  vitamin_boost: {
    name: 'Vitamin Boost',
    category: 'витамины',
  },
  stress_relief: {
    name: 'Stress Relief',
    category: 'релакс',
  },
  joint_care: {
    name: 'Joint Care',
    category: 'суставы',
  },
  digest_plus: {
    name: 'Digest Plus',
    category: 'пищеварение',
  },
}

export default function Products() {
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

      <div className="grid grid-cols-4 xl:grid-cols-3 sm:grid-cols-1 gap-2">
        {Object.entries(MOCK_PRODUCTS).map(([key, product]) => (
          <Link href={`${PATHS.internal.product.link}/${key}`} className={cn('p-5 xl:p-4', 'flex flex-col items-center gap-2', 'bg-gray', 'group')} key={key}>
            <div className="py-10 xl:py-8 sm:py-6">
              <Image className={cn('rotate-45', 'size-36 xl:size-32 sm:size-28 object-contain', 'group-hover:scale-[1.1] duration-500')} src={StarImage} alt="Звезда эксперта cargo" />
            </div>

            <div className="text-center">
              <H3>{product.name}</H3>
              <SPAN className="font-light">{product.category}</SPAN>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
