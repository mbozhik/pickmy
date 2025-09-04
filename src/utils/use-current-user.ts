'use client'

import {api} from '@convex/_generated/api'

import {useUser} from '@clerk/nextjs'
import {useQuery} from 'convex/react'

export function useCurrentUser() {
  const {user: clerkUser} = useUser()
  const convexUser = useQuery(api.tables.users.current)

  return {
    clerkUser,
    convexUser,
    isLoading: !clerkUser || convexUser === undefined,
    role: convexUser?.role,
    isExpert: convexUser?.role === 'expert',
    isAdmin: convexUser?.role === 'admin',
    isExpertOrAdmin: convexUser?.role === 'expert' || convexUser?.role === 'admin',
  }
}
