'use client'

import {cn} from '@/lib/utils'
import {useMediaQuery} from '@/hooks/use-media-query'

import React from 'react'
import {AnimatePresence, motion, useInView} from 'motion/react'

type Props = {
  type: TypoTypes
  className?: string
  children: React.ReactNode
  animated?: boolean
  by?: 'word' | 'line'
  offset?: number
} // & MotionElementProps

// type MotionElementProps = Omit<HTMLAttributes<HTMLHeadingElement>, 'className' | 'children' | 'onDrag' | 'onDragEnd' | 'onDragStart' | 'onAnimationStart' | 'onAnimationEnd' | 'onAnimationIteration'>

type MotionElementType = {
  [K in TypoTypes]: (typeof motion)[K]
}[TypoTypes]

export type TypoTypes = keyof typeof TYPO_CLASSES

export const TYPO_CLASSES = {
  h1: cn('text-7xl xl:text-6xl sm:text-4xl', '!leading-[1.1]', 'tracking-tighter', 'font-normal sm:font-medium', 'font-sans'),
  h2: cn('text-6xl xl:text-5xl sm:text-4xl', '!leading-[1.1]', 'tracking-tighter', 'font-normal sm:font-medium', 'font-sans'),
  h3: cn('text-3xl sm:text-2xl', 'tracking-tighter', 'font-medium', 'font-sans'),
  h5: cn('text-xl sm:text-lg', 'tracking-tighter', 'font-normal', 'font-sans'),
  p: cn('text-base xl:text-base sm:text-sm', '!leading-[1.35]', 'tracking-tight', 'font-sans'),
  span: cn('text-sm sm:text-xs', 'tracking-tight', 'font-sans'),
} as const

export const H1 = createTypography('h1')
export const H2 = createTypography('h2')
export const H3 = createTypography('h3')
export const H5 = createTypography('h5')
export const P = createTypography('p')
export const SPAN = createTypography('span')

const variants = {
  item: {
    hidden: {
      opacity: 0,
      y: 40,
    },
    visible: (duration: number) => ({
      opacity: 1,
      y: 0,
      transition: {duration},
    }),
  },
  container: {
    hidden: {opacity: 0},
    visible: (stagger: number) => ({
      opacity: 1,
      transition: {staggerChildren: stagger},
    }),
  },
} as const

const variantConfigs = {
  default: {
    item: {
      ...variants.item,
      visible: variants.item.visible(0.4),
    },
    container: {
      ...variants.container,
      visible: variants.container.visible(0.2),
    },
  },
  word: {
    item: {
      ...variants.item,
      visible: variants.item.visible(0.2),
    },
    container: {
      ...variants.container,
      visible: variants.container.visible(0.1),
    },
  },
} as const

const {
  default: {item: defaultVariants, container: containerVariants},
  word: {item: wordVariants, container: wordContainerVariants},
} = variantConfigs

function Typography({type, className, children, animated = true, by = 'line', offset, ...props}: Props) {
  const isDesktop = useMediaQuery('(min-width: 768px)')

  const offsetValue = offset ?? (isDesktop ? 100 : 25)

  const Element = type
  const ref = React.useRef(null)
  const isInView = useInView(ref, {
    once: true,
    margin: `${-offsetValue}px 0px`,
  })

  if (!animated) {
    return (
      <Element className={cn(TYPO_CLASSES[type], className)} {...props}>
        {children}
      </Element>
    )
  }

  const MotionElement = motion[type] as MotionElementType

  if (by === 'word') {
    const processContent = (child: React.ReactNode): React.ReactNode[] => {
      if (typeof child === 'string') {
        return child.split(/(\s+)/).map((part) => part)
      }
      if (React.isValidElement(child)) {
        return [child]
      }
      return []
    }

    const content = React.Children.toArray(children).flatMap(processContent)

    return (
      <AnimatePresence mode="wait">
        <MotionElement
          ref={ref}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={wordContainerVariants} // Use word-specific container variants
          className={cn(TYPO_CLASSES[type], className)}
          // {...(props as MotionElementProps)}
        >
          {content.map((segment, index) => {
            if (React.isValidElement(segment)) {
              return segment
            }
            return (
              <span key={`word-${index}`} className="inline-block overflow-hidden">
                <motion.span variants={wordVariants} className="block whitespace-pre">
                  {segment}
                </motion.span>
              </span>
            )
          })}
        </MotionElement>
      </AnimatePresence>
    )
  }

  return (
    <AnimatePresence mode="wait">
      <MotionElement
        ref={ref}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'} // trigger when in view
        variants={containerVariants}
        className={cn(TYPO_CLASSES[type], className)}
        // {...(props as MotionElementProps)}
      >
        <span className="block overflow-hidden">
          <motion.span variants={defaultVariants} className="block">
            {children}
          </motion.span>
        </span>
      </MotionElement>
    </AnimatePresence>
  )
}

function createTypography(type: TypoTypes) {
  const Component = ({className, children, animated, by, offset, ...props}: Omit<Props, 'type'>) => (
    <Typography type={type} className={className} animated={animated} by={by} offset={offset} {...props}>
      {children}
    </Typography>
  )
  Component.displayName = `Typography(${type.toUpperCase()})`
  return Component
}
