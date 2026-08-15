import * as React from 'react'
import {Body, Button, Container, Head, Heading, Hr, Html, Img, Preview, Section, Text, Tailwind} from '@react-email/components'
import {BRAND, hseMpCrestNavy, hseLogoRound} from './assets'

export const SUBJECT = '{{тема}} — {{ссылка на семинар / ссылка на запись}}'

export type SeminarAccessFields = {
  kind: 'live' | 'recording'
  title: string
  date: string
  speakerName: string
  note?: string
  ctaUrl: string
}

const STRIPE_COLORS = [BRAND.navy, BRAND.burgundy, BRAND.mustard, BRAND.teal, BRAND.plum]

const COPY = {
  live: {
    eyebrow: 'Ссылка на семинар',
    heading: 'Сегодня начинаем',
    ctaLabel: 'Войти в семинар',
    hint: 'Ссылка активна за 10 минут до начала. Подключайтесь заранее — в первые минуты разбираем оргвопросы.',
  },
  recording: {
    eyebrow: 'Запись семинара',
    heading: 'Запись уже доступна',
    ctaLabel: 'Смотреть запись',
    hint: 'Запись доступна участникам программы бессрочно, если не указано иное.',
  },
} as const

export const SeminarAccess = ({kind, title, date, speakerName, note, ctaUrl}: SeminarAccessFields) => {
  const copy = COPY[kind]
  const previewText = `${copy.eyebrow}: ${title}`

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="mx-auto my-auto bg-[#FAF7F2]" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'}}>
          <Container className="mx-auto my-8 max-w-[520px] bg-white p-0" style={{border: '1px solid #EEE7DC'}}>
            {/* Та же цветная полоса, что и в SeminarSingle-B — держим письма серии в одном визуальном языке */}
            <table role="presentation" width="100%" cellPadding="0" cellSpacing="0">
              <tbody>
                <tr>
                  {STRIPE_COLORS.map((color) => (
                    <td key={color} height="6" style={{backgroundColor: color, fontSize: 0, lineHeight: 0}}>
                      &nbsp;
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>

            <Section className="px-8 pt-7 text-center">
              <Img src={hseMpCrestNavy} width="32" height="32" alt="Психоанализ и психоаналитическая психотерапия" className="mx-auto" />

              <Text className="m-0 mt-5 text-[12px] font-bold uppercase" style={{color: BRAND.burgundy, letterSpacing: '0.04em'}}>
                {copy.eyebrow}
              </Text>
              <Heading className="m-0 mt-2 text-[24px] font-bold leading-[30px]" style={{color: BRAND.navy}}>
                {copy.heading}
              </Heading>

              <Text className="m-0 mt-4 text-[16px] font-bold leading-[22px] text-neutral-900">{title}</Text>
              <Text className="m-0 mt-1 text-[13px] leading-[18px] text-neutral-500">
                {date} · {speakerName}
              </Text>
            </Section>

            <Section className="px-8 pt-7 pb-2 text-center">
              <Button
                href={ctaUrl}
                className="box-border rounded-lg px-10 py-3 text-[15px] font-bold text-white no-underline"
                style={{backgroundColor: BRAND.navy}}
              >
                {copy.ctaLabel}
              </Button>
              <Text className="m-0 mt-4 text-[12px] leading-[18px] text-neutral-500">{note ?? copy.hint}</Text>
            </Section>

            <Hr className="mx-8 mt-8 mb-0 border-neutral-200" />

            <Section className="px-8 py-6 text-center">
              <Img src={hseLogoRound} width="28" height="28" alt="НИУ ВШЭ" className="mx-auto" />
              <Text className="m-0 mt-3 text-[11px] leading-[16px] text-neutral-400">
                Магистерская программа «Психоанализ и психоаналитическая терапия» · НИУ ВШЭ
                <br />
                Вы получили это письмо, потому что подписаны на рассылку программы. <a href="{{unsubscribe_url}}" className="text-neutral-400 underline">Отписаться</a>
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

SeminarAccess.PreviewProps = {
  kind: 'live',
  title: 'Клинические границы: работа с пограничными состояниями',
  date: '14 сентября, 19:00 мск',
  speakerName: 'Ирина Соколова',
  ctaUrl: 'https://example.com/join',
} as SeminarAccessFields

export default SeminarAccess
