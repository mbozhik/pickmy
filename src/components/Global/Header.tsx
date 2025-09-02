import {cn} from '@/lib/utils'

import Link from 'next/link'
import {H3, P} from '~/UI/Typography'

const HEADER_BOX = 'w-[68%] xl:w-[83%] sm:w-auto mx-auto sm:mx-4' // 'bg-background/40 backdrop-blur-[4px] text-background border border-background/50 rounded-lg'

const HEADER_LINKS = {
  catalog: 'Каталог',
  experts: 'Эксперты',
  about: 'О нас',
  contact: 'Контакты',
}

export default function Header() {
  return (
    <header className={cn('fixed inset-0 z-[99]', 'w-full h-fit pt-5 sm:pt-3', 'text-background')}>
      <div className={cn(HEADER_BOX, 'px-3 py-1.5', 'flex items-center justify-between')}>
        <Link href="/">
          <H3 offset={0} className="-mt-1">
            cargo
          </H3>
        </Link>

        <div className="flex gap-8 sm:hidden">
          {Object.entries(HEADER_LINKS).map(([key, value]) => (
            <Link href={`/${key}`} className="group" key={key}>
              <P offset={0} className="border-b border-transparent group-hover:border-b-background duration-300">
                {value}
              </P>
            </Link>
          ))}
        </div>
      </div>
    </header>
  )
}
