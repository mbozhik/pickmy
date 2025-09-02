import {cn} from '@/lib/utils'

import Link from 'next/link'

type Props = {
  variant: 'solid' | 'outline'
  text: string

  to?: string
  type?: 'button' | 'submit'
  disabled?: boolean

  className?: string
  onClick?: () => void
}

export const BUTTON_STYLES = {
  base: cn('px-10 sm:px-8 py-3 sm:py-2.5', 'border rounded-md', 'text-sm sm:text-xs tracking-tight font-sans', 'cursor-pointer active:scale-95 duration-300'),

  button: {
    solid: cn('text-background', 'border-foreground', 'bg-foreground', 'hover:bg-foreground/75'),
    outline: cn('text-background', 'border-background/50', 'bg-background/15 backdrop-blur-[2px] sm:backdrop-blur-[4px]', 'hover:bg-background/25 hover:border-background/60'),
  },
} as const

export default function Button({variant, text, type, disabled, to, className, onClick}: Props) {
  const buttonClasses = cn(BUTTON_STYLES.base, BUTTON_STYLES.button[variant], className)

  if (to) {
    return (
      <Link href={to} className={buttonClasses}>
        {text}
      </Link>
    )
  }

  return (
    <button className={buttonClasses} type={type || 'button'} disabled={disabled} onClick={onClick}>
      {text}
    </button>
  )
}
