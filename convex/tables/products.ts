import {mutation, query} from '@convex/_generated/server'
import {v} from 'convex/values'
import type {QueryCtx} from '@convex/_generated/server'
import type {Doc as Table} from '@convex/_generated/dataModel'

const categoryData = v.object({
  _id: v.id('categories'),
  name: v.string(),
  slug: v.string(),
})

const expertData = v.object({
  _id: v.id('experts'),
  name: v.string(),
  role: v.string(),
  username: v.string(),
})

const productWithExtraData = v.object({
  _id: v.id('products'),
  _creationTime: v.number(),
  name: v.string(),
  categoryData: categoryData,
  caption: v.string(),
  expertData: expertData,
  slug: v.string(),
  featured: v.boolean(),
})

async function enrichProductsWithExtraData(ctx: QueryCtx, products: Table<'products'>[]) {
  // Собираем уникальные ID категорий и экспертов
  const categoryIds = [...new Set(products.map((p) => p.category))]
  const expertIds = [...new Set(products.map((p) => p.expert))]
  // Batch запросы для категорий и экспертов
  const [categories, experts] = await Promise.all([Promise.all(categoryIds.map((id) => ctx.db.get(id))), Promise.all(expertIds.map((id) => ctx.db.get(id)))])
  // Создаем Map для быстрого поиска
  const categoryMap = new Map(categories.filter(Boolean).map((c) => [c!._id, c!]))
  const expertMap = new Map(experts.filter(Boolean).map((e) => [e!._id, e!]))

  // Объединяем продукты с категориями и экспертами
  return products.map((product) => {
    const category = categoryMap.get(product.category)
    const expert = expertMap.get(product.expert)

    if (!category) {
      throw new Error(`Category not found for product ${product.name}`)
    }
    if (!expert) {
      throw new Error(`Expert not found for product ${product.name}`)
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {category: _, expert: __, ...productWithoutRefs} = product
    return {
      ...productWithoutRefs,
      categoryData: {
        _id: category._id,
        name: category.name,
        slug: category.slug,
      },
      expertData: {
        _id: expert._id,
        name: expert.name,
        role: expert.role,
        username: expert.username,
      },
    }
  })
}

export const createProduct = mutation({
  args: {
    name: v.string(),
    category: v.id('categories'),
    caption: v.string(),
    expert: v.id('experts'),
    slug: v.string(),
    featured: v.boolean(),
  },
  returns: v.id('products'),
  handler: async (ctx, args) => {
    const product = await ctx.db.insert('products', {
      name: args.name,
      category: args.category,
      caption: args.caption,
      expert: args.expert,
      slug: args.slug,
      featured: args.featured,
    })
    return product
  },
})

export const getProducts = query({
  args: {},
  returns: v.array(productWithExtraData),
  handler: async (ctx) => {
    const products = await ctx.db.query('products').collect()
    return enrichProductsWithExtraData(ctx, products)
  },
})

export const getProductsFeatured = query({
  args: {},
  returns: v.array(productWithExtraData),
  handler: async (ctx) => {
    const products = await ctx.db
      .query('products')
      .withIndex('by_featured', (q) => q.eq('featured', true))
      .take(12)

    return enrichProductsWithExtraData(ctx, products)
  },
})

export const getProductsByCategory = query({
  args: {categoryId: v.id('categories')},
  returns: v.array(productWithExtraData),
  handler: async (ctx, args) => {
    const products = await ctx.db
      .query('products')
      .withIndex('by_category', (q) => q.eq('category', args.categoryId))
      .collect()

    return enrichProductsWithExtraData(ctx, products)
  },
})

export const getProductsByExpert = query({
  args: {expertId: v.id('experts')},
  returns: v.array(productWithExtraData),
  handler: async (ctx, args) => {
    const products = await ctx.db
      .query('products')
      .withIndex('by_expert', (q) => q.eq('expert', args.expertId))
      .collect()

    return enrichProductsWithExtraData(ctx, products)
  },
})

export const getProductBySlug = query({
  args: {slug: v.string()},
  returns: v.union(productWithExtraData, v.null()),
  handler: async (ctx, args) => {
    const product = await ctx.db
      .query('products')
      .withIndex('by_slug', (q) => q.eq('slug', args.slug))
      .unique()

    if (!product) {
      return null
    }

    const enrichedProducts = await enrichProductsWithExtraData(ctx, [product])
    return enrichedProducts[0]
  },
})
