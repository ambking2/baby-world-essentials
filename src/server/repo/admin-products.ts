import { all, count, nowIso, one, run, transaction } from "../db";
import { recalcRating } from "./products";

/* ------------------------------------------------------------------ */
/* فهرست محصولات در پنل                                          */
/* ------------------------------------------------------------------ */

export type AdminProductRow = {
  id: number;
  code: string;
  slug: string;
  title: string;
  categoryTitle: string | null;
  price: number;
  discountPercent: number;
  salePercent: number;
  saleEndsAt: string | null;
  stock: number;
  isActive: boolean;
  isFeatured: boolean;
  cover: string | null;
  soldCount: number;
  variantCount: number;
};

export function adminListProducts(filters: { q?: string; categoryId?: number; page?: number } = {}): {
  items: Array<AdminProductRow>;
  total: number;
  page: number;
  pageCount: number;
} {
  const perPage = 20;
  const page = Math.max(filters.page ?? 1, 1);
  const clauses = ["1 = 1"];
  const params: Array<string | number> = [];

  if (filters.q && filters.q.trim().length > 0) {
    clauses.push("(p.title LIKE ? OR p.code LIKE ? OR p.slug LIKE ?)");
    const like = `%${filters.q.trim()}%`;
    params.push(like, like, like);
  }
  if (typeof filters.categoryId === "number") {
    clauses.push("p.category_id = ?");
    params.push(filters.categoryId);
  }

  const where = clauses.join(" AND ");
  const total = count(`SELECT COUNT(*) AS c FROM products p WHERE ${where}`, ...params);

  const rows = all<{
    id: number;
    code: string;
    slug: string;
    title: string;
    category_title: string | null;
    price: number;
    discount_percent: number;
    sale_percent: number;
    sale_ends_at: string | null;
    stock: number;
    is_active: number;
    is_featured: number;
    cover: string | null;
    sold_count: number;
    variant_count: number;
  }>(
    `SELECT p.id, p.code, p.slug, p.title, p.price, p.discount_percent, p.sale_percent, p.sale_ends_at,
       p.stock, p.is_active, p.is_featured, p.sold_count,
       c.title AS category_title,
       (SELECT i.url FROM product_images i WHERE i.product_id = p.id ORDER BY i.sort ASC, i.id ASC LIMIT 1) AS cover,
       (SELECT COUNT(*) FROM product_variants v WHERE v.product_id = p.id) AS variant_count
     FROM products p LEFT JOIN categories c ON c.id = p.category_id
     WHERE ${where} ORDER BY p.id DESC LIMIT ? OFFSET ?`,
    ...params,
    perPage,
    (page - 1) * perPage,
  );

  return {
    items: rows.map((row) => ({
      id: row.id,
      code: row.code,
      slug: row.slug,
      title: row.title,
      categoryTitle: row.category_title,
      price: Number(row.price),
      discountPercent: Number(row.discount_percent),
      salePercent: Number(row.sale_percent),
      saleEndsAt: row.sale_ends_at,
      stock: Number(row.stock),
      isActive: row.is_active === 1,
      isFeatured: row.is_featured === 1,
      cover: row.cover,
      soldCount: Number(row.sold_count),
      variantCount: Number(row.variant_count),
    })),
    total,
    page,
    pageCount: Math.max(Math.ceil(total / perPage), 1),
  };
}

/* ------------------------------------------------------------------ */
/* فرم افزودن/ویرایش محصول                                    */
/* ------------------------------------------------------------------ */

export type ProductFormValues = {
  id?: number | null;
  code: string;
  slug: string;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  categoryId?: number | null;
  price: number;
  discountPercent?: number;
  salePercent?: number;
  saleStartsAt?: string | null;
  saleEndsAt?: string | null;
  stock?: number;
  weightGrams?: number;
  isActive?: boolean;
  isFeatured?: boolean;
  madeInWorkshop?: boolean;
  badge?: string | null;
  images?: Array<{ url: string; alt?: string | null }>;
  attributes?: Array<{ name: string; value: string }>;
  variants?: Array<{
    size?: string | null;
    color?: string | null;
    colorHex?: string | null;
    priceDelta?: number;
    stock?: number;
  }>;
};

