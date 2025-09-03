import {cn} from '@/lib/utils'

import {H2, P} from '~/UI/Typography'

export default function PageHero({heading, caption}: {heading: string; caption: string}) {
  return (
    <section data-section="page-hero" className={cn('py-10 xl:py-8 sm:py-5 space-y-2 xl:space-y-1.5 sm:space-y-3', 'grid place-items-center text-center', 'bg-foreground text-background', 'rounded-lg')}>
      <H2 className="text-6xl xl:text-5xl">{heading}</H2>
      <P className="text-xl font-light">{caption}</P>
    </section>
  )
}
