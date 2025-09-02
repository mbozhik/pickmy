import {cn} from '@/lib/utils'

import Link from 'next/link'

type Props = {
  variant: 'solid' | 'outline'
  text: string

  to?: string
  target?: '_self' | '_blank'
  type?: 'button' | 'submit'
  disabled?: boolean

  className?: string
  onClick?: () => void
}

export const BUTTON_STYLES = {
  base: cn('px-10 sm:px-8 py-2.75 sm:py-2.5', 'border rounded-md', 'text-sm sm:text-xs tracking-tight font-sans text-center', 'cursor-pointer active:scale-95 duration-300'),

  button: {
    solid: cn('text-background', 'border-foreground', 'bg-foreground', 'hover:bg-foreground/75'),
    outline: cn('text-background', 'border-background/50', 'bg-background/15 backdrop-blur-[2px] sm:backdrop-blur-[4px]', 'hover:bg-background/25 hover:border-background/60'),
  },
} as const

export default function Button({variant, text, to, target, type, disabled, className, onClick}: Props) {
  const buttonClasses = cn(BUTTON_STYLES.base, BUTTON_STYLES.button[variant], className)

  if (to) {
    return (
      <Link href={to} target={target || '_self'} className={buttonClasses}>
        {text}
      </Link>
    )
  }

  return (
    <button type={type} className={buttonClasses} disabled={disabled} onClick={onClick}>
      {text}
    </button>
  )
}
