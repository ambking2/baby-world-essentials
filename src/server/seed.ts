/**
 * پرکردن دیتابیس با دادهٔ اولیه.
 *
 * محلی (node:sqlite):   npm run seed
 * روی Cloudflare: با اولین درخواستِ ورکر نیز به‌صورت خودکار اجرا می‌شود،
 * اگر دیتابیس هنوز خالی باشد.
 */
import { business } from "../data/business";
import { hashPassword } from "./auth";
import { ensureSchema, nowIso, one, run } from "./db";
import { setSetting } from "./repo/catalog";
import { CATEGORIES, POSTS, PRODUCTS, type SeedCategory } from "./seed-data";

function daysFromNow(days: number): string {
  return new Date(Date.now() + days * 86_400_000).toISOString();
}

function daysAgo(days: number): string {
  return new Date(Date.now() - days * 86_400_000).toISOString();
}

async function insertCategory(
  category: SeedCategory,
  parentId: number | null,
  sort: number,
): Promise<number> {
  const result = await run(
    `INSERT INTO categories (slug, title, blurb, image, parent_id, kind, sort, is_active)
     VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
    category.slug,
    category.title,
    category.blurb,
    category.image,
    parentId,
    category.kind ?? "general",
    sort,
  );
  return result.lastInsertRowid;
}

async function seedCategories(): Promise<Map<string, number>> {
  const ids = new Map<string, number>();

  for (const [parentIndex, parent] of CATEGORIES.entries()) {
    const parentId = await insertCategory(parent, null, parentIndex);
    ids.set(parent.slug, parentId);

    const children = parent.children ?? [];
    for (const [childIndex, child] of children.entries()) {
      ids.set(child.slug, await insertCategory(child, parentId, childIndex));
    }
  }

  return ids;
}

async function seedProducts(categoryIds: Map<string, number>): Promise<void> {
  const now = nowIso();

  for (const product of PRODUCTS) {
    const categoryId = categoryIds.get(product.category) ?? null;
    const timed = typeof product.salePercent === "number" && typeof product.saleDays === "number";
    const variantStock = (product.variants ?? []).reduce(
      (total, variant) => total + (variant.stock ?? 0),
      0,
    );

    const result = await run(
      `INSERT INTO products (
         code, slug, title, subtitle, description, category_id, price, discount_percent,
         sale_percent, sale_starts_at, sale_ends_at, stock, weight_grams,
         is_active, is_featured, made_in_workshop, badge, sold_count, created_at, updated_at
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?, ?)`,
      product.code,
      product.slug,
      product.title,
      product.subtitle,
      product.description,
      categoryId,
      product.price,
      product.discountPercent ?? 0,
      timed ? (product.salePercent as number) : 0,
      timed ? now : null,
      timed ? daysFromNow(product.saleDays as number) : null,
      product.variants && product.variants.length > 0 ? variantStock : product.stock,
      product.weightGrams ?? 0,
      product.isFeatured === true ? 1 : 0,
      product.madeInWorkshop === true ? 1 : 0,
      product.badge ?? null,
      product.soldCount ?? 0,
      now,
      now,
    );
    const productId = result.lastInsertRowid;

    for (const [index, url] of product.images.entries()) {
      await run(
        "INSERT INTO product_images (product_id, url, alt, sort) VALUES (?, ?, ?, ?)",
        productId,
        url,
        product.title,
        index,
      );
    }

    for (const [index, attribute] of product.attributes.entries()) {
      await run(
        "INSERT INTO product_attributes (product_id, name, value, sort) VALUES (?, ?, ?, ?)",
        productId,
        attribute.name,
        attribute.value,
        index,
      );
    }

    const variants = product.variants ?? [];
    for (const [index, variant] of variants.entries()) {
      await run(
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
    }
  }
}

async function seedPosts(): Promise<void> {
  for (const post of POSTS) {
    await run(
      `INSERT INTO blog_posts (slug, title, excerpt, body, cover, tag, author, status, published_at, view_count)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'published', ?, ?)`,
      post.slug,
      post.title,
      post.excerpt,
      post.body,
      post.cover,
      post.tag,
      business.shortName,
      daysAgo(post.daysAgo),
      40 + post.daysAgo * 3,
    );
  }
}

async function seedSettings(): Promise<void> {
  await setSetting("free_shipping_threshold", String(business.freeShippingThreshold));
  await setSetting("shipping_flat_fee", String(business.shippingFlatFee));
  await setSetting("card_number", business.cardNumber);
  await setSetting("card_holder", business.cardHolder);
  await setSetting("card_bank", business.cardBank);
  await setSetting(
    "announcement",
    "ارسال رایگان برای سفارش‌های بالای پنج میلیون تومان — مشاورهٔ خرید در فروشگاه ابهر",
  );
}

async function seedCoupon(): Promise<void> {
  await run(
    `INSERT INTO coupons (code, kind, value, min_total, max_off, max_uses, used_count, starts_at, ends_at, is_active, created_at)
     VALUES ('JAHAN10', 'percent', 10, 2000000, 800000, 100, 0, ?, ?, 1, ?)`,
    nowIso(),
    daysFromNow(60),
    nowIso(),
  );
}

async function seedAdmin(): Promise<string> {
  const email = (process.env["ADMIN_EMAIL"] ?? "admin@jahankoodak.ir").toLowerCase();
  const password = process.env["ADMIN_PASSWORD"] ?? "Jahan@1404";
  const passwordHash = await hashPassword(password);

  await run(
    `INSERT INTO users (email, password_hash, name, phone, role, email_verified_at, created_at)
     VALUES (?, ?, ?, ?, 'admin', ?, ?)`,
    email,
    passwordHash,
    business.manager,
    business.phoneDisplay,
    nowIso(),
    nowIso(),
  );

  return email;
}

export async function seedIfEmpty(): Promise<boolean> {
  await ensureSchema();

  const existing = await one<{ c: number }>("SELECT COUNT(*) AS c FROM products");
  if (existing && Number(existing.c) > 0) {
    return false;
  }

  const adminEmail = await seedAdmin();
  const categoryIds = await seedCategories();
  await seedProducts(categoryIds);
  await seedPosts();
  await seedSettings();
  await seedCoupon();

  console.log("دادهٔ اولیه با موفقیت وارد شد.");
  console.log(`تعداد محصولات: ${PRODUCTS.length} — تعداد مقالات: ${POSTS.length}`);
  console.log(`ورود مدیر: ${adminEmail}`);
  return true;
}

const isDirectRun =
  typeof process !== "undefined" &&
  typeof process.argv?.[1] === "string" &&
  process.argv[1].includes("seed");

if (isDirectRun) {
  void seedIfEmpty().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