/** خواندن مقادیر یک محصول برای پرکردن فرم ویرایش. */
export function adminProductForm(id: number): ProductFormValues | null {
  const row = one<{
    id: number;
    code: string;
    slug: string;
    title: string;
    subtitle: string | null;
    description: string | null;
    category_id: number | null;
    price: number;
    discount_percent: number;
    sale_percent: number;
    sale_starts_at: string | null;
    sale_ends_at: string | null;
    stock: number;
    weight_grams: number;
    is_active: number;
    is_featured: number;
    made_in_workshop: number;
    badge: string | null;
  }>("SELECT * FROM products WHERE id = ?", id);
  if (!row) return null;

  return {
    id: row.id,
    code: row.code,
    slug: row.slug,
    title: row.title,
    subtitle: row.subtitle,
    description: row.description,
    categoryId: row.category_id,
    price: Number(row.price),
    discountPercent: Number(row.discount_percent),
    salePercent: Number(row.sale_percent),
    saleStartsAt: row.sale_starts_at,
    saleEndsAt: row.sale_ends_at,
    stock: Number(row.stock),
    weightGrams: Number(row.weight_grams),
    isActive: row.is_active === 1,
    isFeatured: row.is_featured === 1,
    madeInWorkshop: row.made_in_workshop === 1,
    badge: row.badge,
    images: all<{ url: string; alt: string | null }>(
      "SELECT url, alt FROM product_images WHERE product_id = ? ORDER BY sort ASC, id ASC",
      id,
    ),
    attributes: all<{ name: string; value: string }>(
      "SELECT name, value FROM product_attributes WHERE product_id = ? ORDER BY sort ASC, id ASC",
      id,
    ),
    variants: all<{
      size: string | null;
      color: string | null;
      color_hex: string | null;
      price_delta: number;
      stock: number;
    }>(
      "SELECT size, color, color_hex, price_delta, stock FROM product_variants WHERE product_id = ? ORDER BY sort ASC, id ASC",
      id,
    ).map((variant) => ({
      size: variant.size,
      color: variant.color,
      colorHex: variant.color_hex,
      priceDelta: Number(variant.price_delta),
      stock: Number(variant.stock),
    })),
  };
}

/** ایجاد یا ویرایش کامل محصول همراه تصاویر، ویژگی‌ها و تنوع‌ها. */
export function adminSaveProduct(values: ProductFormValues): number {
  const now = nowIso();

  return transaction(() => {
    let productId = values.id ?? null;

    if (productId) {
      run(
        `UPDATE products SET code = ?, slug = ?, title = ?, subtitle = ?, description = ?, category_id = ?,
           price = ?, discount_percent = ?, sale_percent = ?, sale_starts_at = ?, sale_ends_at = ?,
           stock = ?, weight_grams = ?, is_active = ?, is_featured = ?, made_in_workshop = ?, badge = ?, updated_at = ?
         WHERE id = ?`,
        values.code,
        values.slug,
        values.title,
        values.subtitle ?? null,
        values.description ?? null,
        values.categoryId ?? null,
        values.price,
        values.discountPercent ?? 0,
        values.salePercent ?? 0,
        values.saleStartsAt ?? null,
        values.saleEndsAt ?? null,
        values.stock ?? 0,
        values.weightGrams ?? 0,
        values.isActive === false ? 0 : 1,
        values.isFeatured === true ? 1 : 0,
        values.madeInWorkshop === true ? 1 : 0,
        values.badge ?? null,
        now,
        productId,
      );
    } else {
      const result = run(
        `INSERT INTO products (
           code, slug, title, subtitle, description, category_id, price, discount_percent,
           sale_percent, sale_starts_at, sale_ends_at, stock, weight_grams,
           is_active, is_featured, made_in_workshop, badge, created_at, updated_at
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        values.code,
        values.slug,
        values.title,
        values.subtitle ?? null,
        values.description ?? null,
        values.categoryId ?? null,
        values.price,
        values.discountPercent ?? 0,
        values.salePercent ?? 0,
        values.saleStartsAt ?? null,
        values.saleEndsAt ?? null,
        values.stock ?? 0,
        values.weightGrams ?? 0,
        values.isActive === false ? 0 : 1,
        values.isFeatured === true ? 1 : 0,
        values.madeInWorkshop === true ? 1 : 0,
        values.badge ?? null,
        now,
        now,
      );
      productId = result.lastInsertRowid;
    }

    if (values.images) {
      run("DELETE FROM product_images WHERE product_id = ?", productId);
      values.images.forEach((image, index) => {
        run(
          "INSERT INTO product_images (product_id, url, alt, sort) VALUES (?, ?, ?, ?)",
          productId,
          image.url,
          image.alt ?? null,
          index,
        );
      });
    }

    if (values.attributes) {
      run("DELETE FROM product_attributes WHERE product_id = ?", productId);
      values.attributes.forEach((attribute, index) => {
        run(
          "INSERT INTO product_attributes (product_id, name, value, sort) VALUES (?, ?, ?, ?)",
          productId,
          attribute.name,
          attribute.value,
          index,
        );
      });
    }

    if (values.variants) {
      run("DELETE FROM product_variants WHERE product_id = ?", productId);
      values.variants.forEach((variant, index) => {
        run(
          `INSERT INTO product_variants (product_id, size, color, color_hex, price_delta, stock, sort)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          productId,
          variant.size ?? null,
          variant.color ?? null,
          variant.colorHex ?? null,
          variant.priceDelta ?? 0,
          variant.stock ?? 0,
          index,
        );
      });
    }

    return productId as number;
  });
}

