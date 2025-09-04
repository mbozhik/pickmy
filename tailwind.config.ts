import type {Config} from 'tailwindcss'
import defaultTheme from 'tailwindcss/defaultTheme'

export default {
  theme: {
    screens: {
      xl: {max: '1780px'},
      sm: {max: '500px'},
    },
    fontFamily: {
      sans: ['var(--font-inter)', ...defaultTheme.fontFamily.sans],
      serif: ['var(--font-playfair)', ...defaultTheme.fontFamily.serif],
    },
    colors: ({colors}) => ({
      background: colors.white,
      foreground: colors.black,

      gray: {
        DEFAULT: '#F8F8F8',
      },
      neutral: colors.neutral,

      destructive: {
        DEFAULT: '#dc2626',
        foreground: '#ffffff',
      },
      success: {
        DEFAULT: '#16a34a',
        foreground: '#ffffff',
      },

      transparent: colors.transparent,
    }),
    extend: {},
  },
  plugins: [],
} satisfies Config
