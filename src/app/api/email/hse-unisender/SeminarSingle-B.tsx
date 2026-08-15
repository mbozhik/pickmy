import * as React from 'react'
import {Body, Button, Container, Head, Heading, Hr, Html, Img, Preview, Section, Text, Tailwind} from '@react-email/components'
import {BRAND, hseMpCrestNavy, hseLogoRound} from './assets'

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

const STRIPE_COLORS = [BRAND.navy, BRAND.burgundy, BRAND.mustard, BRAND.teal, BRAND.plum]

export const SeminarSingleB = ({format, date, title, speakerName, speakerTitle, description, ctaLabel, ctaUrl}: SeminarSingleFields) => {
  const previewText = `${title} — ${speakerName}, ${date}`

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="mx-auto my-auto bg-[#FAF7F2]" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'}}>
          <Container className="mx-auto my-8 max-w-[600px] bg-white p-0" style={{border: '1px solid #EEE7DC'}}>
            {/* Цветная "спектр"-полоса — отсылка к фирменным вертикальным полосам программы, но email-safe (просто div-блоки, без blend-режимов) */}
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

            {/* Шапка: герб программы + словесный блок в фирменном серифе */}
            <Section className="px-8 pt-7 pb-2">
              <table role="presentation" width="100%" cellPadding="0" cellSpacing="0">
                <tbody>
                  <tr>
                    <td width="40">
                      <Img src={hseMpCrestNavy} width="32" height="32" alt="Психоанализ и психоаналитическая психотерапия" />
                    </td>
                    <td style={{verticalAlign: 'middle'}}>
                      <Text className="m-0 text-[11px] uppercase leading-[14px]" style={{fontFamily: 'Georgia, "Times New Roman", serif', letterSpacing: '0.06em', color: BRAND.navy}}>
                        Психоанализ и психоаналитическая психотерапия
                      </Text>
                    </td>
                  </tr>
                </tbody>
              </table>
            </Section>

            {/* Заголовок — крупный, тёмно-синий, без фото/подложки */}
            <Section className="px-8 pt-4">
              <Text className="m-0 text-[12px] font-bold uppercase" style={{color: BRAND.burgundy, letterSpacing: '0.04em'}}>
                {format}
              </Text>
              <Heading className="m-0 mt-2 text-[28px] font-bold leading-[34px]" style={{color: BRAND.navy}}>
                {title}
              </Heading>
              <Text className="m-0 mt-3 text-[13px] leading-[18px] text-neutral-500">
                {date} · {speakerName}
              </Text>
            </Section>

            <Hr className="mx-8 my-6 border-neutral-200" />

            {/* Спикер и описание */}
            <Section className="px-8">
              <Text className="m-0 text-[15px] font-bold leading-[20px]" style={{color: BRAND.navy}}>
                {speakerName}
              </Text>
              <Text className="m-0 mt-1 text-[13px] leading-[18px] text-neutral-500">{speakerTitle}</Text>
              <Text className="m-0 mt-4 text-[15px] leading-[24px] text-neutral-800">{description}</Text>
            </Section>

            {/* CTA — контурная кнопка вместо заливки, спокойнее для светлого макета */}
            <Section className="px-8 pt-7 pb-10">
              <Button
                href={ctaUrl}
                className="box-border rounded-lg px-8 py-3 text-[15px] font-bold no-underline"
                style={{border: `2px solid ${BRAND.navy}`, color: BRAND.navy}}
              >
                {ctaLabel}
              </Button>
            </Section>

            <Hr className="m-0 border-neutral-200" />

            {/* Футер */}
            <Section className="px-8 py-6 text-center">
              <Img src={hseLogoRound} width="32" height="32" alt="НИУ ВШЭ" className="mx-auto" />
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

SeminarSingleB.PreviewProps = {
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

export default SeminarSingleB
