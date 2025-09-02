export {metadata} from '@/lib/layout-config'
import {inter, playfair} from '@/lib/layout-config'
import '@/app/globals.css'

import {cn} from '@/lib/utils'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ru">
      <body className={cn([inter.variable, playfair.variable], 'bg-background text-foreground', 'font-sans antialiased')}>{children}</body>
    </html>
  )
}
