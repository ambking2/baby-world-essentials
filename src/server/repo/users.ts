import { all, count, nowIso, one, run } from "../db";
import { EFFECTIVE_PRICE_SQL } from "./products";

/* ------------------------------------------------------------------ */
/* نشانی‌ها                                                          */
/* ------------------------------------------------------------------ */

export type Address = {
  id: number;
  receiver: string;
  phone: string;
  province: string;
  city: string;
  postalCode: string | null;
  line: string;
  isDefault: boolean;
};

type AddressRow = {
  id: number;
  receiver: string;
  phone: string;
  province: string;
  city: string;
  postal_code: string | null;
  line: string;
  is_default: number;
};

function mapAddress(row: AddressRow): Address {
  return {
    id: row.id,
    receiver: row.receiver,
    phone: row.phone,
    province: row.province,
    city: row.city,
    postalCode: row.postal_code,
    line: row.line,
    isDefault: row.is_default === 1,
  };
}

export function listAddresses(userId: number): Array<Address> {
  return all<AddressRow>(
    "SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, id DESC",
    userId,
  ).map(mapAddress);
}

export function defaultAddress(userId: number): Address | null {
  const row = one<AddressRow>(
    "SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, id DESC LIMIT 1",
    userId,
  );
  return row ? mapAddress(row) : null;
}

