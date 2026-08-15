import * as React from 'react'
import {Body, Container, Head, Heading, Hr, Html, Img, Preview, Section, Text, Tailwind} from '@react-email/components'
import {BRAND, hseMpCrestWhite, hseLogoRound} from './assets'

export const SUBJECT = 'Что нас ждёт на этой неделе'

export type SeminarDigestItem = {
  tag: string
  date: string
  title: string
  description: string
  ctaLabel: string
  ctaUrl: string
}

export type SeminarsDigestFields = {
  intro: string
  items: SeminarDigestItem[]
}

const TAG_COLORS = [BRAND.burgundy, BRAND.teal, BRAND.mustard, BRAND.plum]

export const SeminarsDigest = ({intro, items}: SeminarsDigestFields) => {
  const previewText = items.map((item) => item.title).join(' · ')

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="mx-auto my-auto bg-[#FAF7F2]" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'}}>
          <Container className="mx-auto my-8 max-w-[600px] bg-white p-0">
            {/* Hero: тот же язык, что и в анонсе одного семинара — для единства серии писем */}
            <Section className="px-8 pt-8 pb-9" style={{backgroundColor: BRAND.navy}}>
              <table role="presentation" width="100%" cellPadding="0" cellSpacing="0">
                <tbody>
                  <tr>
                    <td>
                      <Img src={hseMpCrestWhite} width="40" height="40" alt="Психоанализ и психоаналитическая психотерапия" />
                    </td>
                    <td align="right" style={{verticalAlign: 'middle'}}>
                      <Text className="m-0 text-[10px] uppercase leading-[14px] text-white/80" style={{fontFamily: 'Georgia, "Times New Roman", serif', letterSpacing: '0.06em'}}>
                        Психоанализ
                        <br />и психоаналитическая психотерапия
                      </Text>
                    </td>
                  </tr>
                </tbody>
              </table>

              <Heading className="m-0 mt-6 text-[26px] font-bold leading-[32px] text-white">Планёрка по понедельникам</Heading>
              <Text className="m-0 mt-3 text-[14px] leading-[20px] text-white/80">{intro}</Text>
            </Section>

            {/* Список семинаров */}
            {items.map((item, index) => {
              const color = TAG_COLORS[index % TAG_COLORS.length]
              return (
                <Section key={item.title} className="px-8 pt-7">
                  <table role="presentation" width="100%" cellPadding="0" cellSpacing="0">
                    <tbody>
                      <tr>
                        <td width="4" style={{backgroundColor: color}}>
                          &nbsp;
                        </td>
                        <td style={{paddingLeft: '16px'}}>
                          <Text className="m-0 text-[11px] font-bold uppercase" style={{color, letterSpacing: '0.04em'}}>
                            {item.tag} · {item.date}
                          </Text>
                          <Heading className="m-0 mt-1 text-[18px] font-bold leading-[24px]" style={{color: BRAND.navy}}>
                            {item.title}
                          </Heading>
                          <Text className="m-0 mt-2 text-[14px] leading-[21px] text-neutral-700">{item.description}</Text>
                          <Text className="m-0 mt-2 text-[13px] font-bold">
                            <a href={item.ctaUrl} style={{color}} className="no-underline">
                              {item.ctaLabel} →
                            </a>
                          </Text>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  {index < items.length - 1 && <Hr className="mt-6 border-neutral-200" />}
                </Section>
              )
            })}

            <Hr className="m-0 mt-8 border-neutral-200" />

            {/* Футер */}
            <Section className="px-8 py-6 text-center">
              <Img src={hseLogoRound} width="36" height="36" alt="НИУ ВШЭ" className="mx-auto" />
              <Text className="m-0 mt-3 text-[12px] leading-[18px] text-neutral-500">
                Магистерская программа «Психоанализ и психоаналитическая терапия» · НИУ ВШЭ
                <br />
                Мясницкая 20, Москва
              </Text>
              <Text className="m-0 mt-3 text-[11px] leading-[16px] text-neutral-400">
                Вы получили это письмо, потому что подписаны на рассылку программы. <a href="{{unsubscribe_url}}" className="text-neutral-400 underline">Отписаться</a>
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

SeminarsDigest.PreviewProps = {
  intro: 'Сегодня понедельник — время планировать новую неделю. Рассказываем, что интересного у нас впереди.',
  items: [
    {
      tag: 'Онлайн-семинар',
      date: '14–16 сентября',
      title: 'Клинические границы: работа с пограничными состояниями',
      description: 'Ирина Соколова — тренинг-аналитик, супервизор МПА. Разбор клинических случаев и открытая дискуссия.',
      ctaLabel: 'Записаться',
      ctaUrl: 'https://example.com/seminar-1',
    },
    {
      tag: 'Запись семинара',
      date: 'доступна до 30 сентября',
      title: 'Инфантильное и травма: четвёртая клинико-теоретическая конференция',
      description: 'Запись прошедшей конференции уже доступна участникам программы — кроме супервизий.',
      ctaLabel: 'Смотреть запись',
      ctaUrl: 'https://example.com/recording-1',
    },
    {
      tag: 'Анонс',
      date: '2 октября',
      title: 'Живое и мёртвое знание: супервизионный разбор',
      description: 'Открытая супервизия для студентов и выпускников программы — регистрация ограничена.',
      ctaLabel: 'Узнать подробнее',
      ctaUrl: 'https://example.com/seminar-2',
    },
  ],
} as SeminarsDigestFields

export default SeminarsDigest
