import {cn} from '@/lib/utils'

export const BOX = {
  container: 'w-[70%] xl:w-[85%] sm:w-auto mx-auto sm:mx-2.5',
  header: 'w-[68%] xl:w-[83%] sm:w-auto mx-auto sm:mx-3',
}

export const CONTAINER = {
  spacing: 'space-y-20 xl:space-y-16 sm:space-y-14',
  offset: 'pt-20 xl:pt-16 sm:pt-14',
}

export default function Container({children, className}: {children: React.ReactNode; className?: string}) {
  return <main className={cn(BOX.container, CONTAINER.spacing, CONTAINER.offset, className)}>{children}</main>
}
