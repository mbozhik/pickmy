'use client'

import {PATHS} from '@/lib/constants'
import {BOX} from '~/Global/Container'

import {cn} from '@/lib/utils'

import {useState} from 'react'
import {useScroll, useMotionValueEvent} from 'motion/react'

import Link from 'next/link'
import {H3, P} from '~/UI/Typography'

export default function Header() {
  const {scrollY} = useScroll()
  const [isScrolled, setIsScrolled] = useState(false)
  const [lastScrollY, setLastScrollY] = useState(0)

  useMotionValueEvent(scrollY, 'change', (latest) => {
    const scrollingDown = latest > lastScrollY

    // Activate effect when scrolling down past 400px
    if (scrollingDown && latest > 400) {
      setIsScrolled(true)
    }

    // Reset effect when returning to very top (0-50px)
    if (latest <= 50) {
      setIsScrolled(false)
    }

    setLastScrollY(latest)
  })

  return (
    <header className={cn('fixed inset-0 z-[99]', 'w-full h-fit pt-5 xl:pt-4 sm:pt-3')}>
      <div className={cn(BOX.header, 'px-3 py-1.5', 'flex items-center justify-between', 'rounded-lg duration-300', isScrolled ? 'bg-background/70 backdrop-blur-[4px] text-foreground' : 'bg-transparent text-background')}>
        <Link href="/">
          <H3 offset={0} className="-mt-1">
            cargo
          </H3>
        </Link>

        <div className="flex gap-8 xl:gap-6 pr-2 sm:pr-0 sm:hidden">
          {Object.entries(PATHS.global).map(([key, path]) => (
            <Link href={path.link} className="group" key={key}>
              <P offset={0} className="border-b border-transparent group-hover:border-b-background duration-300">
                {path.label}
              </P>
            </Link>
          ))}
        </div>
      </div>
    </header>
  )
}
