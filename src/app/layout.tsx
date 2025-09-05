export {metadata} from '@/lib/layout-config'
import {inter, playfair} from '@/lib/layout-config'
import '@/app/globals.css'

import {cn} from '@/lib/utils'
import {ruRU} from '@clerk/localizations'

import Header from '~/Global/Header'
import Footer from '~/Global/Footer'
import {Toaster} from '~/core/sonner'

import YandexMetrika from '~/Global/Analytics'
import {ClerkProvider} from '@clerk/nextjs'
import ConvexProvider from '@/lib/convex-provider'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ru" className="scroll-smooth">
      <body className={cn([inter.variable, playfair.variable], 'bg-background text-foreground', 'font-sans antialiased')}>
        <ClerkProvider localization={ruRU}>
          <ConvexProvider>
            <Header />
            {children}
            <Footer />

            <Toaster />
          </ConvexProvider>
        </ClerkProvider>

        {process.env.NODE_ENV === 'production' && <YandexMetrika />}
      </body>
    </html>
  )
}
