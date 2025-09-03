import {defineSchema, defineTable} from 'convex/server'
import {v} from 'convex/values'

export default defineSchema({
  products: defineTable({
    name: v.string(),
    category: v.id('categories'),
    expert: v.id('experts'),
    caption: v.string(),
    featured: v.boolean(),
    slug: v.string(),
  })
    .index('by_category', ['category'])
    .index('by_featured', ['featured'])
    .index('by_expert', ['expert']),

  categories: defineTable({
    name: v.string(),
    description: v.string(),
    slug: v.string(),
  }),

  experts: defineTable({
    name: v.string(),
    role: v.string(),
    username: v.string(),
    link: v.string(),
    featured: v.boolean(),
  }),
})
