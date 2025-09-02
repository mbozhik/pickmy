import {cn} from '@/lib/utils'

import {H1, P} from '~/UI/Typography'

export default function Hero() {
  return (
    <section data-section="hero-index" className={cn('relative h-screen', 'grid place-items-center')}>
      <div className="space-y-8 xl:space-y-7 sm:space-y-6 text-center">
        <div className="space-y-6 xl:space-y-5 text-background">
          <H1>
            Советы специалистов, <br className="sm:hidden" /> которым можно доверять
          </H1>

          <P>
            Выбирайте лучшее из подборок специалистов <br className="hidden sm:block" /> — мы привезём без хлопот.
          </P>
        </div>

        <button className={cn('px-10 sm:px-8 py-3 sm:py-2.5 cursor-pointer', 'text-sm sm:text-xs text-background tracking-tight', 'bg-background/15 backdrop-blur-[2px] sm:backdrop-blur-[4px] border border-background/50 rounded-md', 'hover:bg-background/25 hover:border-background/60 duration-300')}>Лучшие подборки</button>
      </div>

      <div className={cn('absolute inset-0 -z-20 s-full overflow-hidden', 'bg-foreground')}>
        <video className="w-full sm:w-auto sm:h-screen !max-w-none opacity-60 sm:opacity-50" autoPlay muted loop playsInline>
          <source src="/hero.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    </section>
  )
}
