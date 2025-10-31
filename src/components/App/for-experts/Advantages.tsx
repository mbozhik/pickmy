// import {Globe, Users, Heart, Lightbulb, Sparkles, Rocket, Target} from 'lucide-react'

import {Sparkles, TrendingUp, Shield, Zap} from 'lucide-react'

import {cn} from '@/lib/utils'

import {Card} from '~/Core/card'
import {H2, H4, H5, P} from '~/UI/Typography'

const DATA = [
  {
    icon: Sparkles,
    title: 'Дополнительный доход',
    description: 'Зарабатывайте до 10% с каждой продажи. Ваши советы превращаются в понятный и регулярный источник стабильного дохода.',
  },
  {
    icon: TrendingUp,
    title: 'Укрепление бренда',
    description: 'Персональная витрина показывает вашу экспертизу, усиливает доверие и помогает аудитории чаще выбирать именно ваши рекомендации.',
  },
  {
    icon: Shield,
    title: 'Полный сервис',
    description: 'Мы берём на себя оплату, доставку и поддержку клиентов. Вам остаётся только делиться знаниями и полезными рекомендациями.',
  },
  {
    icon: Zap,
    title: 'Лёгкий старт',
    description: 'Создайте витрину всего за 15 минут и начните зарабатывать без вложений, рисков и ненужных сложностей. Всё очень просто.',
  },
]

export default function Advantages() {
  return (
    <section data-section="advantages-forexperts" className="space-y-10 sm:space-y-6">
      <div className="space-y-1.5 sm:space-y-2 text-center sm:text-left">
        <H2>Новые возможности</H2>
        <H5 className="font-light">Используйте нашу платформу, чтобы расширять аудиторию и увеличивать доход</H5>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-1 gap-5 sm:gap-2.5">
        {DATA.map((advantage, idx) => (
          <Card data-slot="advantage" className={cn('p-6 sm:p-3 gap-4.5 xl:gap-4 sm:gap-3.5')} key={idx}>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-neutral-200/60 sm:bg-neutral-300/50 rounded-xl">
                <advantage.icon className="size-6 sm:size-5" strokeWidth={1.5} />
              </div>

              <H4 className="font-medium tracking-tight">{advantage.title}</H4>
            </div>

            <P className="text-neutral-800/90">{advantage.description}</P>
          </Card>
        ))}
      </div>
    </section>
  )
}
