import {cn} from '@/lib/utils'

import {H1, P} from '~/UI/Typography'
import Button from '~/UI/Button'

export type Page = 'index' | 'for-experts'

export default function Hero({title, subtitle, token, button}: {title: string; subtitle: string; token: Page; button: {text: string; to: string}}) {
  return (
    <section data-section="hero-index" className={cn('relative h-screen', 'grid place-items-center')}>
      <div className="space-y-8 xl:space-y-7 sm:space-y-6 text-center">
        <div className="space-y-6 xl:space-y-5 text-background">
          <H1 by="word" className="!leading-[0.95] max-w-[20ch]">
            {title}
          </H1>

          <P className="mx-auto max-w-[60ch]">{subtitle}</P>
        </div>

        <Button to={button.to} variant="outline" text={button.text} />
      </div>

      <div className={cn('absolute inset-0 -z-20 s-full overflow-hidden', 'bg-foreground')}>
        <video
          className="w-full sm:w-auto sm:h-screen !max-w-none opacity-60 sm:opacity-50"
          autoPlay
          muted
          loop
          playsInline
          poster={`/hero/${token}.jpg`} // thumbnail
        >
          <source src={`/hero/${token}.mp4`} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    </section>
  )
}
