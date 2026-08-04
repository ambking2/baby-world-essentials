import { all, one, run } from "../db";

/** نوع دسته: لباس صفحه‌ی محصول متفاوت و انتخاب سایز دارد. */
export type CategoryKind = "general" | "clothing";

export type CategoryRow = {
  id: number;
  slug: string;
  title: string;
  blurb: string | null;
  image: string | null;
  parent_id: number | null;
  kind: string;
  sort: number;
  is_active: number;
  product_count?: number;
};

export type Category = {
  id: number;
  slug: string;
  title: string;
  blurb: string | null;
  image: string | null;
  parentId: number | null;
  kind: CategoryKind;
  sort: number;
  productCount: number;
  children: Array<Category>;
};

/** شمارش محصولات فعال هر دسته (شامل خود دسته). */
const COUNT_SELECT = `(
  SELECT COUNT(*) FROM products p
  WHERE p.category_id = c.id AND p.is_active = 1
) AS product_count`;

function toCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    blurb: row.blurb,
    image: row.image,
    parentId: row.parent_id,
    kind: row.kind === "clothing" ? "clothing" : "general",
    sort: row.sort,
    productCount: Number(row.product_count ?? 0),
    children: [],
  };
}

/** درخت دوسطحی دسته‌بندی‌ها برای منوی مگا و سایدبار فیلتر. */
export function categoryTree(): Array<Category> {
  const rows = all<CategoryRow>(
    `SELECT c.*, ${COUNT_SELECT} FROM categories c
     WHERE c.is_active = 1
     ORDER BY c.sort ASC, c.id ASC`,
  );
  const byId = new Map<number, Category>();
  const roots: Array<Category> = [];

  for (const row of rows) byId.set(row.id, toCategory(row));
  for (const category of byId.values()) {
    if (category.parentId === null) {
      roots.push(category);
      continue;
    }
    const parent = byId.get(category.parentId);
    if (parent) parent.children.push(category);
    else roots.push(category);
  }
  // تعداد محصولات دسته‌ی والد = خودش + زیردسته‌ها
  for (const root of roots) {
    root.productCount += root.children.reduce((sum, child) => sum + child.productCount, 0);
  }
  return roots;
}

export function flatCategories(): Array<Category> {
  return all<CategoryRow>(
    `SELECT c.*, ${COUNT_SELECT} FROM categories c ORDER BY c.sort ASC, c.id ASC`,
  ).map(toCategory);
}

export function categoryBySlug(slug: string): Category | null {
  const row = one<CategoryRow>(
    `SELECT c.*, ${COUNT_SELECT} FROM categories c WHERE c.slug = ?`,
    slug,
  );
  return row ? toCategory(row) : null;
}

/** شناسه‌ی دسته همراه همه‌ی زیردسته‌ها — برای فیلتر محصولات. */
export function categoryIdsWithChildren(categoryId: number): Array<number> {
  const children = all<{ id: number }>(
    "SELECT id FROM categories WHERE parent_id = ?",
    categoryId,
  );
  return [categoryId, ...children.map((child) => child.id)];
}

/** مسیر راهنما (breadcrumb) از ریشه تا دسته‌ی جاری. */
export function breadcrumbFor(slug: string): Array<{ title: string; slug: string }> {
  const trail: Array<{ title: string; slug: string }> = [];
  let current = one<CategoryRow>("SELECT * FROM categories WHERE slug = ?", slug);
  let guard = 0;
  while (current && guard < 6) {
    trail.unshift({ title: current.title, slug: current.slug });
    current =
      current.parent_id === null
        ? undefined
        : one<CategoryRow>("SELECT * FROM categories WHERE id = ?", current.parent_id);
    guard += 1;
  }
  return trail;
}

/* ------------------------------------------------------------------ */
/* تنظیمات فروشگاه                                                 */
/* ------------------------------------------------------------------ */

export function getSetting(key: string): string | null {
  const row = one<{ value: string | null }>("SELECT value FROM settings WHERE key = ?", key);
  return row?.value ?? null;
}

export function getSettingNumber(key: string, fallback: number): number {
  const raw = getSetting(key);
  if (raw === null) return fallback;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function setSetting(key: string, value: string | number): void {
  run(
    `INSERT INTO settings (key, value) VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
    key,
    String(value),
  );
}

export function allSettings(): Record<string, string> {
  const rows = all<{ key: string; value: string | null }>("SELECT key, value FROM settings");
  const result: Record<string, string> = {};
  for (const row of rows) result[row.key] = row.value ?? "";
  return result;
}

/* ------------------------------------------------------------------ */
/* خبرنامه و پیام تماس                                            */
/* ------------------------------------------------------------------ */

export function subscribeNewsletter(email: string): void {
  run(
    "INSERT OR IGNORE INTO newsletter (email, created_at) VALUES (?, ?)",
    email.trim().toLowerCase(),
    new Date().toISOString(),
  );
}

export function saveContactMessage(input: {
  name: string;
  phone?: string | null;
  email?: string | null;
  subject?: string | null;
  body: string;
}): void {
  run(
    `INSERT INTO contact_messages (name, phone, email, subject, body, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    input.name,
    input.phone ?? null,
    input.email ?? null,
    input.subject ?? null,
    input.body,
    new Date().toISOString(),
  );
}
