import { all, count, nowIso, one, run, type SqlInput } from "../db";

/* ------------------------------------------------------------------ */
/* محاسبه‌ی قیمت موثر در SQL                                       */
/* تخفیف زمان‌دار بر تخفیف ساده اولویت دارد.                       */
/* ------------------------------------------------------------------ */

const ACTIVE_SALE_SQL = `(
  p.sale_percent > 0
  AND (p.sale_starts_at IS NULL OR datetime(p.sale_starts_at) <= datetime('now'))
  AND (p.sale_ends_at IS NULL OR datetime(p.sale_ends_at) > datetime('now'))
)`;

/** قیمت نهایی، روندشده به هزار تومان. */
export const EFFECTIVE_PRICE_SQL = `CAST(ROUND(
  (p.price * (100 - CASE WHEN ${ACTIVE_SALE_SQL} THEN p.sale_percent ELSE p.discount_percent END) / 100.0)
  / 1000.0
) * 1000 AS INTEGER)`;

const COVER_SQL = `(
  SELECT i.url FROM product_images i
  WHERE i.product_id = p.id
  ORDER BY i.sort ASC, i.id ASC LIMIT 1
)`;

/** موجودی کل: اگر تنوع دارد، جمع موجودی تنوع‌ها. */
const STOCK_EXPR = `(
  CASE WHEN EXISTS (SELECT 1 FROM product_variants v WHERE v.product_id = p.id)
  THEN (SELECT COALESCE(SUM(v.stock), 0) FROM product_variants v WHERE v.product_id = p.id)
  ELSE p.stock END
)`;

const CARD_SELECT = `SELECT
  p.id, p.code, p.slug, p.title, p.subtitle, p.price, p.badge,
  p.discount_percent, p.sale_percent, p.sale_ends_at,
  p.rating_sum, p.rating_count, p.sold_count, p.is_featured, p.made_in_workshop,
  c.slug AS category_slug, c.title AS category_title, c.kind AS category_kind,
  ${EFFECTIVE_PRICE_SQL} AS effective_price,
  ${ACTIVE_SALE_SQL} AS sale_active,
  ${COVER_SQL} AS cover,
  ${STOCK_EXPR} AS available_stock
FROM products p
LEFT JOIN categories c ON c.id = p.category_id`;

export type ProductCard = {
  id: number;
  code: string;
  slug: string;
  title: string;
  subtitle: string | null;
  price: number;
  effectivePrice: number;
  discountPercent: number;
  saleActive: boolean;
  saleEndsAt: string | null;
  badge: string | null;
  cover: string | null;
  stock: number;
  ratingAverage: number;
  ratingCount: number;
  soldCount: number;
  isFeatured: boolean;
  madeInWorkshop: boolean;
  categorySlug: string | null;
  categoryTitle: string | null;
  categoryKind: "general" | "clothing";
};

type CardRow = {
  id: number;
  code: string;
  slug: string;
  title: string;
  subtitle: string | null;
  price: number;
  badge: string | null;
  discount_percent: number;
  sale_percent: number;
  sale_ends_at: string | null;
  rating_sum: number;
  rating_count: number;
  sold_count: number;
  is_featured: number;
  made_in_workshop: number;
  category_slug: string | null;
  category_title: string | null;
  category_kind: string | null;
  effective_price: number;
  sale_active: number;
  cover: string | null;
  available_stock: number;
};

function mapCard(row: CardRow): ProductCard {
  const effective = Number(row.effective_price);
  const price = Number(row.price);
  return {
    id: row.id,
    code: row.code,
    slug: row.slug,
    title: row.title,
    subtitle: row.subtitle,
    price,
    effectivePrice: effective,
    discountPercent: price > 0 && effective < price ? Math.round(((price - effective) / price) * 100) : 0,
    saleActive: Number(row.sale_active) === 1,
    saleEndsAt: Number(row.sale_active) === 1 ? row.sale_ends_at : null,
    badge: row.badge,
    cover: row.cover,
    stock: Number(row.available_stock),
    ratingAverage: row.rating_count > 0 ? row.rating_sum / row.rating_count : 0,
    ratingCount: Number(row.rating_count),
    soldCount: Number(row.sold_count),
    isFeatured: row.is_featured === 1,
    madeInWorkshop: row.made_in_workshop === 1,
    categorySlug: row.category_slug,
    categoryTitle: row.category_title,
    categoryKind: row.category_kind === "clothing" ? "clothing" : "general",
  };
}

