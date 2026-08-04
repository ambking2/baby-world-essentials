import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { currentUser } from "../context";
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
} from "../repo/products";

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

/** دادهٔ مورد نیاز صفحهٔ اول در یک درخواست. */
export const getHomeProducts = createServerFn({ method: "GET" }).handler(async () => {
  return {
    featured: featuredProducts(8),
    newest: newestProducts(8),
    bestSellers: bestSellers(8),
    onSale: onSaleProducts(8),
    flashSale: flashSaleProducts(6),
    topRated: topRated(5),
  };
});

/** فهرست محصولات با فیلتر، مرتب‌سازی و صفحه‌بندی. */
export const getProducts = createServerFn({ method: "GET" })
  .validator((data: unknown) => filtersSchema.parse(data))
  .handler(async ({ data }) => listProducts(data as ProductFilters));

/** پیشنهاد زندهٔ جستجو در هدر. */
export const suggestProducts = createServerFn({ method: "GET" })
  .validator((data: unknown) => z.object({ term: z.string().min(2).max(60) }).parse(data))
  .handler(async ({ data }) => ({ items: searchSuggest(data.term, 6) }));

/** صفحهٔ محصول: جزئیات و محصولات مرتبط. */
export const getProductPage = createServerFn({ method: "GET" })
  .validator((data: unknown) => z.object({ slug: z.string().min(1).max(160) }).parse(data))
  .handler(async ({ data }) => {
    const product = productBySlug(data.slug);
    if (!product) return { product: null, related: [] };

    incrementProductView(product.id);
    const categoryRow = product.categorySlug === null ? null : product.id;
    void categoryRow;

    return {
      product,
      related: relatedProducts(product.id, product.categorySlug === null ? null : (product.categoryId ?? null), 4),
    };
  });

/** ثبت دیدگاه کاربر — پس از تأیید مدیر نمایش داده می‌شود. */
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
    addReview({
      productId: data.productId,
      userId: user?.id ?? null,
      name: data.name.trim(),
      rating: data.rating,
      body: data.body.trim(),
    });
    return { ok: true, message: "دیدگاه شما ثبت شد و پس از بررسی منتشر می‌شود." };
  });
