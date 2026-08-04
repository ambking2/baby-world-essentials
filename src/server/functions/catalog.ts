import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import {
  allSettings,
  breadcrumbFor,
  categoryBySlug,
  categoryIdsWithChildren,
  categoryTree,
  saveContactMessage,
  subscribeNewsletter,
} from "../repo/catalog";
import { listProducts, type ProductFilters, type SortKey } from "../repo/products";

const sortKeys = ["newest", "cheapest", "expensive", "popular", "rating", "discount"] as const;

/** درخت دسته‌بندی‌ها و تنطیمات عمومی — برای هدر و فوتر. */
export const getCatalogShell = createServerFn({ method: "GET" }).handler(async () => {
  const settings = allSettings();
  return {
    categories: categoryTree(),
    announcement: settings["announcement"] ?? "",
    settings,
  };
});

const categoryPageSchema = z.object({
  slug: z.string().min(1).max(160),
  page: z.number().int().positive().optional(),
  perPage: z.number().int().positive().max(48).optional(),
  sort: z.enum(sortKeys).optional(),
  minPrice: z.number().int().nonnegative().optional(),
  maxPrice: z.number().int().nonnegative().optional(),
  sizes: z.array(z.string().max(40)).optional(),
  colors: z.array(z.string().max(40)).optional(),
  onlyAvailable: z.boolean().optional(),
  onlyDiscounted: z.boolean().optional(),
  q: z.string().max(120).optional(),
});

/** صفحهٔ دسته‌بندی: مسیر راهنما، زیردسته‌ها و فهرست محصولات. */
export const getCategoryPage = createServerFn({ method: "GET" })
  .validator((data: unknown) => categoryPageSchema.parse(data))
  .handler(async ({ data }) => {
    const category = categoryBySlug(data.slug);
    if (!category) return { category: null, breadcrumb: [], children: [], products: null };

    const tree = categoryTree();
    const node = tree.find((root) => root.id === category.id);
    const children =
      node?.children ??
      tree.flatMap((root) => root.children).find((child) => child.id === category.id)?.children ??
      [];

    const filters: ProductFilters = {
      categoryIds: categoryIdsWithChildren(category.id),
      sort: (data.sort ?? "newest") as SortKey,
      page: data.page ?? 1,
      perPage: data.perPage ?? 12,
    };
    if (typeof data.minPrice === "number") filters.minPrice = data.minPrice;
    if (typeof data.maxPrice === "number") filters.maxPrice = data.maxPrice;
    if (data.sizes && data.sizes.length > 0) filters.sizes = data.sizes;
    if (data.colors && data.colors.length > 0) filters.colors = data.colors;
    if (data.onlyAvailable === true) filters.onlyAvailable = true;
    if (data.onlyDiscounted === true) filters.onlyDiscounted = true;
    if (data.q && data.q.trim().length > 0) filters.q = data.q.trim();

    return {
      category,
      breadcrumb: breadcrumbFor(category.slug),
      children,
      products: listProducts(filters),
    };
  });

/** عضویت در خبرنامه. */
export const joinNewsletter = createServerFn({ method: "POST" })
  .validator((data: unknown) =>
    z.object({ email: z.string().email("ایمیل معتبر وارد کنید.").max(160) }).parse(data),
  )
  .handler(async ({ data }) => {
    subscribeNewsletter(data.email);
    return { ok: true, message: "عضویت شما در خبرنامه ثبت شد." };
  });

/** ارسال پیام از فرم تماس با ما. */
export const sendContactMessage = createServerFn({ method: "POST" })
  .validator((data: unknown) =>
    z
      .object({
        name: z.string().min(2, "نام را وارد کنید.").max(80),
        phone: z.string().max(20).optional(),
        email: z.string().email("ایمیل معتبر وارد کنید.").max(160).optional(),
        subject: z.string().max(120).optional(),
        body: z.string().min(5, "متن پیام کوتاه است.").max(2000),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    saveContactMessage({
      name: data.name.trim(),
      phone: data.phone ?? null,
      email: data.email ?? null,
      subject: data.subject ?? null,
      body: data.body.trim(),
    });
    return { ok: true, message: "پیام شما ثبت شد؛ در اولین فرصت پاسخ می‌دهیم." };
  });
