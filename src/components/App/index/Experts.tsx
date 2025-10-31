import type {Page} from '~~/index/Hero'
import {PATHS} from '@/lib/constants'

import {preloadQuery, preloadedQueryResult} from 'convex/nextjs'
import {api} from '@convex/_generated/api'

import {cn} from '@/lib/utils'

import Grid, {ExpertCard} from '~/UI/Grid'
import {H1, H5, TYPO_CLASSES} from '~/UI/Typography'
import Button from '~/UI/Button'

export default async function Experts({page = 'index'}: {page?: Page}) {
  const preloadedFeaturedExperts = await preloadQuery(api.tables.experts.getFeaturedExperts)
  const featuredExperts = preloadedQueryResult(preloadedFeaturedExperts)

  return (
    <section data-section="experts-index" id="experts" className="space-y-10 sm:space-y-6">
      <div className="flex sm:flex-col items-center sm:items-start justify-between sm:gap-3">
        <div className="space-y-1 sm:space-y-0">
          <H5 className="font-light sm:hidden">Лучшие</H5>
          <H1 className="hidden sm:inline leading-[1.2]">Лучшие</H1>
          <H1 className="leading-[1]">Эксперты</H1>
        </div>

        <div className="flex flex-col items-end sm:items-start gap-3 sm:w-full">
          <p className={cn(page === 'index' ? TYPO_CLASSES.p : TYPO_CLASSES.h5, 'font-light max-w-[30ch] sm:max-w-none text-right sm:text-left')}>Ведущие специалисты в области здоровья, красоты и wellness.</p>
          <Button to={PATHS.global.experts.link} variant="solid" className="sm:w-full" text="Все эксперты" />
        </div>
      </div>

      <Grid
        data={featuredExperts} // только featured = true
        renderItem={(expert) => <ExpertCard expert={expert} />}
      />
    </section>
  )
}