function cardQuery(where: string, order: string, limit: number, params: Array<SqlInput> = []): Array<ProductCard> {
  return all<CardRow>(`${CARD_SELECT} WHERE ${where} ORDER BY ${order} LIMIT ?`, ...params, limit).map(mapCard);
}

/* ------------------------------------------------------------------ */
/* فیلتر و فهرست محصولات                                        */
/* ------------------------------------------------------------------ */

export type SortKey = "newest" | "cheapest" | "expensive" | "popular" | "rating" | "discount";

const SORT_SQL: Record<SortKey, string> = {
  newest: "p.created_at DESC, p.id DESC",
  cheapest: "effective_price ASC",
  expensive: "effective_price DESC",
  popular: "p.sold_count DESC, p.view_count DESC",
  rating: "(CASE WHEN p.rating_count = 0 THEN 0 ELSE p.rating_sum * 1.0 / p.rating_count END) DESC",
  discount: "(p.price - effective_price) DESC",
};

export type ProductFilters = {
  categoryIds?: Array<number>;
  q?: string;
  minPrice?: number;
  maxPrice?: number;
  sizes?: Array<string>;
  colors?: Array<string>;
  onlyAvailable?: boolean;
  onlyDiscounted?: boolean;
  sort?: SortKey;
  page?: number;
  perPage?: number;
};

export type ProductListResult = {
  items: Array<ProductCard>;
  total: number;
  page: number;
  perPage: number;
  pageCount: number;
  priceBounds: { min: number; max: number };
  availableSizes: Array<string>;
  availableColors: Array<{ color: string; hex: string | null }>;
};

function buildWhere(filters: ProductFilters): { sql: string; params: Array<SqlInput> } {
  const clauses = ["p.is_active = 1"];
  const params: Array<SqlInput> = [];

  if (filters.categoryIds && filters.categoryIds.length > 0) {
    clauses.push(`p.category_id IN (${filters.categoryIds.map(() => "?").join(", ")})`);
    params.push(...filters.categoryIds);
  }
  if (filters.q && filters.q.trim().length > 0) {
    clauses.push("(p.title LIKE ? OR p.subtitle LIKE ? OR p.description LIKE ? OR p.code LIKE ?)");
    const like = `%${filters.q.trim()}%`;
    params.push(like, like, like, like);
  }
  if (typeof filters.minPrice === "number") {
    clauses.push(`${EFFECTIVE_PRICE_SQL} >= ?`);
    params.push(filters.minPrice);
  }
  if (typeof filters.maxPrice === "number") {
    clauses.push(`${EFFECTIVE_PRICE_SQL} <= ?`);
    params.push(filters.maxPrice);
  }
  if (filters.sizes && filters.sizes.length > 0) {
    clauses.push(
      `EXISTS (SELECT 1 FROM product_variants v WHERE v.product_id = p.id AND v.size IN (${filters.sizes
        .map(() => "?")
        .join(", ")}))`,
    );
    params.push(...filters.sizes);
  }
  if (filters.colors && filters.colors.length > 0) {
    clauses.push(
      `EXISTS (SELECT 1 FROM product_variants v WHERE v.product_id = p.id AND v.color IN (${filters.colors
        .map(() => "?")
        .join(", ")}))`,
    );
    params.push(...filters.colors);
  }
  if (filters.onlyAvailable) clauses.push(`${STOCK_EXPR} > 0`);
  if (filters.onlyDiscounted) clauses.push(`${EFFECTIVE_PRICE_SQL} < p.price`);

  return { sql: clauses.join(" AND "), params };
}

