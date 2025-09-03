import {mutation, query} from '@convex/_generated/server'
import {v} from 'convex/values'

export const createCategory = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    slug: v.string(),
  },
  returns: v.id('categories'),
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
  returns: v.array(
    v.object({
      _id: v.id('categories'),
      _creationTime: v.number(),
      name: v.string(),
      description: v.string(),
      slug: v.string(),
    }),
  ),
  handler: async (ctx) => {
    return await ctx.db.query('categories').collect()
  },
})
