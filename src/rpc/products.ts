import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { currentUser } from "../server/context";
import { one } from "../server/db";
import {
  addReview,
  bestSellers,
  featuredProducts,
  flashSaleProducts,
  incrementProductView,
  listProducts,
  newestProducts,
  onSaleProducts,
  productBySlug,
  relatedProducts,
  searchSuggest,
  topRated,
  type ProductFilters,
} from "../server/repo/products";

const sortKeys = ["newest", "cheapest", "expensive", "popular", "rating", "discount"] as const;

const filtersSchema = z.object({
  categoryIds: z.array(z.number().int().positive()).optional(),
  q: z.string().max(120).optional(),
  minPrice: z.number().int().nonnegative().optional(),
  maxPrice: z.number().int().nonnegative().optional(),
  sizes: z.array(z.string().max(40)).optional(),
  colors: z.array(z.string().max(40)).optional(),
  onlyAvailable: z.boolean().optional(),
  onlyDiscounted: z.boolean().optional(),
  sort: z.enum(sortKeys).optional(),
  page: z.number().int().positive().optional(),
  perPage: z.number().int().positive().max(48).optional(),
});

export const getHomeProducts = createServerFn({ method: "GET" }).handler(async () => {
  const [featured, newest, best, onSale, flashSale, rated] = await Promise.all([
    featuredProducts(8),
    newestProducts(8),
    bestSellers(8),
    onSaleProducts(8),
    flashSaleProducts(6),
    topRated(5),
  ]);
  return { featured, newest, bestSellers: best, onSale, flashSale, topRated: rated };
});

export const getProducts = createServerFn({ method: "GET" })
  .validator((data: unknown) => filtersSchema.parse(data))
  .handler(async ({ data }) => listProducts(data as ProductFilters));

export const suggestProducts = createServerFn({ method: "GET" })
  .validator((data: unknown) => z.object({ term: z.string().min(2).max(60) }).parse(data))
  .handler(async ({ data }) => ({ items: await searchSuggest(data.term, 6) }));

export const getProductPage = createServerFn({ method: "GET" })
  .validator((data: unknown) => z.object({ slug: z.string().min(1).max(160) }).parse(data))
  .handler(async ({ data }) => {
    const product = await productBySlug(data.slug);
    if (!product) return { product: null, related: [] };

    const [, categoryRow] = await Promise.all([
      incrementProductView(product.id),
      one<{ category_id: number | null }>(
        "SELECT category_id FROM products WHERE id = ?",
        product.id,
      ),
    ]);
    const categoryId = categoryRow?.category_id ?? null;

    return { product, related: await relatedProducts(product.id, categoryId, 4) };
  });

export const submitReview = createServerFn({ method: "POST" })
  .validator((data: unknown) =>
    z
      .object({
        productId: z.number().int().positive(),
        name: z.string().min(2, "نام را وارد کنید.").max(60),
        rating: z.number().int().min(1).max(5),
        body: z.string().min(5, "متن دیدگاه کوتاه است.").max(1500),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const user = await currentUser();
    await addReview({
      productId: data.productId,
      userId: user?.id ?? null,
      name: data.name.trim(),
      rating: data.rating,
      body: data.body.trim(),
    });
    return { ok: true, message: "دیدگاه شما ثبت شد و پس از بررسی منتشر می‌شود." };
  });
