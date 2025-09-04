import StarImage from '$/index/star-inverted.svg'
import {ArrowUpRight} from 'lucide-react'

import {cn} from '@/lib/utils'

import Link from 'next/link'
import Image from 'next/image'
import {H2, P} from '~/UI/Typography'

export default function PageHero({heading, caption, icon, link}: {heading: string; caption?: string; icon?: boolean; link?: string}) {
  return (
    <section data-section="page-hero" className={cn(!link ? 'py-10 xl:py-8 sm:py-5' : 'pt-10 xl:pt-8 sm:pt-4 pb-3', 'space-y-6', 'grid place-items-center text-center', 'bg-foreground text-background', 'rounded-lg')}>
      {icon && <Image className={cn('size-24 xl:size-16 sm:size-12 object-contain', 'group-hover:scale-[1.1] duration-500')} src={StarImage} alt={`pickmy | ${heading} – ${caption}`} />}

      <div className="space-y-2 xl:space-y-1.5">
        <H2 className="text-6xl xl:text-5xl">{heading}</H2>
        {caption && <P className="text-xl font-light">{caption}</P>}
      </div>

      {link && (
        <Link href={link} className={cn('w-[calc(100%-30px)] sm:w-[calc(100%-22px)]', 'py-2 xl:py-1.5 sm:py-1', 'flex justify-center gap-2 text-center', 'bg-background text-foreground rounded-lg', 'hover:bg-background/90 duration-300')}>
          <ArrowUpRight className={cn('size-7 xl:size-6', 'group-hover:translate-x-0.5 duration-300')} strokeWidth="1.7" />
        </Link>
      )}
    </section>
  )
}
