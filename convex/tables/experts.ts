import {mutation, query} from '../_generated/server'
import {v} from 'convex/values'

export const createExpert = mutation({
  args: {
    name: v.string(),
    role: v.string(),
    username: v.string(),
    link: v.string(),
    featured: v.boolean(),
  },
  returns: v.id('experts'),
  handler: async (ctx, args) => {
    const expert = await ctx.db.insert('experts', {
      name: args.name,
      role: args.role,
      username: args.username,
      link: args.link,
      featured: args.featured,
    })
    return expert
  },
})

export const getExperts = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id('experts'),
      _creationTime: v.number(),
      name: v.string(),
      role: v.string(),
      username: v.string(),
      link: v.string(),
      featured: v.boolean(),
    }),
  ),
  handler: async (ctx) => {
    return await ctx.db.query('experts').collect()
  },
})

export const getFeaturedExperts = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id('experts'),
      _creationTime: v.number(),
      name: v.string(),
      role: v.string(),
      username: v.string(),
      link: v.string(),
      featured: v.boolean(),
    }),
  ),
  handler: async (ctx) => {
    return await ctx.db
      .query('experts')
      .filter((q) => q.eq(q.field('featured'), true))
      .take(8)
  },
})
