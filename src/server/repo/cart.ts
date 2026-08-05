import { business } from "@/data/business";

import { all, nowIso, one, run } from "../db";
import { getSettingNumber } from "./catalog";
import { EFFECTIVE_PRICE_SQL } from "./products";

export class CartError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CartError";
  }
}

export type CartLine = {
  itemId: number;
  productId: number;
  variantId: number | null;
  slug: string;
  title: string;
  code: string;
  image: string | null;
  size: string | null;
  color: string | null;
  unitPrice: number;
  basePrice: number;
  qty: number;
  lineTotal: number;
  stock: number;
  categoryKind: "general" | "clothing";
};

export type CartSummary = {
  cartId: number;
  token: string;
  lines: Array<CartLine>;
  itemCount: number;
  itemsTotal: number;
  savingsTotal: number;
  shippingTotal: number;
  remainingForFreeShipping: number;
  grandTotal: number;
};

type CartRow = { id: number; token: string; user_id: number | null };

/** توکن تصادفی با Web Crypto — node:crypto روی Workers قابل اتکا نیست. */
function cartToken(): string {
  const bytes = new Uint8Array(18);
  crypto.getRandomValues(bytes);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export async function findCartByToken(token: string | undefined): Promise<CartRow | undefined> {
  if (!token) return undefined;
  return one<CartRow>("SELECT id, token, user_id FROM carts WHERE token = ?", token);
}

export async function createCart(userId?: number | null): Promise<CartRow> {
  const token = cartToken();
  const now = nowIso();
  const result = await run(
    "INSERT INTO carts (token, user_id, created_at, updated_at) VALUES (?, ?, ?, ?)",
    token,
    userId ?? null,
    now,
    now,
  );
  return { id: result.lastInsertRowid, token, user_id: userId ?? null };
}

/** پس از ورود کاربر، سبد مهمان به حساب او متصل می‌شود. */
export async function attachCartToUser(cartId: number, userId: number): Promise<void> {
  await run("UPDATE carts SET user_id = ?, updated_at = ? WHERE id = ?", userId, nowIso(), cartId);
}

async function touchCart(cartId: number): Promise<void> {
  await run("UPDATE carts SET updated_at = ? WHERE id = ?", nowIso(), cartId);
}

/* ------------------------------------------------------------------ */
/* افزودن و ویرایش اقلام                                        */
/* ------------------------------------------------------------------ */

export async function addToCart(input: {
  cartId: number;
  productId: number;
  variantId?: number | null;
  qty?: number;
}): Promise<void> {
  const qty = Math.max(1, Math.min(input.qty ?? 1, 20));

  const product = await one<{ id: number; stock: number; has_variants: number }>(
    `SELECT p.id, p.stock,
       (SELECT COUNT(*) FROM product_variants v WHERE v.product_id = p.id) AS has_variants
     FROM products p WHERE p.id = ? AND p.is_active = 1`,
    input.productId,
  );
  if (!product) throw new CartError("این محصول در دسترس نیست.");

  const variantId = input.variantId ?? null;
  if (Number(product.has_variants) > 0 && variantId === null) {
    throw new CartError("لطفاً ابتدا سایز و رنگ را انتخاب کنید.");
  }

  let stock = Number(product.stock);
  if (variantId !== null) {
    const variant = await one<{ stock: number }>(
      "SELECT stock FROM product_variants WHERE id = ? AND product_id = ?",
      variantId,
      input.productId,
    );
    if (!variant) throw new CartError("تنوع انتخابی معتبر نیست.");
    stock = Number(variant.stock);
  }
  if (stock <= 0) throw new CartError("موجودی این گزینه تمام شده است.");

  const existing = await one<{ id: number; qty: number }>(
    `SELECT id, qty FROM cart_items
     WHERE cart_id = ? AND product_id = ? AND ((variant_id IS NULL AND ? IS NULL) OR variant_id = ?)`,
    input.cartId,
    input.productId,
    variantId,
    variantId,
  );

  if (existing) {
    const nextQty = Math.min(existing.qty + qty, stock);
    await run("UPDATE cart_items SET qty = ? WHERE id = ?", nextQty, existing.id);
  } else {
    await run(
      "INSERT INTO cart_items (cart_id, product_id, variant_id, qty, created_at) VALUES (?, ?, ?, ?, ?)",
      input.cartId,
      input.productId,
      variantId,
      Math.min(qty, stock),
      nowIso(),
    );
  }
  await touchCart(input.cartId);
}

export async function setCartItemQty(cartId: number, itemId: number, qty: number): Promise<void> {
  if (qty <= 0) {
    await removeCartItem(cartId, itemId);
    return;
  }
  const item = await one<{ product_id: number; variant_id: number | null }>(
    "SELECT product_id, variant_id FROM cart_items WHERE id = ? AND cart_id = ?",
    itemId,
    cartId,
  );
  if (!item) return;

  const stockRow =
    item.variant_id === null
      ? await one<{ stock: number }>("SELECT stock FROM products WHERE id = ?", item.product_id)
      : await one<{ stock: number }>(
          "SELECT stock FROM product_variants WHERE id = ?",
          item.variant_id,
        );

  const stock = Number(stockRow?.stock ?? 0);
  await run(
    "UPDATE cart_items SET qty = ? WHERE id = ?",
    Math.max(1, Math.min(qty, Math.max(stock, 1))),
    itemId,
  );
  await touchCart(cartId);
}

export async function removeCartItem(cartId: number, itemId: number): Promise<void> {
  await run("DELETE FROM cart_items WHERE id = ? AND cart_id = ?", itemId, cartId);
  await touchCart(cartId);
}

export async function clearCart(cartId: number): Promise<void> {
  await run("DELETE FROM cart_items WHERE cart_id = ?", cartId);
  await touchCart(cartId);
}

/* ------------------------------------------------------------------ */
/* محاسبه‌ی سبد                                                     */
/* ------------------------------------------------------------------ */

/** هزینه‌ی ارسال بر اساس تنطیمات قابل تغییر در پنل مدیریت. */
export async function shippingFor(
  itemsTotal: number,
): Promise<{ fee: number; threshold: number; remaining: number }> {
  const [threshold, flatFee] = await Promise.all([
    getSettingNumber("free_shipping_threshold", business.freeShippingThreshold),
    getSettingNumber("shipping_flat_fee", business.shippingFlatFee),
  ]);
  if (itemsTotal <= 0) return { fee: 0, threshold, remaining: threshold };
  if (itemsTotal >= threshold) return { fee: 0, threshold, remaining: 0 };
  return { fee: flatFee, threshold, remaining: threshold - itemsTotal };
}

export async function cartSummary(cart: CartRow): Promise<CartSummary> {
  const rows = await all<{
    item_id: number;
    product_id: number;
    variant_id: number | null;
    slug: string;
    title: string;
    code: string;
    image: string | null;
    size: string | null;
    color: string | null;
    base_price: number;
    effective_price: number;
    price_delta: number | null;
    qty: number;
    stock: number;
    category_kind: string | null;
  }>(
    `SELECT
       ci.id AS item_id, ci.qty, ci.product_id, ci.variant_id,
       p.slug, p.title, p.code, p.price AS base_price,
       ${EFFECTIVE_PRICE_SQL} AS effective_price,
       v.size, v.color, v.price_delta,
       COALESCE(v.stock, p.stock) AS stock,
       c.kind AS category_kind,
       (SELECT i.url FROM product_images i WHERE i.product_id = p.id ORDER BY i.sort ASC, i.id ASC LIMIT 1) AS image
     FROM cart_items ci
     JOIN products p ON p.id = ci.product_id
     LEFT JOIN product_variants v ON v.id = ci.variant_id
     LEFT JOIN categories c ON c.id = p.category_id
     WHERE ci.cart_id = ?
     ORDER BY ci.id ASC`,
    cart.id,
  );

  let itemsTotal = 0;
  let savingsTotal = 0;
  let itemCount = 0;

  const lines: Array<CartLine> = rows.map((row) => {
    const delta = Number(row.price_delta ?? 0);
    const unitPrice = Number(row.effective_price) + delta;
    const basePrice = Number(row.base_price) + delta;
    const qty = Number(row.qty);
    const lineTotal = unitPrice * qty;

    itemsTotal += lineTotal;
    savingsTotal += Math.max(0, (basePrice - unitPrice) * qty);
    itemCount += qty;

    return {
      itemId: row.item_id,
      productId: row.product_id,
      variantId: row.variant_id,
      slug: row.slug,
      title: row.title,
      code: row.code,
      image: row.image,
      size: row.size,
      color: row.color,
      unitPrice,
      basePrice,
      qty,
      lineTotal,
      stock: Number(row.stock),
      categoryKind: row.category_kind === "clothing" ? "clothing" : "general",
    };
  });

  const shipping = await shippingFor(itemsTotal);

  return {
    cartId: cart.id,
    token: cart.token,
    lines,
    itemCount,
    itemsTotal,
    savingsTotal,
    shippingTotal: shipping.fee,
    remainingForFreeShipping: shipping.remaining,
    grandTotal: itemsTotal + shipping.fee,
  };
}
