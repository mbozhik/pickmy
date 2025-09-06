import {mutation, query} from '@convex/_generated/server'
import {v} from 'convex/values'

export const createExpert = mutation({
  args: {
    name: v.string(),
    role: v.string(),
    username: v.string(),
    link: v.string(),
    featured: v.boolean(),
    userId: v.id('users'),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const expert = await ctx.db.insert('experts', {
      name: args.name,
      role: args.role,
      username: args.username,
      link: args.link,
      featured: args.featured,
      userId: args.userId,
      isActive: args.isActive,
    })
    return expert
  },
})

export const getExperts = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query('experts')
      .filter((q) => q.eq(q.field('isActive'), true))
      .collect()
  },
})

export const getAllExperts = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query('experts').collect()
  },
})

export const updateExpert = mutation({
  args: {
    id: v.id('experts'),
    name: v.string(),
    role: v.string(),
    username: v.string(),
    link: v.string(),
    featured: v.boolean(),
    userId: v.id('users'),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const {id, ...updates} = args
    await ctx.db.patch(id, updates)
    return id
  },
})

export const deleteExpert = mutation({
  args: {id: v.id('experts')},
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id)
    return args.id
  },
})

export const getFeaturedExperts = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query('experts')
      .withIndex('by_featured', (q) => q.eq('featured', true))
      .filter((q) => q.eq(q.field('isActive'), true))
      .take(8)
  },
})

export const getExpertByUsername = query({
  args: {username: v.string()},
  handler: async (ctx, args) => {
    const expert = await ctx.db
      .query('experts')
      .withIndex('by_username', (q) => q.eq('username', args.username))
      .filter((q) => q.eq(q.field('isActive'), true))
      .unique()

    return expert
  },
})

export const getExpertByUserId = query({
  args: {userId: v.id('users')},
  handler: async (ctx, args) => {
    const expert = await ctx.db
      .query('experts')
      .withIndex('by_userId', (q) => q.eq('userId', args.userId))
      .unique()

    return expert
  },
})
