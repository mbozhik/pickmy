export {metadata} from '@/lib/layout-config'
import {inter, playfair} from '@/lib/layout-config'
import '@/app/globals.css'

import {cn} from '@/lib/utils'

import Header from '~/Global/Header'
import Footer from '~/Global/Footer'

import YandexMetrika from '~/Global/Analytics'
import {ConvexProvider} from '@/lib/convex-provider'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ru" className="scroll-smooth">
      <body className={cn([inter.variable, playfair.variable], 'bg-background text-foreground', 'font-sans antialiased')}>
        <ConvexProvider>
          <Header />
          {children}
          <Footer />
        </ConvexProvider>

        {process.env.NODE_ENV === 'production' && <YandexMetrika />}
      </body>
    </html>
  )
}
