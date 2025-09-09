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
  description: v.string(),
  link: v.string(),
  expertData: expertData,
  slug: v.string(),
  featured: v.boolean(),
  price: v.number(),
  image: v.optional(v.id('_storage')),
  imageUrl: v.optional(v.string()),
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

  // Фильтруем продукты только активных экспертов и обогащаем их данными
  const enrichedProducts = await Promise.all(
    products
      .filter((product) => {
        const expert = expertMap.get(product.expert)
        return expert && expert.isActive // Показываем только продукты активных экспертов
      })
      .map(async (product) => {
        const category = categoryMap.get(product.category)
        const expert = expertMap.get(product.expert)

        if (!category) {
          throw new Error(`Category not found for product ${product.name}`)
        }
        if (!expert) {
          throw new Error(`Expert not found for product ${product.name}`)
        }

        // Получаем URL изображения если оно есть
        const imageUrl = product.image ? await ctx.storage.getUrl(product.image) : undefined

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
          imageUrl: imageUrl || undefined,
        }
      }),
  )

  return enrichedProducts
}

export const createProduct = mutation({
  args: {
    name: v.string(),
    category: v.id('categories'),
    caption: v.string(),
    description: v.string(),
    link: v.string(),
    expert: v.id('experts'),
    slug: v.string(),
    featured: v.boolean(),
    price: v.number(),
    image: v.optional(v.id('_storage')),
  },
  handler: async (ctx, args) => {
    const product = await ctx.db.insert('products', {
      name: args.name,
      category: args.category,
      caption: args.caption,
      description: args.description,
      link: args.link,
      expert: args.expert,
      slug: args.slug,
      featured: args.featured,
      price: args.price,
      image: args.image,
    })
    return product
  },
})

export const getProducts = query({
  args: {},
  handler: async (ctx) => {
    const products = await ctx.db.query('products').collect()
    return enrichProductsWithExtraData(ctx, products)
  },
})

export const getAllProducts = query({
  args: {},
  handler: async (ctx) => {
    const products = await ctx.db.query('products').collect()
    return await enrichProductsWithExtraData(ctx, products)
  },
})

export const updateProduct = mutation({
  args: {
    id: v.id('products'),
    name: v.string(),
    caption: v.string(),
    description: v.string(),
    link: v.string(),
    slug: v.string(),
    category: v.id('categories'),
    expert: v.id('experts'),
    featured: v.boolean(),
    price: v.number(),
    image: v.optional(v.id('_storage')),
  },
  handler: async (ctx, args) => {
    const {id, ...updates} = args
    await ctx.db.patch(id, updates)
    return id
  },
})

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl()
  },
})

export const deleteProduct = mutation({
  args: {id: v.id('products')},
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id)
    return args.id
  },
})

export const getProductsFeatured = query({
  args: {},
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
