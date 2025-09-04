import {mutation, query} from '@convex/_generated/server'
import {v} from 'convex/values'

export const createCategory = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    const category = await ctx.db.insert('categories', {
      name: args.name,
      description: args.description,
      slug: args.slug,
    })
    return category
  },
})

export const getCategories = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query('categories').collect()
  },
})
