'use client'

import {ChevronDown} from 'lucide-react'

import {useState} from 'react'
import {motion, AnimatePresence} from 'motion/react'

import {cn} from '@/lib/utils'

import {H2, H5, TYPO_CLASSES} from '~/UI/Typography'

export const BLOCK_BOX = 'w-[45vw] xl:w-[55vw] sm:w-auto mx-auto'

const DATA = [
  {
    question: 'Как начать работать экспертом на PickMy?',
    answer: 'Зарегистрируйтесь на платформе, заполните профиль специалиста и создайте свою первую витрину товаров. Процесс занимает не более 15 минут.',
  },
  {
    question: 'Какой размер комиссии я буду получать?',
    answer: 'Вы получаете до 10% комиссии от каждой продажи товаров из вашей витрины. Средняя комиссия наших экспертов составляет 5 000 рублей в месяц.',
  },
  {
    question: 'Нужна ли мне лицензия или специальное разрешение?',
    answer: 'Для большинства специальностей лицензия не требуется. Мы рекомендуем консультироваться с юристом по вашему региону.',
  },
  {
    question: 'Как делиться своей витриной с клиентами?',
    answer: 'Получите персональную ссылку на витрину и делитесь ею в социальных сетях, на сайте или в личных сообщениях клиентам.',
  },
  {
    question: 'Что делать, если клиенту не подойдёт товар?',
    answer: 'Мы гарантируем возврат товаров в течение 30 дней. Вы можете рекомендовать альтернативные продукты из нашей базы.',
  },
]

function Item({question, answer, index}: {question: string; answer: string; index: number}) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <motion.div
      initial={{opacity: 0, y: 10}}
      animate={{opacity: 1, y: 0}}
      transition={{
        duration: 0.3,
        delay: index * 0.15,
        ease: 'easeOut',
      }}
      className={cn('bg-background text-foreground flex flex-col rounded-xl border border-neutral-200 shadow-sm', 'transition-all duration-200 ease-in-out', isOpen ? 'shadow-md' : 'hover:shadow-md')}
    >
      <button type="button" onClick={() => setIsOpen(!isOpen)} className="flex w-full items-center justify-between gap-4 px-6 sm:px-4 py-4 sm:py-3 cursor-pointer">
        <H5 className={cn('font-medium tracking-tight sm:text-left sm:leading-[1.25]', 'duration-200', !isOpen ? 'text-foreground' : 'text-foreground/70')}>{question}</H5>

        <motion.div
          animate={{
            rotate: isOpen ? 180 : 0,
            scale: isOpen ? 1.1 : 1,
          }}
          transition={{
            duration: 0.3,
            ease: 'easeInOut',
          }}
          className={cn('shrink-0 rounded-full p-0.5', 'transition-colors duration-200', !isOpen ? 'text-foreground' : 'text-foreground/70')}
        >
          <ChevronDown className="size-4" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{height: 0, opacity: 0}}
            animate={{
              height: 'auto',
              opacity: 1,
              transition: {
                height: {
                  duration: 0.4,
                  ease: [0.04, 0.62, 0.23, 0.98],
                },
                opacity: {
                  duration: 0.25,
                  delay: 0.1,
                },
              },
            }}
            exit={{
              height: 0,
              opacity: 0,
              transition: {
                height: {
                  duration: 0.3,
                  ease: 'easeInOut',
                },
                opacity: {
                  duration: 0.25,
                },
              },
            }}
          >
            <div className="px-6 pr-12 py-4 border-t border-neutral-300">
              <motion.p
                initial={{y: -8, opacity: 0}}
                animate={{y: 0, opacity: 1}}
                exit={{y: -8, opacity: 0}}
                transition={{
                  duration: 0.3,
                  ease: 'easeOut',
                }}
                className={cn(TYPO_CLASSES.p, !isOpen ? 'text-neutral-800/90' : 'text-foreground', '!leading-[1.4]')}
              >
                {answer}
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function FAQ() {
  return (
    <section data-section="faq" className="w-full overflow-hidden py-16 space-y-10 sm:space-y-6">
      <div className="space-y-1.5 sm:space-y-2 text-center sm:text-left">
        <H2>Часто задаваемые вопросы</H2>
        <H5 className="font-light">Ответы на самые популярные вопросы от экспертов</H5>
      </div>

      <div className={cn(BLOCK_BOX, 'space-y-2.5')}>
        {DATA.map((faq, idx) => (
          <Item question={faq.question} answer={faq.answer} index={idx} key={idx} />
        ))}
      </div>
    </section>
  )
}