export function saveAddress(
  userId: number,
  input: {
    id?: number | null;
    receiver: string;
    phone: string;
    province: string;
    city: string;
    postalCode?: string | null;
    line: string;
    isDefault?: boolean;
  },
): number {
  const makeDefault = input.isDefault === true;
  if (makeDefault) run("UPDATE addresses SET is_default = 0 WHERE user_id = ?", userId);

  if (input.id) {
    run(
      `UPDATE addresses SET receiver = ?, phone = ?, province = ?, city = ?, postal_code = ?, line = ?, is_default = ?
       WHERE id = ? AND user_id = ?`,
      input.receiver,
      input.phone,
      input.province,
      input.city,
      input.postalCode ?? null,
      input.line,
      makeDefault ? 1 : 0,
      input.id,
      userId,
    );
    return input.id;
  }

  const isFirst = count("SELECT COUNT(*) AS c FROM addresses WHERE user_id = ?", userId) === 0;
  const result = run(
    `INSERT INTO addresses (user_id, receiver, phone, province, city, postal_code, line, is_default, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    userId,
    input.receiver,
    input.phone,
    input.province,
    input.city,
    input.postalCode ?? null,
    input.line,
    makeDefault || isFirst ? 1 : 0,
    nowIso(),
  );
  return result.lastInsertRowid;
}

export function deleteAddress(userId: number, addressId: number): void {
  run("DELETE FROM addresses WHERE id = ? AND user_id = ?", addressId, userId);
}

/* ------------------------------------------------------------------ */
/* علاقه‌مندی‌ها                                                     */
/* ------------------------------------------------------------------ */

export type WishlistItem = {
  productId: number;
  slug: string;
  title: string;
  price: number;
  effectivePrice: number;
  cover: string | null;
  stock: number;
};

export function listWishlist(userId: number): Array<WishlistItem> {
  return all<{
    product_id: number;
    slug: string;
    title: string;
    price: number;
    effective_price: number;
    cover: string | null;
    stock: number;
  }>(
    `SELECT p.id AS product_id, p.slug, p.title, p.price, p.stock,
       ${EFFECTIVE_PRICE_SQL} AS effective_price,
       (SELECT i.url FROM product_images i WHERE i.product_id = p.id ORDER BY i.sort ASC, i.id ASC LIMIT 1) AS cover
     FROM wishlist w JOIN products p ON p.id = w.product_id
     WHERE w.user_id = ? ORDER BY w.id DESC`,
    userId,
  ).map((row) => ({
    productId: row.product_id,
    slug: row.slug,
    title: row.title,
    price: Number(row.price),
    effectivePrice: Number(row.effective_price),
    cover: row.cover,
    stock: Number(row.stock),
  }));
}

export function wishlistIds(userId: number): Array<number> {
  return all<{ product_id: number }>("SELECT product_id FROM wishlist WHERE user_id = ?", userId).map(
    (row) => row.product_id,
  );
}

/** افزودن/حذف از علاقه‌مندی‌ها؛ وضعیت جدید را برمی‌گرداند. */
export function toggleWishlist(userId: number, productId: number): boolean {
  const existing = one<{ id: number }>(
    "SELECT id FROM wishlist WHERE user_id = ? AND product_id = ?",
    userId,
    productId,
  );
  if (existing) {
    run("DELETE FROM wishlist WHERE id = ?", existing.id);
    return false;
  }
  run("INSERT INTO wishlist (user_id, product_id, created_at) VALUES (?, ?, ?)", userId, productId, nowIso());
  return true;
}

/* ------------------------------------------------------------------ */
/* پروفایل                                                           */
/* ------------------------------------------------------------------ */

export function updateProfile(userId: number, input: { name?: string | null; phone?: string | null }): void {
  run(
    "UPDATE users SET name = COALESCE(?, name), phone = COALESCE(?, phone) WHERE id = ?",
    input.name ?? null,
    input.phone ?? null,
    userId,
  );
}

export function updatePasswordHash(userId: number, passwordHash: string): void {
  run("UPDATE users SET password_hash = ? WHERE id = ?", passwordHash, userId);
}

/* ------------------------------------------------------------------ */
/* پنل مدیریت                                                        */
/* ------------------------------------------------------------------ */

export type AdminCustomer = {
  id: number;
  email: string;
  name: string | null;
  phone: string | null;
  emailVerified: boolean;
  orderCount: number;
  totalSpent: number;
  createdAt: string;
};

export function adminListCustomers(q?: string): Array<AdminCustomer> {
  const like = q && q.trim().length > 0 ? `%${q.trim()}%` : null;
  const rows = like
    ? all<{
        id: number;
        email: string;
        name: string | null;
        phone: string | null;
        email_verified_at: string | null;
        order_count: number;
        total_spent: number;
        created_at: string;
      }>(
        `SELECT u.id, u.email, u.name, u.phone, u.email_verified_at, u.created_at,
           (SELECT COUNT(*) FROM orders o WHERE o.user_id = u.id) AS order_count,
           (SELECT COALESCE(SUM(o.grand_total), 0) FROM orders o WHERE o.user_id = u.id AND o.status IN ('paid','processing','shipped','delivered')) AS total_spent
         FROM users u
         WHERE u.email LIKE ? OR u.name LIKE ? OR u.phone LIKE ?
         ORDER BY u.id DESC`,
        like,
        like,
        like,
      )
    : all<{
        id: number;
        email: string;
        name: string | null;
        phone: string | null;
        email_verified_at: string | null;
        order_count: number;
        total_spent: number;
        created_at: string;
      }>(
        `SELECT u.id, u.email, u.name, u.phone, u.email_verified_at, u.created_at,
           (SELECT COUNT(*) FROM orders o WHERE o.user_id = u.id) AS order_count,
           (SELECT COALESCE(SUM(o.grand_total), 0) FROM orders o WHERE o.user_id = u.id AND o.status IN ('paid','processing','shipped','delivered')) AS total_spent
         FROM users u ORDER BY u.id DESC`,
      );

  return rows.map((row) => ({
    id: row.id,
    email: row.email,
    name: row.name,
    phone: row.phone,
    emailVerified: row.email_verified_at !== null,
    orderCount: Number(row.order_count),
    totalSpent: Number(row.total_spent),
    createdAt: row.created_at,
  }));
}

export function adminListNewsletter(): Array<{ email: string; createdAt: string }> {
  return all<{ email: string; created_at: string }>(
    "SELECT email, created_at FROM newsletter ORDER BY id DESC",
  ).map((row) => ({ email: row.email, createdAt: row.created_at }));
}

export type AdminMessage = {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
  subject: string | null;
  body: string;
  isRead: boolean;
  createdAt: string;
};

export function adminListMessages(): Array<AdminMessage> {
  return all<{
    id: number;
    name: string;
    phone: string | null;
    email: string | null;
    subject: string | null;
    body: string;
    is_read: number;
    created_at: string;
  }>("SELECT * FROM contact_messages ORDER BY id DESC").map((row) => ({
    id: row.id,
    name: row.name,
    phone: row.phone,
    email: row.email,
    subject: row.subject,
    body: row.body,
    isRead: row.is_read === 1,
    createdAt: row.created_at,
  }));
}

export function adminMarkMessageRead(id: number, isRead = true): void {
  run("UPDATE contact_messages SET is_read = ? WHERE id = ?", isRead ? 1 : 0, id);
}
