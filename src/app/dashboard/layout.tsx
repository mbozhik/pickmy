import {Metadata} from 'next'

export const metadata: Metadata = {
  title: 'Панель управления',
  robots: {
    index: false,
    follow: false,
  },
}

export default function DashboardLayout({children}: {children: React.ReactNode}) {
  return children
}
