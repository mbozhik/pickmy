import * as React from 'react'
import {Body, Container, Head, Heading, Html, Preview, Section, Text, Tailwind} from '@react-email/components'

export const SUBJECT = 'Новая заявка на регистрацию эксперта'

export type FormFields = {
  name: string
  email: string
  contact: string
}

const StarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" fill="none" viewBox="0 0 100 100">
    <path fill="#FFF" d="m100 48.906-29.922 5.157c-7.734 1.328-13.75 7.5-14.766 15.312L51.094 100l-5.157-29.922c-1.328-7.734-7.5-13.75-15.312-14.766L0 51.094l29.922-5.157c7.734-1.328 13.75-7.5 14.765-15.312L48.907 0l5.156 29.922c1.328 7.734 7.5 13.75 15.312 14.765L100 48.907Z" />
  </svg>
)

export const ExpertApplicationTemplate = ({name, email, contact}: FormFields) => {
  const previewText = `Новая заявка на регистрацию эксперта: ${name}`

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="mx-auto my-auto font-sans bg-white">
          <Container className="bg-white my-8 mx-auto p-0 max-w-[600px]">
            {/* Header with Star Icon */}
            <Section className="bg-neutral-900 text-center py-8 px-6 rounded-lg mb-0">
              <div style={{display: 'flex', justifyContent: 'center', marginBottom: '20px'}}>
                <StarIcon />
              </div>
              <Heading className="text-white text-[36px] font-bold m-0">PICKMY</Heading>
            </Section>

            {/* Application Header */}
            <Section className="text-center pt-8 pb-4 px-6 mb-0">
              <Heading className="text-neutral-900 text-[28px] font-semibold m-0 mb-2">Новая заявка на регистрацию эксперта</Heading>
              <Text className="text-neutral-600 text-[14px] m-0">
                {new Date().toLocaleString('ru-RU', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </Section>

            {/* Expert Info */}
            <Section className="mb-6">
              <div className="bg-neutral-100 rounded-lg p-4 border border-neutral-200">
                <Heading className="text-neutral-800 text-[16px] font-medium m-0 mb-4">Информация о кандидате</Heading>
                <div className="bg-white rounded-md p-4 border border-neutral-200">
                  <Text className="text-neutral-900 text-[14px] leading-[22px] m-0 mb-3">
                    <span className="text-neutral-700 font-normal">Имя:</span> {name}
                  </Text>
                  <Text className="text-neutral-900 text-[14px] leading-[22px] m-0 mb-3">
                    <span className="text-neutral-700 font-normal">Email:</span> {email}
                  </Text>
                  <Text className="text-neutral-900 text-[14px] leading-[22px] m-0">
                    <span className="text-neutral-700 font-normal">Контакт:</span> {contact}
                  </Text>
                </div>
              </div>
            </Section>

            {/* Next Steps */}
            <Section className="mb-6">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <Heading className="text-blue-800 text-[16px] font-medium m-0 mb-4">Следующие шаги</Heading>
                <div className="bg-white rounded-md p-4 border border-blue-200">
                  <Text className="text-blue-900 text-[14px] leading-[22px] m-0 mb-3">1. Свяжитесь с кандидатом в течение 24 часов</Text>
                  <Text className="text-blue-900 text-[14px] leading-[22px] m-0 mb-3">2. Проверьте квалификацию и портфолио (если указано)</Text>
                  <Text className="text-blue-900 text-[14px] leading-[22px] m-0 mb-3">3. Организуйте собеседование при необходимости</Text>
                  <Text className="text-blue-900 text-[14px] leading-[22px] m-0">4. При успешном рассмотрении активируйте аккаунт эксперта</Text>
                </div>
              </div>
            </Section>

            {/* Footer */}
            <Section className="text-center py-6 px-6 border-t border-neutral-200">
              <Text className="text-neutral-500 text-[12px] leading-[18px] m-0">
                Уведомление о новой заявке на платформе{' '}
                <a href="https://pickmy.ru/for-experts" target="_blank" className="text-neutral-600 no-underline">
                  pickmy.ru/for-experts
                </a>
              </Text>
              <Text className="text-neutral-400 text-[11px] leading-[16px] m-0 mt-2">Не отвечайте на это письмо напрямую</Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

ExpertApplicationTemplate.PreviewProps = {
  name: 'Анна Смирнова',
  email: 'anna.smirnova@example.com',
  contact: '+7 925 123 45 67',
} as FormFields

export default ExpertApplicationTemplate
