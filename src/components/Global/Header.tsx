'use client'

import {PATHS} from '@/lib/constants'
import {BOX} from '~/Global/Container'

import {cn} from '@/lib/utils'

import {useState} from 'react'
import {usePathname} from 'next/navigation'
import {useScroll, useMotionValueEvent} from 'motion/react'

import Link from 'next/link'
import {H3, P} from '~/UI/Typography'

export default function Header() {
  const {scrollY} = useScroll()
  const [isScrolled, setIsScrolled] = useState(false)
  const [lastScrollY, setLastScrollY] = useState(0)

  const pathname = usePathname()
  const isHomePage = pathname === '/'

  useMotionValueEvent(scrollY, 'change', (latest) => {
    const scrollingDown = latest > lastScrollY

    // Activate effect when scrolling down past 400px
    if (scrollingDown && latest > 400) {
      setIsScrolled(true)
    }

    // Reset effect when returning to very top (0-50px) - only on homepage
    if (latest <= 50 && isHomePage) {
      setIsScrolled(false)
    }

    setLastScrollY(latest)
  })

  return (
    <header className={cn('fixed inset-0 z-[99]', 'w-full h-fit pt-5 xl:pt-4 sm:pt-3')}>
      <div className={cn(BOX.header, 'px-3 py-1.5', 'flex items-center justify-between', 'border rounded-lg duration-300', isScrolled || !isHomePage ? 'bg-background/70 backdrop-blur-[4px] border-neutral-200/50 text-foreground' : 'bg-transparent border-transparent text-background')}>
        <Link href="/">
          <H3 offset={0} className="-mt-1">
            cargo
          </H3>
        </Link>

        <div className="flex gap-8 xl:gap-6 pr-2 sm:pr-0 sm:hidden">
          {Object.entries(PATHS.global).map(([key, path]) => (
            <Link href={path.link} className="group" key={key}>
              <P offset={0} className={cn('border-b border-transparent duration-300', isScrolled || !isHomePage ? 'group-hover:border-b-foreground' : 'group-hover:border-b-background')}>
                {path.label}
              </P>
            </Link>
          ))}
        </div>
      </div>
    </header>
  )
}
