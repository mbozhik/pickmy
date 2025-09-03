import {defineSchema, defineTable} from 'convex/server'
import {v} from 'convex/values'

export default defineSchema({
  products: defineTable({
    name: v.string(),
    category: v.string(),
    caption: v.string(),
    featured: v.boolean(),
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
