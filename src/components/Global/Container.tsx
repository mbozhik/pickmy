import {cn} from '@/lib/utils'

export const BOX = {
  container: 'w-[70%] xl:w-[80%] sm:w-auto mx-auto sm:mx-2.5',
  header: 'w-[68%] xl:w-[78%] sm:w-auto mx-auto sm:mx-3',
}

export const CONTAINER = {
  height: 'min-h-[calc(100vh-125px)] sm:min-h-[calc(100vh-140px)]',
  offset: {
    small: 'pt-20 xl:pt-16 sm:pt-14',
    large: 'pt-28 xl:pt-24 sm:pt-20',
  },
  spacing: {
    small: 'space-y-14 xl:space-y-10 sm:space-y-8',
    medium: 'space-y-20 xl:space-y-16 sm:space-y-14',
  },
}

export default function Container({children, offset = 'large', spacing = 'medium', className}: {children: React.ReactNode; offset?: 'small' | 'large'; spacing?: 'small' | 'medium'; className?: string}) {
  return <main className={cn(BOX.container, CONTAINER.height, CONTAINER.offset[offset], CONTAINER.spacing[spacing], className)}>{children}</main>
}
