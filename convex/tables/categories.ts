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

export const updateCategory = mutation({
  args: {
    id: v.id('categories'),
    name: v.string(),
    description: v.string(),
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    const {id, ...updates} = args
    await ctx.db.patch(id, updates)
    return id
  },
})

export const deleteCategory = mutation({
  args: {id: v.id('categories')},
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id)
    return args.id
  },
})
