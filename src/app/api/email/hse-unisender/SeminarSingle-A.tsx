import * as React from 'react'
import {Body, Button, Container, Head, Heading, Hr, Html, Img, Preview, Section, Text, Tailwind} from '@react-email/components'
import {BRAND, hseMpCrestWhite, hseLogoRound} from './assets'

export const SUBJECT = 'Семинар: {{тема}} — {{дата}}'

export type SeminarSingleFields = {
  format: string
  date: string
  title: string
  speakerName: string
  speakerTitle: string
  description: string
  ctaLabel: string
  ctaUrl: string
}

export const SeminarSingleA = ({format, date, title, speakerName, speakerTitle, description, ctaLabel, ctaUrl}: SeminarSingleFields) => {
  const previewText = `${title} — ${speakerName}, ${date}`

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="mx-auto my-auto bg-[#FAF7F2]" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'}}>
          <Container className="mx-auto my-8 max-w-[600px] bg-white p-0">
            {/* Hero: тёмно-синий блок программы + белая эмблема + формат-плашка + заголовок */}
            <Section className="px-8 pt-8 pb-10" style={{backgroundColor: BRAND.navy}}>
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

              <div className="mt-8 inline-block rounded-full px-3 py-1" style={{backgroundColor: BRAND.burgundy}}>
                <Text className="m-0 text-[11px] font-bold uppercase text-white" style={{letterSpacing: '0.04em'}}>
                  {format}
                </Text>
              </div>

              <Heading className="m-0 mt-4 text-[30px] font-bold leading-[36px] text-white">{title}</Heading>
              <Text className="m-0 mt-3 text-[14px] text-white/80">{date}</Text>
            </Section>

            {/* Спикер */}
            <Section className="px-8 pt-6">
              <table role="presentation" width="100%" cellPadding="0" cellSpacing="0">
                <tbody>
                  <tr>
                    <td width="4" style={{backgroundColor: BRAND.mustard}}>
                      &nbsp;
                    </td>
                    <td style={{paddingLeft: '16px'}}>
                      <Text className="m-0 text-[16px] font-bold leading-[20px]" style={{color: BRAND.navy}}>
                        {speakerName}
                      </Text>
                      <Text className="m-0 mt-1 text-[13px] leading-[18px] text-neutral-600">{speakerTitle}</Text>
                    </td>
                  </tr>
                </tbody>
              </table>
            </Section>

            {/* Описание */}
            <Section className="px-8 pt-6 pb-2">
              <Text className="m-0 text-[15px] leading-[24px] text-neutral-800">{description}</Text>
            </Section>

            {/* CTA */}
            <Section className="px-8 pt-6 pb-10 text-center">
              <Button href={ctaUrl} className="box-border rounded-lg px-8 py-3 text-[15px] font-bold text-white no-underline" style={{backgroundColor: BRAND.burgundy}}>
                {ctaLabel}
              </Button>
            </Section>

            <Hr className="m-0 border-neutral-200" />

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

SeminarSingleA.PreviewProps = {
  format: 'Трёхдневный онлайн-семинар',
  date: '14–16 сентября 2026',
  title: 'Клинические границы: работа с пограничными состояниями',
  speakerName: 'Ирина Соколова',
  speakerTitle: 'Тренинг-аналитик, супервизор Московской психоаналитической ассоциации',
  description:
    'Разберём, как распознать пограничную структуру личности в первой встрече, что отличает её от невротической и психотической организации, и какие технические модификации требует сеттинг при работе с не-невротическими пациентами. Семинар построен на разборе клинических случаев и открытой дискуссии.',
  ctaLabel: 'Записаться на семинар',
  ctaUrl: 'https://example.com/seminar',
} as SeminarSingleFields

export default SeminarSingleA