export function listProducts(filters: ProductFilters = {}): ProductListResult {
  const perPage = Math.min(Math.max(filters.perPage ?? 12, 1), 48);
  const page = Math.max(filters.page ?? 1, 1);
  const sort = filters.sort ?? "newest";
  const { sql, params } = buildWhere(filters);

  const total = count(
    `SELECT COUNT(*) AS c FROM products p LEFT JOIN categories c2 ON c2.id = p.category_id WHERE ${sql}`,
    ...params,
  );

  const items = all<CardRow>(
    `${CARD_SELECT} WHERE ${sql} ORDER BY ${SORT_SQL[sort]} LIMIT ? OFFSET ?`,
    ...params,
    perPage,
    (page - 1) * perPage,
  ).map(mapCard);

  // محدوده‌ی قیمت و مقادیر فیلتر برای همان دسته (بدون محدودیت قیمت)
  const facetFilters: ProductFilters = {};
  if (filters.categoryIds) facetFilters.categoryIds = filters.categoryIds;
  if (filters.q) facetFilters.q = filters.q;
  const facet = buildWhere(facetFilters);

  const bounds = one<{ min_price: number | null; max_price: number | null }>(
    `SELECT MIN(${EFFECTIVE_PRICE_SQL}) AS min_price, MAX(${EFFECTIVE_PRICE_SQL}) AS max_price
     FROM products p WHERE ${facet.sql}`,
    ...facet.params,
  );

  const sizes = all<{ size: string }>(
    `SELECT DISTINCT v.size AS size FROM product_variants v
     JOIN products p ON p.id = v.product_id
     WHERE v.size IS NOT NULL AND ${facet.sql}
     ORDER BY v.sort ASC`,
    ...facet.params,
  ).map((row) => row.size);

  const colors = all<{ color: string; color_hex: string | null }>(
    `SELECT DISTINCT v.color AS color, v.color_hex FROM product_variants v
     JOIN products p ON p.id = v.product_id
     WHERE v.color IS NOT NULL AND ${facet.sql}
     ORDER BY v.color ASC`,
    ...facet.params,
  ).map((row) => ({ color: row.color, hex: row.color_hex }));

  return {
    items,
    total,
    page,
    perPage,
    pageCount: Math.max(Math.ceil(total / perPage), 1),
    priceBounds: { min: Number(bounds?.min_price ?? 0), max: Number(bounds?.max_price ?? 0) },
    availableSizes: sizes,
    availableColors: colors,
  };
}

/* ------------------------------------------------------------------ */
/* فهرست‌های صفحه‌ی اول                                            */
/* ------------------------------------------------------------------ */

export function featuredProducts(limit = 8): Array<ProductCard> {
  return cardQuery("p.is_active = 1 AND p.is_featured = 1", "p.sold_count DESC, p.id DESC", limit);
}

export function newestProducts(limit = 8): Array<ProductCard> {
  return cardQuery("p.is_active = 1", "p.created_at DESC, p.id DESC", limit);
}

export function bestSellers(limit = 8): Array<ProductCard> {
  return cardQuery("p.is_active = 1", "p.sold_count DESC, p.view_count DESC", limit);
}

export function onSaleProducts(limit = 8): Array<ProductCard> {
  return cardQuery(`p.is_active = 1 AND ${EFFECTIVE_PRICE_SQL} < p.price`, "(p.price - effective_price) DESC", limit);
}

/** تخفیف‌های زمان‌دار فعال — برای نوار شمارش معکوس. */
export function flashSaleProducts(limit = 8): Array<ProductCard> {
  return cardQuery(
    `p.is_active = 1 AND ${ACTIVE_SALE_SQL} AND p.sale_ends_at IS NOT NULL`,
    "datetime(p.sale_ends_at) ASC",
    limit,
  );
}

export function topRated(limit = 5): Array<ProductCard> {
  return cardQuery(
    "p.is_active = 1 AND p.rating_count > 0",
    "(p.rating_sum * 1.0 / p.rating_count) DESC, p.rating_count DESC",
    limit,
  );
}

/** پیشنهاد زنده‌ی جستجو در هدر. */
export function searchSuggest(term: string, limit = 6): Array<ProductCard> {
  const like = `%${term.trim()}%`;
  return cardQuery("p.is_active = 1 AND (p.title LIKE ? OR p.code LIKE ?)", "p.sold_count DESC", limit, [like, like]);
}

/* ------------------------------------------------------------------ */
/* صفحه‌ی محصول                                                    */
/* ------------------------------------------------------------------ */

export type ProductVariant = {
  id: number;
  size: string | null;
  color: string | null;
  colorHex: string | null;
  priceDelta: number;
  stock: number;
};

export type ProductReview = {
  id: number;
  name: string;
  rating: number;
  body: string;
  createdAt: string;
};

export type ProductDetail = ProductCard & {
  description: string | null;
  weightGrams: number;
  images: Array<{ url: string; alt: string | null }>;
  attributes: Array<{ name: string; value: string }>;
  variants: Array<ProductVariant>;
  reviews: Array<ProductReview>;
  viewCount: number;
};

