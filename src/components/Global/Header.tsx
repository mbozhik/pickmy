'use client'

import {LogOut} from 'lucide-react'

import {PATHS} from '@/lib/constants'
import {BOX} from '~/Global/Container'
import {BUTTON_STYLES} from '~/UI/Button'
import {useCurrentUser} from '@/utils/use-current-user'

import {cn} from '@/lib/utils'

import {useState} from 'react'
import {usePathname} from 'next/navigation'
import {useScroll, useMotionValueEvent} from 'motion/react'
import {Authenticated, Unauthenticated} from 'convex/react'
import {SignInButton, SignOutButton, UserButton} from '@clerk/nextjs'

import Link from 'next/link'
import {H3, P} from '~/UI/Typography'

export default function Header() {
  const {scrollY} = useScroll()
  const [isScrolled, setIsScrolled] = useState(false)
  const [lastScrollY, setLastScrollY] = useState(0)
  const {isExpertOrAdmin} = useCurrentUser()

  const pathname = usePathname()
  const isHomePage = pathname === '/'

  const scrolledStyles = isScrolled || !isHomePage

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

  function HeaderButton({children, to, icon = false}: {children: React.ReactNode; to?: string; icon?: boolean}) {
    return <div className={cn(BUTTON_STYLES.base, scrolledStyles ? BUTTON_STYLES.button.solid : BUTTON_STYLES.button.outline, !icon ? 'px-4.5 py-1.5 sm:px-2.5 sm:py-1.25' : 'px-2 py-1.5 sm:px-1.5 sm:py-1.25')}>{to ? <Link href={to}>{children}</Link> : children}</div>
  }

  return (
    <header className={cn('fixed inset-0 z-[99]', 'w-full h-fit pt-5 xl:pt-4 sm:pt-3')}>
      <div className={cn(BOX.header, 'p-1.5 pl-3', 'flex items-center justify-between', 'border rounded-lg duration-300', scrolledStyles ? 'bg-background/70 backdrop-blur-[4px] border-neutral-200/50 text-foreground' : 'bg-transparent border-transparent text-background')}>
        <Link href="/">
          <H3 offset={0} className="-mt-1">
            pickmy
          </H3>
        </Link>

        <div className="flex items-center gap-10 xl:gap-8 pr-0.25">
          <div className="flex gap-8 xl:gap-6 sm:hidden">
            {Object.entries(PATHS.global).map(([key, path]) => (
              <Link href={path.link} className="group" key={key}>
                <P offset={0} className={cn('border-b border-transparent duration-300', scrolledStyles ? 'group-hover:border-b-foreground' : 'group-hover:border-b-background')}>
                  {path.label}
                </P>
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3 xl:gap-2.5">
            <Authenticated>
              <UserButton />

              <div className="flex gap-1.5 xl:gap-1">
                {isExpertOrAdmin && <HeaderButton to={PATHS.internal.dashboard.link}>{PATHS.internal.dashboard.label}</HeaderButton>}

                <HeaderButton icon={true}>
                  <SignOutButton>
                    <div className="size-full grid place-items-center">
                      <LogOut className="size-4.5 sm:size-4 sm:-mr-0.5" strokeWidth={1.7} />
                    </div>
                  </SignOutButton>
                </HeaderButton>
              </div>
            </Authenticated>

            <Unauthenticated>
              <HeaderButton>
                <SignInButton mode="modal">Войти</SignInButton>
              </HeaderButton>
            </Unauthenticated>
          </div>
        </div>
      </div>
    </header>
  )
}
