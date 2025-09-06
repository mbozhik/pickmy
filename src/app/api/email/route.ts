import {NextRequest, NextResponse} from 'next/server'
import {Resend} from 'resend'

import {CartTemplate, type FormFields as CartFormFields, SUBJECT as CART_SUBJECT} from '@/app/api/email/CartTemplate'
import {ExampleTemplate, type ExampleFormFields, SUBJECT as EXAMPLE_SUBJECT} from '@/app/api/email/ExampleTemplate'

const resend = new Resend(process.env.RESEND_API_KEY)

const EMAIL_LIST = {
  from: 'info@pickmy.ru',
  to: 'bhf2311@gmail.com',
}

type EmailRequest = {
  template: 'cart' | 'example'
  data: CartFormFields | ExampleFormFields
}

export async function POST(req: NextRequest) {
  try {
    const body: EmailRequest = await req.json()
    const {template, data} = body

    if (!template || !data) {
      console.error('Internal Server Error: 400 - Missing template or data')
      return NextResponse.json({error: 'Missing template or data'}, {status: 400})
    }

    let emailConfig: {
      subject: string
      react: React.ReactElement
    }

    switch (template) {
      case 'cart': {
        const cartData = data as CartFormFields
        if (!cartData.orderToken || !cartData.items || !cartData.customerInfo || !cartData.pricing) {
          console.error('Internal Server Error: 400 - Missing required cart fields')
          return NextResponse.json({error: 'Missing required cart fields'}, {status: 400})
        }

        emailConfig = {
          subject: `${CART_SUBJECT} – ${cartData.orderToken}`,
          react: CartTemplate(cartData),
        }
        break
      }

      case 'example': {
        const exampleData = data as ExampleFormFields
        if (!exampleData.data || !exampleData.data.userName || !exampleData.data.message) {
          console.error('Internal Server Error: 400 - Missing required example fields')
          return NextResponse.json({error: 'Missing required example fields'}, {status: 400})
        }

        emailConfig = {
          subject: `${EXAMPLE_SUBJECT} – ${exampleData.data.userName}`,
          react: ExampleTemplate(exampleData),
        }
        break
      }

      default:
        console.error('Internal Server Error: 400 - Unknown template type')
        return NextResponse.json({error: 'Unknown template type'}, {status: 400})
    }

    const {data: emailData, error: emailError} = await resend.emails.send({
      from: `PICKMY <${EMAIL_LIST.from}>`,
      to: EMAIL_LIST.to,
      subject: emailConfig.subject,
      react: emailConfig.react,
    })

    if (emailError) {
      console.error('Error sending email:', emailError)
      return NextResponse.json({message: 'Email sending failed', error: emailError}, {status: 400})
    }

    console.log(`${template} email sent successfully`)

    return NextResponse.json({message: 'Email sent successfully', emailData, template}, {status: 200})
  } catch (error) {
    console.error('Error processing request:', error)
    return NextResponse.json({message: 'Failed to process request', error}, {status: 500})
  }
}
