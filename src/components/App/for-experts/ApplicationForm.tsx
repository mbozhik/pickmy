'use client'

import {BLOCK_BOX} from '~~/for-experts/FAQ'

import {cn} from '@/lib/utils'

import {useState} from 'react'
import {useForm} from 'react-hook-form'
import {toast} from 'sonner'

import {Button} from '~/core/button'
import {Card, CardContent} from '~/core/card'
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from '~/core/form'
import {Input} from '~/core/input'
import {H2, H5, SPAN} from '~/UI/Typography'

interface FormData {
  name: string
  email: string
  contact: string
}

export default function ApplicationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<FormData>({
    defaultValues: {
      name: '',
      email: '',
      contact: '',
    },
  })

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/email', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          template: 'expert-application',
          data,
        }),
      })

      if (response.ok) {
        toast.success('Заявка успешно отправлена! Мы свяжемся с вами в течение 24 часов.')
        form.reset()
      } else {
        throw new Error('Failed to submit application')
      }
    } catch (error) {
      console.error('Error submitting application:', error)
      toast.error('Произошла ошибка при отправке заявки. Попробуйте ещё раз.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section id="application-form" data-section="application-form" className="space-y-10 sm:space-y-6">
      <div className="space-y-1.5 sm:space-y-2 text-center sm:text-left">
        <H2>Стать нашим экспертом</H2>
        <H5 className="font-light">Заполните заявку и мы свяжемся с вами для обсуждения условий сотрудничества</H5>
      </div>

      <Card className={cn(BLOCK_BOX, 'sm:py-3')}>
        <CardContent className="p-6 sm:p-3">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                rules={{required: 'Имя обязательно для заполнения'}}
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Имя и фамилия *</FormLabel>
                    <FormControl>
                      <Input placeholder="Иван Иванов" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                rules={{
                  required: 'Email обязателен для заполнения',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Введите корректный email',
                  },
                }}
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Email *</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="expert@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contact"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Номер телефона, WhatsApp или Telegram</FormLabel>
                    <FormControl>
                      <Input placeholder="Номер, @username или ссылка" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="space-y-3">
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Отправка...' : 'Отправить заявку'}
                </Button>

                <SPAN className="text-center text-neutral-800/90">Мы свяжемся с вами в течение 24 часов после получения заявки</SPAN>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </section>
  )
}
