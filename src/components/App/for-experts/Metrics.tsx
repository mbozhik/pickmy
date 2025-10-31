import {Users, Package, DollarSign, Heart} from 'lucide-react'

import {Card, CardContent} from '~/core/card'
import {H2, H4, H5, SPAN} from '~/UI/Typography'

const DATA = [
  {
    icon: Users,
    value: '150+',
    label: 'Активных пользователей',
  },
  {
    icon: Package,
    value: '1000+',
    label: 'Успешных доставок',
  },
  {
    icon: DollarSign,
    value: '15 000 ₽',
    label: 'Средняя сумма чека',
  },
  {
    icon: Heart,
    value: '100%',
    label: 'Надежность доставки',
  },
]

export default function Metrics() {
  return (
    <section data-section="metrics-forexperts" className="space-y-10 sm:space-y-6">
      <div className="space-y-1.5 sm:space-y-2 text-center sm:text-left">
        <H2>Успехи и результаты</H2>
        <H5 className="font-light">Первые эксперты уже присоединяются, и их число быстро растёт</H5>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-2 gap-5 sm:gap-2.5">
        {DATA.map((metric, idx) => (
          <Card data-slot="metric" className="text-center p-6 sm:p-3 sm:justify-center" key={idx}>
            <CardContent className="space-y-3 sm:px-0">
              <div className="w-fit mx-auto grid place-items-center p-2 bg-neutral-200/60 sm:bg-neutral-300/50 rounded-xl">
                <metric.icon className="size-7 sm:size-5" strokeWidth={1.7} />
              </div>

              <div>
                <H4 className="font-bold">{metric.value}</H4>
                <SPAN className="text-neutral-800/90">{metric.label}</SPAN>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
