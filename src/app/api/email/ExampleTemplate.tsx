import * as React from 'react'
import {Body, Container, Head, Heading, Html, Preview, Section, Text, Tailwind} from '@react-email/components'

export const SUBJECT = 'Пример уведомления'

export type ExampleData = {
  userName: string
  message: string
  actionType: 'welcome' | 'notification' | 'reminder'
  timestamp?: string
}

export type ExampleFormFields = {
  data: ExampleData
}

const StarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" fill="none" viewBox="0 0 100 100">
    <path fill="#FFF" d="m100 48.906-29.922 5.157c-7.734 1.328-13.75 7.5-14.766 15.312L51.094 100l-5.157-29.922c-1.328-7.734-7.5-13.75-15.312-14.766L0 51.094l29.922-5.157c7.734-1.328 13.75-7.5 14.765-15.312L48.907 0l5.156 29.922c1.328 7.734 7.5 13.75 15.312 14.765L100 48.907Z" />
  </svg>
)

const getActionEmoji = (actionType: ExampleData['actionType']) => {
  switch (actionType) {
    case 'welcome':
      return '👋'
    case 'notification':
      return '🔔'
    case 'reminder':
      return '⏰'
    default:
      return '📧'
  }
}

const getActionTitle = (actionType: ExampleData['actionType']) => {
  switch (actionType) {
    case 'welcome':
      return 'Добро пожаловать!'
    case 'notification':
      return 'Уведомление'
    case 'reminder':
      return 'Напоминание'
    default:
      return 'Сообщение'
  }
}

export const ExampleTemplate = ({data}: ExampleFormFields) => {
  const previewText = `${getActionTitle(data.actionType)} для ${data.userName}`

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

            {/* Notification Header */}
            <Section className="text-center pt-8 pb-4 px-6 mb-0">
              <div className="flex items-center justify-center gap-3 mb-2">
                <Text className="text-[28px] m-0">{getActionEmoji(data.actionType)}</Text>
                <Heading className="text-neutral-900 text-[28px] font-semibold m-0">{getActionTitle(data.actionType)}</Heading>
              </div>
              {data.timestamp && <Text className="text-neutral-600 text-[14px] m-0">{data.timestamp}</Text>}
            </Section>

            {/* User Greeting */}
            <Section className="mb-6">
              <div className="bg-neutral-100 rounded-lg p-4 border border-neutral-200">
                <Heading className="text-neutral-800 text-[16px] font-medium m-0 mb-4">Приветствие</Heading>
                <div className="bg-white rounded-md p-4 border border-neutral-200">
                  <Text className="text-neutral-900 text-[14px] leading-[22px] m-0">
                    <span className="text-neutral-700 font-normal">Имя пользователя:</span> {data.userName}
                  </Text>
                </div>
              </div>
            </Section>

            {/* Message Content */}
            <Section className="mb-6">
              <div className="bg-neutral-100 rounded-lg p-4 border border-neutral-200">
                <Heading className="text-neutral-800 text-[16px] font-medium m-0 mb-4">Сообщение</Heading>
                <div className="bg-white rounded-md p-4 border border-neutral-200">
                  <Text className="text-neutral-900 text-[14px] leading-[22px] m-0">{data.message}</Text>
                </div>
              </div>
            </Section>

            {/* Action Details */}
            <Section className="mb-6">
              <div className="bg-neutral-100 rounded-lg p-4 border border-neutral-200">
                <Heading className="text-neutral-800 text-[16px] font-medium m-0 mb-4">Детализация действия</Heading>
                <div className="bg-white rounded-md p-4 border border-neutral-200">
                  <div className="flex justify-between items-center">
                    <Text className="text-neutral-700 text-[14px] m-0">Тип действия:</Text>
                    <Text className="text-neutral-900 text-[14px] font-medium m-0">{getActionTitle(data.actionType)}</Text>
                  </div>
                  <div className="flex justify-between items-center mt-3">
                    <Text className="text-neutral-700 text-[14px] m-0">Статус:</Text>
                    <Text className="text-neutral-900 text-[14px] font-medium m-0">Доставлено</Text>
                  </div>
                  {data.timestamp && (
                    <div className="flex justify-between items-center mt-3">
                      <Text className="text-neutral-700 text-[14px] m-0">Время отправки:</Text>
                      <Text className="text-neutral-900 text-[14px] font-medium m-0">{data.timestamp}</Text>
                    </div>
                  )}
                </div>
              </div>
            </Section>

            {/* Footer */}
            <Section className="text-center py-6 px-6 border-t border-neutral-200">
              <Text className="text-neutral-500 text-[12px] leading-[18px] m-0">
                Тестовое уведомление от платформы{' '}
                <a href="https://pickmy.ru" target="_blank" className="text-neutral-600 no-underline">
                  pickmy.ru
                </a>
              </Text>
              <Text className="text-neutral-400 text-[11px] leading-[16px] m-0 mt-2">Это демонстрационный email-шаблон</Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

ExampleTemplate.PreviewProps = {
  data: {
    userName: 'София Дроздова',
    message: 'Добро пожаловать на платформу PICKMY! Мы рады видеть вас среди наших экспертов. Ваш профиль успешно создан и готов к работе. Теперь вы можете добавлять свои товары и начинать помогать клиентам.',
    actionType: 'welcome' as const,
    timestamp: new Date().toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
  },
} as ExampleFormFields

export default ExampleTemplate
