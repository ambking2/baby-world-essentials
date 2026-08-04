import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireAdmin } from "../context";
import {
  adminDeleteComment,
  adminDeletePost,
  adminListComments,
  adminListPosts,
  adminSavePost,
  adminSetCommentStatus,
} from "../repo/blog";
import { allSettings, categoryTree, flatCategories, setSetting } from "../repo/catalog";
import {
  adminDeleteCategory,
  adminDeleteCoupon,
  adminDeleteProduct,
  adminListCoupons,
  adminListProducts,
  adminListReviews,
  adminProductForm,
  adminSaveCategory,
  adminSaveCoupon,
  adminSaveProduct,
  adminSetDiscount,
  adminSetPrice,
  adminSetReviewStatus,
  adminSetStock,
  adminToggleProduct,
  type ProductFormValues,
} from "../repo/admin-products";
import {
  adminListOrders,
  adminReviewPayment,
  adminSetOrderStatus,
  dashboardStats,
  isOrderStatus,
  orderByCode,
  ORDER_STATUSES,
} from "../repo/orders";
import {
  adminListCustomers,
  adminListMessages,
  adminListNewsletter,
  adminMarkMessageRead,
} from "../repo/users";

const statusEnum = z.enum(["pending", "approved", "rejected"]);

/* ---------------------------- داشبورد ---------------------------- */

export const getAdminDashboard = createServerFn({ method: "GET" }).handler(async () => {
  requireAdmin();
  return {
    stats: dashboardStats(),
    latestOrders: adminListOrders({ page: 1 }).items.slice(0, 8),
  };
});

/* ---------------------------- محصولات ---------------------------- */

export const getAdminProducts = createServerFn({ method: "GET" })
  .validator((data: unknown) =>
    z
      .object({
        q: z.string().max(120).optional(),
        categoryId: z.number().int().positive().optional(),
        page: z.number().int().positive().optional(),
      })
      .parse(data ?? {}),
  )
  .handler(async ({ data }) => {
    requireAdmin();
    const filters: { q?: string; categoryId?: number; page?: number } = {};
    if (data.q !== undefined) filters.q = data.q;
    if (data.categoryId !== undefined) filters.categoryId = data.categoryId;
    if (data.page !== undefined) filters.page = data.page;
    return { ...adminListProducts(filters), categories: flatCategories() };
  });

export const getAdminProductForm = createServerFn({ method: "GET" })
  .validator((data: unknown) => z.object({ id: z.number().int().positive().nullable() }).parse(data))
  .handler(async ({ data }) => {
    requireAdmin();
    return {
      values: data.id === null ? null : adminProductForm(data.id),
      categories: flatCategories(),
    };
  });

const productSchema = z.object({
  id: z.number().int().positive().nullable().optional(),
  code: z.string().min(2, "کد محصول را وارد کنید.").max(40),
  slug: z.string().min(2, "نامک (slug) را وارد کنید.").max(160),
  title: z.string().min(2, "عنوان محصول را وارد کنید.").max(160),
  subtitle: z.string().max(200).nullable().optional(),
  description: z.string().max(8000).nullable().optional(),
  categoryId: z.number().int().positive().nullable().optional(),
  price: z.number().int().nonnegative(),
  discountPercent: z.number().int().min(0).max(90).optional(),
  salePercent: z.number().int().min(0).max(90).optional(),
  saleStartsAt: z.string().max(40).nullable().optional(),
  saleEndsAt: z.string().max(40).nullable().optional(),
  stock: z.number().int().nonnegative().optional(),
  weightGrams: z.number().int().nonnegative().optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  madeInWorkshop: z.boolean().optional(),
  badge: z.string().max(60).nullable().optional(),
  images: z.array(z.object({ url: z.string().min(1).max(400), alt: z.string().max(160).nullable().optional() })).optional(),
  attributes: z.array(z.object({ name: z.string().min(1).max(60), value: z.string().min(1).max(200) })).optional(),
  variants: z
    .array(
      z.object({
        size: z.string().max(40).nullable().optional(),
        color: z.string().max(40).nullable().optional(),
        colorHex: z.string().max(20).nullable().optional(),
        priceDelta: z.number().int().optional(),
        stock: z.number().int().nonnegative().optional(),
      }),
    )
    .optional(),
});

