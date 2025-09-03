import {mutation, query} from '@convex/_generated/server'
import {v} from 'convex/values'

export const createProduct = mutation({
  args: {
    name: v.string(),
    category: v.string(),
    caption: v.string(),
    slug: v.string(),
    featured: v.boolean(),
  },
  returns: v.id('products'),
  handler: async (ctx, args) => {
    const product = await ctx.db.insert('products', {
      name: args.name,
      category: args.category,
      caption: args.caption,
      slug: args.slug,
      featured: args.featured,
    })
    return product
  },
})

export const getProducts = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id('products'),
      _creationTime: v.number(),
      name: v.string(),
      category: v.string(),
      caption: v.string(),
      slug: v.string(),
      featured: v.boolean(),
    }),
  ),
  handler: async (ctx) => {
    return await ctx.db.query('products').collect()
  },
})

export const getFeaturedProducts = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id('products'),
      _creationTime: v.number(),
      name: v.string(),
      category: v.string(),
      caption: v.string(),
      slug: v.string(),
      featured: v.boolean(),
    }),
  ),
  handler: async (ctx) => {
    return await ctx.db
      .query('products')
      .filter((q) => q.eq(q.field('featured'), true))
      .take(12)
  },
})