export function productBySlug(slug: string): ProductDetail | null {
  const row = one<CardRow & { description: string | null; weight_grams: number; view_count: number }>(
    `${CARD_SELECT.replace(
      "p.id, p.code",
      "p.id, p.description, p.weight_grams, p.view_count, p.code",
    )} WHERE p.slug = ? AND p.is_active = 1`,
    slug,
  );
  if (!row) return null;

  const images = all<{ url: string; alt: string | null }>(
    "SELECT url, alt FROM product_images WHERE product_id = ? ORDER BY sort ASC, id ASC",
    row.id,
  );
  const attributes = all<{ name: string; value: string }>(
    "SELECT name, value FROM product_attributes WHERE product_id = ? ORDER BY sort ASC, id ASC",
    row.id,
  );
  const variants = all<{
    id: number;
    size: string | null;
    color: string | null;
    color_hex: string | null;
    price_delta: number;
    stock: number;
  }>(
    "SELECT id, size, color, color_hex, price_delta, stock FROM product_variants WHERE product_id = ? ORDER BY sort ASC, id ASC",
    row.id,
  ).map((variant) => ({
    id: variant.id,
    size: variant.size,
    color: variant.color,
    colorHex: variant.color_hex,
    priceDelta: Number(variant.price_delta),
    stock: Number(variant.stock),
  }));
  const reviews = all<{ id: number; name: string; rating: number; body: string; created_at: string }>(
    "SELECT id, name, rating, body, created_at FROM reviews WHERE product_id = ? AND status = 'approved' ORDER BY id DESC",
    row.id,
  ).map((review) => ({
    id: review.id,
    name: review.name,
    rating: Number(review.rating),
    body: review.body,
    createdAt: review.created_at,
  }));

  return {
    ...mapCard(row),
    description: row.description,
    weightGrams: Number(row.weight_grams),
    viewCount: Number(row.view_count),
    images,
    attributes,
    variants,
    reviews,
  };
}

export function relatedProducts(productId: number, categoryId: number | null, limit = 4): Array<ProductCard> {
  if (categoryId === null) return newestProducts(limit);
  return cardQuery("p.is_active = 1 AND p.category_id = ? AND p.id <> ?", "p.sold_count DESC, p.id DESC", limit, [
    categoryId,
    productId,
  ]);
}

export function incrementProductView(productId: number): void {
  run("UPDATE products SET view_count = view_count + 1 WHERE id = ?", productId);
}

/** قیمت موثر یک محصول (با احتساب اختلاف قیمت تنوع). */
export function effectivePriceOf(productId: number, variantId?: number | null): number {
  const row = one<{ effective_price: number }>(
    `SELECT ${EFFECTIVE_PRICE_SQL} AS effective_price FROM products p WHERE p.id = ?`,
    productId,
  );
  const base = Number(row?.effective_price ?? 0);
  if (variantId === undefined || variantId === null) return base;
  const variant = one<{ price_delta: number }>(
    "SELECT price_delta FROM product_variants WHERE id = ? AND product_id = ?",
    variantId,
    productId,
  );
  return base + Number(variant?.price_delta ?? 0);
}

export function availableStock(productId: number, variantId?: number | null): number {
  if (variantId !== undefined && variantId !== null) {
    const variant = one<{ stock: number }>(
      "SELECT stock FROM product_variants WHERE id = ? AND product_id = ?",
      variantId,
      productId,
    );
    return Number(variant?.stock ?? 0);
  }
  const row = one<{ stock: number }>(`SELECT ${STOCK_EXPR} AS stock FROM products p WHERE p.id = ?`, productId);
  return Number(row?.stock ?? 0);
}

/* ------------------------------------------------------------------ */
/* دیدگاه‌ها                                                         */
/* ------------------------------------------------------------------ */

export function addReview(input: {
  productId: number;
  userId?: number | null;
  name: string;
  rating: number;
  body: string;
}): void {
  const rating = Math.min(Math.max(Math.round(input.rating), 1), 5);
  run(
    `INSERT INTO reviews (product_id, user_id, name, rating, body, status, created_at)
     VALUES (?, ?, ?, ?, ?, 'pending', ?)`,
    input.productId,
    input.userId ?? null,
    input.name,
    rating,
    input.body,
    nowIso(),
  );
}

/** پس از تأیید/رد دیدگاه توسط مدیر، امتیاز محصول بازمحاسبه می‌شود. */
export function recalcRating(productId: number): void {
  const row = one<{ total: number | null; c: number }>(
    "SELECT SUM(rating) AS total, COUNT(*) AS c FROM reviews WHERE product_id = ? AND status = 'approved'",
    productId,
  );
  run(
    "UPDATE products SET rating_sum = ?, rating_count = ?, updated_at = ? WHERE id = ?",
    Number(row?.total ?? 0),
    Number(row?.c ?? 0),
    nowIso(),
    productId,
  );
}
