import StarImage from '$/index/star.svg'

import {PATHS} from '@/lib/constants'

import {preloadQuery, preloadedQueryResult} from 'convex/nextjs'
import {api} from '@convex/_generated/api'

import {cn} from '@/lib/utils'

import Link from 'next/link'
import Image from 'next/image'
import {H1, H3, H5, P, SPAN} from '~/UI/Typography'
import Button from '~/UI/Button'

export default async function Experts() {
  const preloadedFeaturedExperts = await preloadQuery(api.tables.experts.getFeaturedExperts)
  const featuredExperts = preloadedQueryResult(preloadedFeaturedExperts)

  const experts = featuredExperts

  return (
    <section data-section="experts-index" id="experts" className="space-y-10 sm:space-y-6">
      <div className="flex sm:flex-col items-center sm:items-start justify-between sm:gap-3">
        <div className="space-y-1 sm:space-y-0">
          <H5 className="font-light sm:hidden">Лучшие</H5>
          <H1 className="hidden sm:inline leading-[1.2]">Лучшие</H1>
          <H1 className="leading-[1]">Эксперты</H1>
        </div>

        <div className="flex flex-col items-end sm:items-start gap-3 sm:w-full">
          <P className="font-light max-w-[30ch] sm:max-w-none text-right sm:text-left">Эксклюзивный доступ к отобранным продуктам ваших любимых экспертов.</P>
          <Button to={PATHS.global.experts.link} variant="solid" className="sm:w-full" text="Все эксперты" />
        </div>
      </div>

      <div className="grid grid-cols-4 xl:grid-cols-3 sm:grid-cols-1 gap-2">
        {experts?.map(({_id, name, role, username}) => (
          <Link href={`${PATHS.internal.expert.link}/${username}`} className={cn('p-5 xl:p-4', 'flex flex-col items-center gap-2', 'bg-gray', 'group')} key={_id}>
            <div className="py-10 xl:py-8 sm:py-6">
              <Image className={cn('size-36 xl:size-32 sm:size-28 object-contain', 'group-hover:scale-[1.1] duration-500')} src={StarImage} alt={`Cargo | ${name} – ${role}`} />
            </div>

            <div className="text-center">
              <H3>{name}</H3>
              <SPAN className="font-light">{role}</SPAN>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
