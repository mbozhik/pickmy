import {internalMutation, mutation, query, type QueryCtx} from '@convex/_generated/server'
import {UserJSON} from '@clerk/backend'
import {v, Validator} from 'convex/values'

export type Role = 'user' | 'expert' | 'admin'

export const current = query({
  args: {},
  handler: async (ctx) => {
    return await getCurrentUser(ctx)
  },
})

export const upsertFromClerk = internalMutation({
  args: {data: v.any() as Validator<UserJSON>},
  async handler(ctx, {data}) {
    const primaryEmail = data.email_addresses?.find((email) => email.email_address && (email.verification?.status === 'verified' || !email.verification))?.email_address

    if (!primaryEmail) {
      throw new Error('No valid email address found for user')
    }

    const userAttributes = {
      externalId: data.id,
      email: primaryEmail,
      role: 'user' as Role,
    }

    const user = await userByExternalId(ctx, data.id)
    if (user === null) {
      await ctx.db.insert('users', userAttributes)
    } else {
      await ctx.db.patch(user._id, userAttributes)
    }
  },
})

export const deleteFromClerk = internalMutation({
  args: {clerkUserId: v.string()},
  async handler(ctx, {clerkUserId}) {
    const user = await userByExternalId(ctx, clerkUserId)

    if (user !== null) {
      await ctx.db.delete(user._id)
    } else {
      console.warn(`Can't delete user, there is none for Clerk user ID: ${clerkUserId}`)
    }
  },
})

export async function getCurrentUserOrThrow(ctx: QueryCtx) {
  const userRecord = await getCurrentUser(ctx)
  if (!userRecord) throw new Error("Can't get current user")
  return userRecord
}

export async function getCurrentUser(ctx: QueryCtx) {
  const identity = await ctx.auth.getUserIdentity()
  if (identity === null) {
    return null
  }
  return await userByExternalId(ctx, identity.subject)
}

export const getAllUsers = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query('users').collect()
  },
})

export const updateUser = mutation({
  args: {
    id: v.id('users'),
    email: v.string(),
    role: v.union(v.literal('user'), v.literal('expert'), v.literal('admin')),
  },
  handler: async (ctx, args) => {
    const {id, ...updates} = args
    await ctx.db.patch(id, updates)
    return id
  },
})

export const deleteUser = mutation({
  args: {id: v.id('users')},
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id)
    return args.id
  },
})

async function userByExternalId(ctx: QueryCtx, externalId: string) {
  return await ctx.db
    .query('users')
    .withIndex('byExternalId', (q) => q.eq('externalId', externalId))
    .unique()
}
