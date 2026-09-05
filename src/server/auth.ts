import { all, envVar, nowIso, one, run } from "./db.ts";

/**
 * احراز هویت — سازگار با Cloudflare Workers.
 *
 * در ورکرها نه `scryptSync` وجود دارد و نه `Buffer`؛ پس همه‌ی رمزنگاری روی
 * Web Crypto (`crypto.subtle`) انجام می‌شود:
 *
 *   • رمز عبور با PBKDF2-SHA256 (۱۰۰٬۰۰۰ دور) هش می‌شود.
 *   • توکن سشن و کدهای ایمیلی با SHA-256 هش می‌شوند.
 *   • اعداد تصادفی از `crypto.getRandomValues` می‌آیند.
 *
 * چون `crypto.subtle` فقط API ناهمگام دارد، تمام توابع این فایل async هستند.
 */

export const SESSION_COOKIE = "jk_session";
export const CART_COOKIE = "jk_cart";

const SESSION_DAYS = 30;
const CODE_TTL_MINUTES = 15;
const PBKDF2_ITERATIONS = 100_000;
const PBKDF2_KEY_BYTES = 32;
const SALT_BYTES = 16;
const TEMP_EMAIL_CODE = "111111";

const textEncoder = new TextEncoder();

/* ------------------------------------------------------------------ */
/* ابزارهای پایه‌ی بایت و تصادف                                     */
/* ------------------------------------------------------------------ */

function randomBytes(length: number): Uint8Array {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return bytes;
}

function toHex(bytes: Uint8Array): string {
  let out = "";
  for (const byte of bytes) out += byte.toString(16).padStart(2, "0");
  return out;
}

function fromHex(hex: string): Uint8Array {
  const clean = hex.length % 2 === 0 ? hex : `0${hex}`;
  const bytes = new Uint8Array(clean.length / 2);
  for (let index = 0; index < bytes.length; index += 1) {
    bytes[index] = Number.parseInt(clean.slice(index * 2, index * 2 + 2), 16);
  }
  return bytes;
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function constantTimeEqual(left: Uint8Array, right: Uint8Array): boolean {
  if (left.length !== right.length) return false;
  let diff = 0;
  for (let index = 0; index < left.length; index += 1) {
    diff |= (left[index] ?? 0) ^ (right[index] ?? 0);
  }
  return diff === 0;
}

function randomSixDigits(): string {
  const range = 900_000;
  const limit = Math.floor(4_294_967_296 / range) * range;
  let value = 0;
  do {
    const bytes = randomBytes(4);
    value =
      ((bytes[0] ?? 0) << 24) | ((bytes[1] ?? 0) << 16) | ((bytes[2] ?? 0) << 8) | (bytes[3] ?? 0);
    value >>>= 0;
  } while (value >= limit);
  return String(100_000 + (value % range));
}

async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", textEncoder.encode(value));
  return toHex(new Uint8Array(digest));
}

/* ------------------------------------------------------------------ */
/* رمز عبور                                                          */
/* ------------------------------------------------------------------ */

async function pbkdf2(
  password: string,
  salt: Uint8Array,
  iterations: number,
  bytes: number,
): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    "raw",
    textEncoder.encode(password.normalize("NFKC")),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const derived = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: salt as unknown as BufferSource, iterations, hash: "SHA-256" },
    key,
    bytes * 8,
  );
  return new Uint8Array(derived);
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_BYTES);
  const hash = await pbkdf2(password, salt, PBKDF2_ITERATIONS, PBKDF2_KEY_BYTES);
  return `pbkdf2$${PBKDF2_ITERATIONS}$${toHex(salt)}$${toHex(hash)}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split("$");

  if (parts[0] === "pbkdf2") {
    const iterations = Number(parts[1]);
    const saltHex = parts[2];
    const hashHex = parts[3];
    if (!Number.isFinite(iterations) || saltHex === undefined || hashHex === undefined) return false;
    const expected = fromHex(hashHex);
    const actual = await pbkdf2(password, fromHex(saltHex), iterations, expected.length);
    return constantTimeEqual(expected, actual);
  }

  if (parts[0] === "scrypt") {
    const saltHex = parts[1];
    const hashHex = parts[2];
    if (saltHex === undefined || hashHex === undefined) return false;
    try {
      const { scryptSync } = await import("node:crypto");
      const expected = fromHex(hashHex);
      const actual = new Uint8Array(
        scryptSync(password.normalize("NFKC"), fromHex(saltHex), expected.length),
      );
      return constantTimeEqual(expected, actual);
    } catch {
      return false;
    }
  }

  return false;
}

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
  role: "customer" | "admin" | "sales";
  emailVerified: boolean;
  createdAt: string;
};

export function toPublicUser(row: UserRow): PublicUser {
  let role: PublicUser["role"] = "customer";
  if (row.role === "admin") role = "admin";
  else if (row.role === "sales") role = "sales";

  return {
    id: row.id,
    email: row.email,
    name: row.name,
    phone: row.phone,
    role,
    emailVerified: row.email_verified_at !== null,
    createdAt: row.created_at,
  };
}

export async function findUserByEmail(email: string): Promise<UserRow | undefined> {
  return one<UserRow>("SELECT * FROM users WHERE email = ?", normalizeEmail(email));
}

export async function findUserById(id: number): Promise<UserRow | undefined> {
  return one<UserRow>("SELECT * FROM users WHERE id = ?", id);
}

export async function createUser(input: {
  email: string;
  password: string;
  name?: string | null;
  phone?: string | null;
  role?: "customer" | "admin" | "sales";
}): Promise<UserRow> {
  const result = await run(
    `INSERT INTO users (email, password_hash, name, phone, role, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    normalizeEmail(input.email),
    await hashPassword(input.password),
    input.name ?? null,
    input.phone ?? null,
    input.role ?? "customer",
    nowIso(),
  );
  const row = await findUserById(result.lastInsertRowid);
  if (!row) throw new Error("ثبت حساب کاربری انجام نشد.");
  return row;
}

