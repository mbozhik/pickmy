import type {Metadata} from 'next'

import {Inter, Playfair_Display} from 'next/font/google'

export const metadata: Metadata = {
  title: {
    template: '%s — PickMy',
    default: 'PickMy',
  },
}

export const inter = Inter({
  variable: '--font-inter',
  preload: true,
  subsets: ['cyrillic'],
})

export const playfair = Playfair_Display({
  variable: '--font-playfair',
  preload: true,
  subsets: ['cyrillic'],
})
