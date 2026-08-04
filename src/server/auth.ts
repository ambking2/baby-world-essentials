import {
  randomBytes,
  randomInt,
  createHash,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";

import { all, nowIso, one, run } from "./db";

export const SESSION_COOKIE = "jk_session";
export const CART_COOKIE = "jk_cart";

const SESSION_DAYS = 30;
const CODE_TTL_MINUTES = 15;

/* ------------------------------------------------------------------ */
/* رمز عبور                                                          */
/* ------------------------------------------------------------------ */

/** قالب ذخیره: scrypt$<salt-hex>$<hash-hex> */
export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(password.normalize("NFKC"), salt, 64);
  return `scrypt$${salt.toString("hex")}$${hash.toString("hex")}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const parts = stored.split("$");
  const saltHex = parts[1];
  const hashHex = parts[2];
  if (parts[0] !== "scrypt" || saltHex === undefined || hashHex === undefined) return false;
  const expected = Buffer.from(hashHex, "hex");
  const actual = scryptSync(password.normalize("NFKC"), Buffer.from(saltHex, "hex"), expected.length);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

/** اگر رمز مشکلی داشته باشد، پیام فارسی برمی‌گرداند. */
export function passwordProblem(password: string): string | null {
  if (password.length < 8) return "رمز عبور باید حداقل ۸ کاراکتر باشد.";
  if (!/[A-Za-z\u0600-\u06FF]/.test(password)) return "رمز عبور باید حداقل یک حرف داشته باشد.";
  if (!/[0-9]/.test(password)) return "رمز عبور باید حداقل یک رقم داشته باشد.";
  return null;
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/* ------------------------------------------------------------------ */
/* کاربران                                                           */
/* ------------------------------------------------------------------ */

export type UserRow = {
  id: number;
  email: string;
  password_hash: string;
  name: string | null;
  phone: string | null;
  role: string;
  email_verified_at: string | null;
  created_at: string;
};

export type PublicUser = {
  id: number;
  email: string;
  name: string | null;
  phone: string | null;
  role: "customer" | "admin";
  emailVerified: boolean;
  createdAt: string;
};

export function toPublicUser(row: UserRow): PublicUser {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    phone: row.phone,
    role: row.role === "admin" ? "admin" : "customer",
    emailVerified: row.email_verified_at !== null,
    createdAt: row.created_at,
  };
}

export function findUserByEmail(email: string): UserRow | undefined {
  return one<UserRow>("SELECT * FROM users WHERE email = ?", normalizeEmail(email));
}

export function findUserById(id: number): UserRow | undefined {
  return one<UserRow>("SELECT * FROM users WHERE id = ?", id);
}

export function createUser(input: {
  email: string;
  password: string;
  name?: string | null;
  phone?: string | null;
  role?: "customer" | "admin";
}): UserRow {
  const result = run(
    `INSERT INTO users (email, password_hash, name, phone, role, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    normalizeEmail(input.email),
    hashPassword(input.password),
    input.name ?? null,
    input.phone ?? null,
    input.role ?? "customer",
    nowIso(),
  );
  const row = findUserById(result.lastInsertRowid);
  if (!row) throw new Error("ثبت حساب کاربری انجام نشد.");
  return row;
}

export function markEmailVerified(userId: number): void {
  run("UPDATE users SET email_verified_at = ? WHERE id = ?", nowIso(), userId);
}

/** اگر هنوز هیچ مدیری وجود نداشته باشد — برای راه‌اندازی اولیه. */
export function hasNoAdmin(): boolean {
  return all<{ id: number }>("SELECT id FROM users WHERE role = 'admin' LIMIT 1").length === 0;
}

/* ------------------------------------------------------------------ */
/* سشن‌ها                                                            */
/* ------------------------------------------------------------------ */

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export function createSession(userId: number): { token: string; expiresAt: Date } {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86_400_000);
  run(
    "INSERT INTO sessions (user_id, token_hash, expires_at, created_at) VALUES (?, ?, ?, ?)",
    userId,
    sha256(token),
    expiresAt.toISOString(),
    nowIso(),
  );
  return { token, expiresAt };
}

export function userFromSessionToken(token: string | undefined): PublicUser | null {
  if (!token) return null;
  const row = one<UserRow>(
    `SELECT u.* FROM sessions s
     JOIN users u ON u.id = s.user_id
     WHERE s.token_hash = ? AND s.expires_at > ?`,
    sha256(token),
    nowIso(),
  );
  return row ? toPublicUser(row) : null;
}

export function destroySession(token: string | undefined): void {
  if (!token) return;
  run("DELETE FROM sessions WHERE token_hash = ?", sha256(token));
}

export function destroyAllSessions(userId: number): void {
  run("DELETE FROM sessions WHERE user_id = ?", userId);
}

export function purgeExpiredSessions(): void {
  run("DELETE FROM sessions WHERE expires_at <= ?", nowIso());
}

/* ------------------------------------------------------------------ */
/* کدهای ایمیلی (تأیید حساب و بازیابی رمز)                        */
/* ------------------------------------------------------------------ */

export type CodePurpose = "verify_email" | "reset_password";

/** کد ۶ رقمی می‌سازد، فقط هش آن در دیتابیس ذخیره می‌شود. */
export function issueEmailCode(userId: number, purpose: CodePurpose): string {
  const code = String(randomInt(100_000, 1_000_000));
  run("DELETE FROM email_codes WHERE user_id = ? AND purpose = ? AND used_at IS NULL", userId, purpose);
  run(
    `INSERT INTO email_codes (user_id, code_hash, purpose, expires_at, created_at)
     VALUES (?, ?, ?, ?, ?)`,
    userId,
    sha256(code),
    purpose,
    new Date(Date.now() + CODE_TTL_MINUTES * 60_000).toISOString(),
    nowIso(),
  );
  return code;
}

/** کد را مصرف می‌کند؛ در صورت معتبر بودن true برمی‌گرداند. */
export function consumeEmailCode(userId: number, purpose: CodePurpose, code: string): boolean {
  const row = one<{ id: number }>(
    `SELECT id FROM email_codes
     WHERE user_id = ? AND purpose = ? AND code_hash = ? AND used_at IS NULL AND expires_at > ?
     ORDER BY id DESC LIMIT 1`,
    userId,
    purpose,
    sha256(code.trim()),
    nowIso(),
  );
  if (!row) return false;
  run("UPDATE email_codes SET used_at = ? WHERE id = ?", nowIso(), row.id);
  return true;
}

/* ------------------------------------------------------------------ */
/* محدودیت درخواست (در حافظه)                                  */
/* ------------------------------------------------------------------ */

const buckets = new Map<string, { count: number; resetAt: number }>();

/** در صورت عبور از سقف، false برمی‌گرداند. */
export function rateLimit(key: string, limit = 8, windowMs = 60_000): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (bucket.count >= limit) return false;
  bucket.count += 1;
  return true;
}