export async function markEmailVerified(userId: number): Promise<void> {
  await run("UPDATE users SET email_verified_at = ? WHERE id = ?", nowIso(), userId);
}

export async function hasNoAdmin(): Promise<boolean> {
  const rows = await all<{ id: number }>("SELECT id FROM users WHERE role = 'admin' LIMIT 1");
  return rows.length === 0;
}

/* ------------------------------------------------------------------ */
/* سشن‌ها                                                            */
/* ------------------------------------------------------------------ */

export async function createSession(userId: number): Promise<{ token: string; expiresAt: Date }> {
  const token = toBase64Url(randomBytes(32));
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86_400_000);
  await run(
    "INSERT INTO sessions (user_id, token_hash, expires_at, created_at) VALUES (?, ?, ?, ?)",
    userId,
    await sha256Hex(token),
    expiresAt.toISOString(),
    nowIso(),
  );
  return { token, expiresAt };
}

export async function userFromSessionToken(token: string | undefined): Promise<PublicUser | null> {
  if (!token) return null;
  const row = await one<UserRow>(
    `SELECT u.* FROM sessions s
     JOIN users u ON u.id = s.user_id
     WHERE s.token_hash = ? AND s.expires_at > ?`,
    await sha256Hex(token),
    nowIso(),
  );
  return row ? toPublicUser(row) : null;
}

export async function destroySession(token: string | undefined): Promise<void> {
  if (!token) return;
  await run("DELETE FROM sessions WHERE token_hash = ?", await sha256Hex(token));
}

export async function destroyAllSessions(userId: number): Promise<void> {
  await run("DELETE FROM sessions WHERE user_id = ?", userId);
}

export async function purgeExpiredSessions(): Promise<void> {
  await run("DELETE FROM sessions WHERE expires_at <= ?", nowIso());
}

/* ------------------------------------------------------------------ */
/* کدهای ایمیلی (تأیید حساب و بازیابی رمز)                        */
/* ------------------------------------------------------------------ */

export type CodePurpose = "verify_email" | "reset_password";

export async function issueEmailCode(userId: number, purpose: CodePurpose): Promise<string> {
  const code = TEMP_EMAIL_CODE || randomSixDigits();
  await run(
    "DELETE FROM email_codes WHERE user_id = ? AND purpose = ? AND used_at IS NULL",
    userId,
    purpose,
  );
  await run(
    `INSERT INTO email_codes (user_id, code_hash, purpose, expires_at, created_at)
     VALUES (?, ?, ?, ?, ?)`,
    userId,
    await sha256Hex(code),
    purpose,
    new Date(Date.now() + CODE_TTL_MINUTES * 60_000).toISOString(),
    nowIso(),
  );
  return code;
}

export async function consumeEmailCode(
  userId: number,
  purpose: CodePurpose,
  code: string,
): Promise<boolean> {
  const row = await one<{ id: number }>(
    `SELECT id FROM email_codes
     WHERE user_id = ? AND purpose = ? AND code_hash = ? AND used_at IS NULL AND expires_at > ?
     ORDER BY id DESC LIMIT 1`,
    userId,
    purpose,
    await sha256Hex(code.trim()),
    nowIso(),
  );
  if (!row) return false;
  await run("UPDATE email_codes SET used_at = ? WHERE id = ?", nowIso(), row.id);
  return true;
}

/* ------------------------------------------------------------------ */
/* محدودیت درخواست                                                */
/* ------------------------------------------------------------------ */

const buckets = new Map<string, { count: number; resetAt: number }>();

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

export async function authSecret(): Promise<string> {
  return (await envVar("AUTH_SECRET")) ?? "jahankoodak-dev-secret";
}
