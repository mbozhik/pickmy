import {PATHS} from '@/lib/constants'
import {BOX, CONTAINER} from '~/Global/Container'

import {cn} from '@/lib/utils'

import Link from 'next/link'
import {SPAN} from '~/UI/Typography'

export default function Footer() {
  return (
    <footer className={cn(BOX.container, CONTAINER.offset.small, 'pb-4', 'flex sm:flex-col justify-between sm:gap-2', 'text-neutral-400 font-light')}>
      <SPAN offset={0}>PickMy Company. 2025</SPAN>

      <div className="flex sm:flex-wrap gap-6 sm:gap-x-4 sm:gap-y-3">
        {Object.entries(PATHS.additional).map(([key, path]) => (
          <Link href={path.link} className="underline underline-offset-[3px] hover:no-underline" key={key}>
            <SPAN offset={0}>{path.label}</SPAN>
          </Link>
        ))}
      </div>
    </footer>
  )
}