export function adminDeleteProduct(id: number): void {
  run("DELETE FROM products WHERE id = ?", id);
}

export function adminToggleProduct(id: number, isActive: boolean): void {
  run("UPDATE products SET is_active = ?, updated_at = ? WHERE id = ?", isActive ? 1 : 0, nowIso(), id);
}

/** ویرایش سریع موجودی از داخل جدول محصولات. */
export function adminSetStock(id: number, stock: number): void {
  run("UPDATE products SET stock = ?, updated_at = ? WHERE id = ?", Math.max(0, Math.round(stock)), nowIso(), id);
}

export function adminSetPrice(id: number, price: number): void {
  run("UPDATE products SET price = ?, updated_at = ? WHERE id = ?", Math.max(0, Math.round(price)), nowIso(), id);
}

/**
 * تخفیف ساده یا زمان‌دار.
 * - ساده: فقط percent بدهید.
 * - زمان‌دار: percent به همراه startsAt/endsAt.
 */
export function adminSetDiscount(
  id: number,
  input: { percent: number; timed?: boolean; startsAt?: string | null; endsAt?: string | null },
): void {
  const percent = Math.min(Math.max(Math.round(input.percent), 0), 90);
  if (input.timed === true) {
    run(
      "UPDATE products SET sale_percent = ?, sale_starts_at = ?, sale_ends_at = ?, updated_at = ? WHERE id = ?",
      percent,
      input.startsAt ?? nowIso(),
      input.endsAt ?? null,
      nowIso(),
      id,
    );
    return;
  }
  run(
    "UPDATE products SET discount_percent = ?, sale_percent = 0, sale_starts_at = NULL, sale_ends_at = NULL, updated_at = ? WHERE id = ?",
    percent,
    nowIso(),
    id,
  );
}

/* ------------------------------------------------------------------ */
/* دسته‌بندی‌ها                                                     */
/* ------------------------------------------------------------------ */