export const saveAdminProduct = createServerFn({ method: "POST" })
  .validator((data: unknown) => productSchema.parse(data))
  .handler(async ({ data }) => {
    requireAdmin();
    const id = adminSaveProduct(data as ProductFormValues);
    return { ok: true, id, message: "محصول ذخیره شد." };
  });

export const removeAdminProduct = createServerFn({ method: "POST" })
  .validator((data: unknown) => z.object({ id: z.number().int().positive() }).parse(data))
  .handler(async ({ data }) => {
    requireAdmin();
    adminDeleteProduct(data.id);
    return { ok: true, message: "محصول حذف شد." };
  });

export const setAdminProductFlags = createServerFn({ method: "POST" })
  .validator((data: unknown) =>
    z
      .object({
        id: z.number().int().positive(),
        isActive: z.boolean().optional(),
        stock: z.number().int().nonnegative().optional(),
        price: z.number().int().nonnegative().optional(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    requireAdmin();
    if (data.isActive !== undefined) adminToggleProduct(data.id, data.isActive);
    if (data.stock !== undefined) adminSetStock(data.id, data.stock);
    if (data.price !== undefined) adminSetPrice(data.id, data.price);
    return { ok: true, message: "تغییرات ذخیره شد." };
  });

/** تخفیف ساده یا زمان‌دار. */
export const setAdminProductDiscount = createServerFn({ method: "POST" })
  .validator((data: unknown) =>
    z
      .object({
        id: z.number().int().positive(),
        percent: z.number().int().min(0).max(90),
        timed: z.boolean().optional(),
        startsAt: z.string().max(40).nullable().optional(),
        endsAt: z.string().max(40).nullable().optional(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    requireAdmin();
    adminSetDiscount(data.id, {
      percent: data.percent,
      ...(data.timed === undefined ? {} : { timed: data.timed }),
      startsAt: data.startsAt ?? null,
      endsAt: data.endsAt ?? null,
    });
    return { ok: true, message: "تخفیف به‌روز شد." };
  });

/* --------------------------- دسته‌بندی‌ها --------------------------- */

export const getAdminCategories = createServerFn({ method: "GET" }).handler(async () => {
  requireAdmin();
  return { tree: categoryTree(), flat: flatCategories() };
});

export const saveAdminCategory = createServerFn({ method: "POST" })
  .validator((data: unknown) =>
    z
      .object({
        id: z.number().int().positive().nullable().optional(),
        slug: z.string().min(2).max(120),
        title: z.string().min(2, "عنوان دسته را وارد کنید.").max(120),
        blurb: z.string().max(300).nullable().optional(),
        image: z.string().max(400).nullable().optional(),
        parentId: z.number().int().positive().nullable().optional(),
        kind: z.enum(["general", "clothing"]).optional(),
        sort: z.number().int().optional(),
        isActive: z.boolean().optional(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    requireAdmin();
    const id = adminSaveCategory(data);
    return { ok: true, id, message: "دسته‌بندی ذخیره شد." };
  });

export const removeAdminCategory = createServerFn({ method: "POST" })
  .validator((data: unknown) => z.object({ id: z.number().int().positive() }).parse(data))
  .handler(async ({ data }) => {
    requireAdmin();
    adminDeleteCategory(data.id);
    return { ok: true, message: "دسته‌بندی حذف شد." };
  });

/* ----------------------------- سفارش‌ها ----------------------------- */

export const getAdminOrders = createServerFn({ method: "GET" })
  .validator((data: unknown) =>
    z
      .object({
        status: z.string().max(40).optional(),
        q: z.string().max(120).optional(),
        page: z.number().int().positive().optional(),
      })
      .parse(data ?? {}),
  )
  .handler(async ({ data }) => {
    requireAdmin();
    const filters: { status?: string; q?: string; page?: number } = {};
    if (data.status !== undefined) filters.status = data.status;
    if (data.q !== undefined) filters.q = data.q;
    if (data.page !== undefined) filters.page = data.page;
    return { ...adminListOrders(filters), statuses: ORDER_STATUSES };
  });

export const getAdminOrder = createServerFn({ method: "GET" })
  .validator((data: unknown) => z.object({ code: z.string().min(3).max(30) }).parse(data))
  .handler(async ({ data }) => {
    requireAdmin();
    return { order: orderByCode(data.code) };
  });

export const setAdminOrderStatus = createServerFn({ method: "POST" })
  .validator((data: unknown) =>
    z.object({ code: z.string().min(3).max(30), status: z.string().min(3).max(40) }).parse(data),
  )
  .handler(async ({ data }) => {
    requireAdmin();
    if (!isOrderStatus(data.status)) return { ok: false, message: "وضعیت انتخابی معتبر نیست." };
    adminSetOrderStatus(data.code, data.status);
    return { ok: true, message: "وضعیت سفارش به‌روز شد." };
  });

/** تأیید یا رد رسید کارت‌به‌کارت. */
export const reviewAdminPayment = createServerFn({ method: "POST" })
  .validator((data: unknown) =>
    z
      .object({
        paymentId: z.number().int().positive(),
        approve: z.boolean(),
        adminNote: z.string().max(400).nullable().optional(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    requireAdmin();
    adminReviewPayment(data.paymentId, data.approve, data.adminNote ?? null);
    return { ok: true, message: data.approve ? "پرداخت تأیید شد." : "رسید رد شد." };
  });

/* ------------------------------- وبلاگ ------------------------------- */

export const getAdminPosts = createServerFn({ method: "GET" }).handler(async () => {
  requireAdmin();
  return { posts: adminListPosts() };
});

export const saveAdminPost = createServerFn({ method: "POST" })
  .validator((data: unknown) =>
    z
      .object({
        id: z.number().int().positive().nullable().optional(),
        slug: z.string().min(2).max(160),
        title: z.string().min(2, "عنوان مقاله را وارد کنید.").max(200),
        excerpt: z.string().max(400).nullable().optional(),
        body: z.string().min(10, "متن مقاله کوتاه است.").max(40000),
        cover: z.string().max(400).nullable().optional(),
        tag: z.string().max(60).nullable().optional(),
        author: z.string().max(60).nullable().optional(),
        status: z.enum(["published", "draft"]).optional(),
        publishedAt: z.string().max(40).nullable().optional(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    requireAdmin();
    const id = adminSavePost(data);
    return { ok: true, id, message: "مقاله ذخیره شد." };
  });

export const removeAdminPost = createServerFn({ method: "POST" })
  .validator((data: unknown) => z.object({ id: z.number().int().positive() }).parse(data))
  .handler(async ({ data }) => {
    requireAdmin();
    adminDeletePost(data.id);
    return { ok: true, message: "مقاله حذف شد." };
  });

/* ------------------- دیدگاه‌ها و نظرات محصول ------------------- */

export const getAdminComments = createServerFn({ method: "GET" })
  .validator((data: unknown) => z.object({ status: statusEnum.optional() }).parse(data ?? {}))
  .handler(async ({ data }) => {
    requireAdmin();
    return {
      comments: data.status === undefined ? adminListComments() : adminListComments(data.status),
      reviews: data.status === undefined ? adminListReviews() : adminListReviews(data.status),
    };
  });

export const setAdminCommentStatus = createServerFn({ method: "POST" })
  .validator((data: unknown) =>
    z.object({ id: z.number().int().positive(), status: statusEnum }).parse(data),
  )
  .handler(async ({ data }) => {
    requireAdmin();
    adminSetCommentStatus(data.id, data.status);
    return { ok: true, message: "وضعیت دیدگاه به‌روز شد." };
  });

export const removeAdminComment = createServerFn({ method: "POST" })
  .validator((data: unknown) => z.object({ id: z.number().int().positive() }).parse(data))
  .handler(async ({ data }) => {
    requireAdmin();
    adminDeleteComment(data.id);
    return { ok: true, message: "دیدگاه حذف شد." };
  });

export const setAdminReviewStatus = createServerFn({ method: "POST" })
  .validator((data: unknown) =>
    z.object({ id: z.number().int().positive(), status: statusEnum }).parse(data),
  )
  .handler(async ({ data }) => {
    requireAdmin();
    adminSetReviewStatus(data.id, data.status);
    return { ok: true, message: "وضعیت نظر محصول به‌روز شد." };
  });

/* --------------------- مشتریان، پیام‌ها و خبرنامه --------------------- */

export const getAdminCustomers = createServerFn({ method: "GET" })
  .validator((data: unknown) => z.object({ q: z.string().max(120).optional() }).parse(data ?? {}))
  .handler(async ({ data }) => {
    requireAdmin();
    return {
      customers: data.q === undefined ? adminListCustomers() : adminListCustomers(data.q),
      newsletter: adminListNewsletter(),
      messages: adminListMessages(),
    };
  });

export const markAdminMessageRead = createServerFn({ method: "POST" })
  .validator((data: unknown) =>
    z.object({ id: z.number().int().positive(), isRead: z.boolean().optional() }).parse(data),
  )
  .handler(async ({ data }) => {
    requireAdmin();
    adminMarkMessageRead(data.id, data.isRead ?? true);
    return { ok: true };
  });

/* ---------------------------- کدهای تخفیف ---------------------------- */

export const getAdminCoupons = createServerFn({ method: "GET" }).handler(async () => {
  requireAdmin();
  return { coupons: adminListCoupons() };
});

export const saveAdminCoupon = createServerFn({ method: "POST" })
  .validator((data: unknown) =>
    z
      .object({
        id: z.number().int().positive().nullable().optional(),
        code: z.string().min(3, "کد تخفیف را وارد کنید.").max(40),
        kind: z.enum(["percent", "amount"]).optional(),
        value: z.number().int().nonnegative(),
        minTotal: z.number().int().nonnegative().optional(),
        maxOff: z.number().int().nonnegative().nullable().optional(),
        maxUses: z.number().int().nonnegative().nullable().optional(),
        startsAt: z.string().max(40).nullable().optional(),
        endsAt: z.string().max(40).nullable().optional(),
        isActive: z.boolean().optional(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    requireAdmin();
    const id = adminSaveCoupon(data);
    return { ok: true, id, message: "کد تخفیف ذخیره شد." };
  });

export const removeAdminCoupon = createServerFn({ method: "POST" })
  .validator((data: unknown) => z.object({ id: z.number().int().positive() }).parse(data))
  .handler(async ({ data }) => {
    requireAdmin();
    adminDeleteCoupon(data.id);
    return { ok: true, message: "کد تخفیف حذف شد." };
  });

/* ------------------------------ تنطیمات ------------------------------ */

export const getAdminSettings = createServerFn({ method: "GET" }).handler(async () => {
  requireAdmin();
  return { settings: allSettings() };
});

export const saveAdminSettings = createServerFn({ method: "POST" })
  .validator((data: unknown) =>
    z.object({ values: z.record(z.string().max(60), z.string().max(400)) }).parse(data),
  )
  .handler(async ({ data }) => {
    requireAdmin();
    for (const [key, value] of Object.entries(data.values)) setSetting(key, value);
    return { ok: true, settings: allSettings(), message: "تنطیمات ذخیره شد." };
  });
