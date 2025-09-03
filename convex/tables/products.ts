import {mutation, query} from '@convex/_generated/server'
import {v} from 'convex/values'
import type {QueryCtx} from '@convex/_generated/server'
import type {Doc as Table} from '@convex/_generated/dataModel'

const categoryData = v.object({
  _id: v.id('categories'),
  name: v.string(),
  slug: v.string(),
})

const productWithCategoryData = v.object({
  _id: v.id('products'),
  _creationTime: v.number(),
  name: v.string(),
  categoryData: categoryData,
  caption: v.string(),
  slug: v.string(),
  featured: v.boolean(),
})

// Helper функция для обогащения продуктов данными категорий
async function enrichProductsWithCategoryData(ctx: QueryCtx, products: Table<'products'>[]) {
  // Собираем уникальные ID категорий
  const categoryIds = [...new Set(products.map((p) => p.category))]
  // Один batch запрос для всех категорий
  const categories = await Promise.all(categoryIds.map((id) => ctx.db.get(id)))
  // Создаем Map для быстрого поиска
  const categoryMap = new Map(categories.filter(Boolean).map((c) => [c!._id, c!]))

  // Объединяем продукты с категориями
  return products.map((product) => {
    const category = categoryMap.get(product.category)
    if (!category) {
      throw new Error(`Category not found for product ${product.name}`)
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {category: _, ...productWithoutCategory} = product
    return {
      ...productWithoutCategory,
      categoryData: {
        _id: category._id,
        name: category.name,
        slug: category.slug,
      },
    }
  })
}

export const createProduct = mutation({
  args: {
    name: v.string(),
    category: v.id('categories'),
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
  returns: v.array(productWithCategoryData),
  handler: async (ctx) => {
    const products = await ctx.db.query('products').collect()
    return enrichProductsWithCategoryData(ctx, products)
  },
})

export const getFeaturedProducts = query({
  args: {},
  returns: v.array(productWithCategoryData),
  handler: async (ctx) => {
    const products = await ctx.db
      .query('products')
      .withIndex('by_featured', (q) => q.eq('featured', true))
      .take(12)

    return enrichProductsWithCategoryData(ctx, products)
  },
})

export const getProductsByCategory = query({
  args: {categoryId: v.id('categories')},
  returns: v.array(productWithCategoryData),
  handler: async (ctx, args) => {
    const products = await ctx.db
      .query('products')
      .withIndex('by_category', (q) => q.eq('category', args.categoryId))
      .collect()

    return enrichProductsWithCategoryData(ctx, products)
  },
})