export function adminSaveCategory(input: {
  id?: number | null;
  slug: string;
  title: string;
  blurb?: string | null;
  image?: string | null;
  parentId?: number | null;
  kind?: "general" | "clothing";
  sort?: number;
  isActive?: boolean;
}): number {
  if (input.id) {
    run(
      `UPDATE categories SET slug = ?, title = ?, blurb = ?, image = ?, parent_id = ?, kind = ?, sort = ?, is_active = ?
       WHERE id = ?`,
      input.slug,
      input.title,
      input.blurb ?? null,
      input.image ?? null,
      input.parentId ?? null,
      input.kind ?? "general",
      input.sort ?? 0,
      input.isActive === false ? 0 : 1,
      input.id,
    );
    return input.id;
  }
  const result = run(
    `INSERT INTO categories (slug, title, blurb, image, parent_id, kind, sort, is_active)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    input.slug,
    input.title,
    input.blurb ?? null,
    input.image ?? null,
    input.parentId ?? null,
    input.kind ?? "general",
    input.sort ?? 0,
    input.isActive === false ? 0 : 1,
  );
  return result.lastInsertRowid;
}

export function adminDeleteCategory(id: number): void {
  run("DELETE FROM categories WHERE id = ?", id);
}

/* ------------------------------------------------------------------ */
/* دیدگاه‌های محصول                                              */
/* ------------------------------------------------------------------ */

export type AdminReview = {
  id: number;
  productTitle: string;
  productSlug: string;
  name: string;
  rating: number;
  body: string;
  status: string;
  createdAt: string;
};

export function adminListReviews(status?: "pending" | "approved" | "rejected"): Array<AdminReview> {
  const base = `SELECT r.id, r.name, r.rating, r.body, r.status, r.created_at,
      p.title AS product_title, p.slug AS product_slug
    FROM reviews r JOIN products p ON p.id = r.product_id`;

  const rows = status
    ? all<{
        id: number;
        name: string;
        rating: number;
        body: string;
        status: string;
        created_at: string;
        product_title: string;
        product_slug: string;
      }>(`${base} WHERE r.status = ? ORDER BY r.id DESC`, status)
    : all<{
        id: number;
        name: string;
        rating: number;
        body: string;
        status: string;
        created_at: string;
        product_title: string;
        product_slug: string;
      }>(`${base} ORDER BY r.id DESC`);

  return rows.map((row) => ({
    id: row.id,
    productTitle: row.product_title,
    productSlug: row.product_slug,
    name: row.name,
    rating: Number(row.rating),
    body: row.body,
    status: row.status,
    createdAt: row.created_at,
  }));
}

export function adminSetReviewStatus(id: number, status: "pending" | "approved" | "rejected"): void {
  const review = one<{ product_id: number }>("SELECT product_id FROM reviews WHERE id = ?", id);
  run("UPDATE reviews SET status = ? WHERE id = ?", status, id);
  if (review) recalcRating(review.product_id);
}

/* ------------------------------------------------------------------ */
/* کدهای تخفیف                                                      */
/* ------------------------------------------------------------------ */

export type AdminCoupon = {
  id: number;
  code: string;
  kind: string;
  value: number;
  minTotal: number;
  maxOff: number | null;
  maxUses: number | null;
  usedCount: number;
  startsAt: string | null;
  endsAt: string | null;
  isActive: boolean;
};

export function adminListCoupons(): Array<AdminCoupon> {
  return all<{
    id: number;
    code: string;
    kind: string;
    value: number;
    min_total: number;
    max_off: number | null;
    max_uses: number | null;
    used_count: number;
    starts_at: string | null;
    ends_at: string | null;
    is_active: number;
  }>("SELECT * FROM coupons ORDER BY id DESC").map((row) => ({
    id: row.id,
    code: row.code,
    kind: row.kind,
    value: Number(row.value),
    minTotal: Number(row.min_total),
    maxOff: row.max_off === null ? null : Number(row.max_off),
    maxUses: row.max_uses === null ? null : Number(row.max_uses),
    usedCount: Number(row.used_count),
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    isActive: row.is_active === 1,
  }));
}

export function adminSaveCoupon(input: {
  id?: number | null;
  code: string;
  kind?: "percent" | "amount";
  value: number;
  minTotal?: number;
  maxOff?: number | null;
  maxUses?: number | null;
  startsAt?: string | null;
  endsAt?: string | null;
  isActive?: boolean;
}): number {
  const code = input.code.trim().toUpperCase();
  if (input.id) {
    run(
      `UPDATE coupons SET code = ?, kind = ?, value = ?, min_total = ?, max_off = ?, max_uses = ?,
         starts_at = ?, ends_at = ?, is_active = ? WHERE id = ?`,
      code,
      input.kind ?? "percent",
      input.value,
      input.minTotal ?? 0,
      input.maxOff ?? null,
      input.maxUses ?? null,
      input.startsAt ?? null,
      input.endsAt ?? null,
      input.isActive === false ? 0 : 1,
      input.id,
    );
    return input.id;
  }
  const result = run(
    `INSERT INTO coupons (code, kind, value, min_total, max_off, max_uses, starts_at, ends_at, is_active, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    code,
    input.kind ?? "percent",
    input.value,
    input.minTotal ?? 0,
    input.maxOff ?? null,
    input.maxUses ?? null,
    input.startsAt ?? null,
    input.endsAt ?? null,
    input.isActive === false ? 0 : 1,
    nowIso(),
  );
  return result.lastInsertRowid;
}

export function adminDeleteCoupon(id: number): void {
  run("DELETE FROM coupons WHERE id = ?", id);
}
