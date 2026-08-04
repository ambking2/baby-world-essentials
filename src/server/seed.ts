/**
 * پرکردن دیتابیس با دادهٔ اولیه.
 * اجرا: npm run seed
 */
import { business } from "../data/business";
import { hashPassword } from "./auth";
import { getDb, nowIso, one, run, transaction } from "./db";
import { setSetting } from "./repo/catalog";
import { CATEGORIES, POSTS, PRODUCTS, type SeedCategory } from "./seed-data";

function daysFromNow(days: number): string {
  return new Date(Date.now() + days * 86_400_000).toISOString();
}

function daysAgo(days: number): string {
  return new Date(Date.now() - days * 86_400_000).toISOString();
}

function insertCategory(category: SeedCategory, parentId: number | null, sort: number): number {
  const result = run(
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

function seedCategories(): Map<string, number> {
  const ids = new Map<string, number>();
  CATEGORIES.forEach((parent, parentIndex) => {
    const parentId = insertCategory(parent, null, parentIndex);
    ids.set(parent.slug, parentId);
    (parent.children ?? []).forEach((child, childIndex) => {
      ids.set(child.slug, insertCategory(child, parentId, childIndex));
    });
  });
  return ids;
}

function seedProducts(categoryIds: Map<string, number>): void {
  const now = nowIso();

  for (const product of PRODUCTS) {
    const categoryId = categoryIds.get(product.category) ?? null;
    const timed = typeof product.salePercent === "number" && typeof product.saleDays === "number";
    const variantStock = (product.variants ?? []).reduce((total, variant) => total + (variant.stock ?? 0), 0);

    const result = run(
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

    product.images.forEach((url, index) => {
      run(
        "INSERT INTO product_images (product_id, url, alt, sort) VALUES (?, ?, ?, ?)",
        productId,
        url,
        product.title,
        index,
      );
    });

    product.attributes.forEach((attribute, index) => {
      run(
        "INSERT INTO product_attributes (product_id, name, value, sort) VALUES (?, ?, ?, ?)",
        productId,
        attribute.name,
        attribute.value,
        index,
      );
    });

    (product.variants ?? []).forEach((variant, index) => {
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
}

function seedPosts(): void {
  for (const post of POSTS) {
    run(
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

function seedSettings(): void {
  setSetting("free_shipping_threshold", String(business.freeShippingThreshold));
  setSetting("shipping_flat_fee", String(business.shippingFlatFee));
  setSetting("card_number", business.cardNumber);
  setSetting("card_holder", business.cardHolder);
  setSetting("card_bank", business.cardBank);
  setSetting(
    "announcement",
    "ارسال رایگان برای سفارش‌های بالای پنج میلیون تومان — مشاورهٔ خرید در فروشگاه ابهر",
  );
}

function seedCoupon(): void {
  run(
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

  run(
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

async function seed(): Promise<void> {
  getDb();

  const existing = one<{ c: number }>("SELECT COUNT(*) AS c FROM products");
  if (existing && Number(existing.c) > 0) {
    console.log("دیتابیس از قبل داده دارد؛ برای پرکردن مجدد، فایل data/store.db را حذف کنید.");
    return;
  }

  const adminEmail = await seedAdmin();

  transaction(() => {
    const categoryIds = seedCategories();
    seedProducts(categoryIds);
    seedPosts();
    seedSettings();
    seedCoupon();
    return true;
  });

  console.log("دادهٔ اولیه با موفقیت وارد شد.");
  console.log(`تعداد محصولات: ${PRODUCTS.length} — تعداد مقالات: ${POSTS.length}`);
  console.log(`ورود مدیر: ${adminEmail}`);
}

await seed();
