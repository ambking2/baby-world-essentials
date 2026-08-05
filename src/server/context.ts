import { deleteCookie, getCookie, getRequest, setCookie } from "@tanstack/react-start/server";

import { CART_COOKIE, SESSION_COOKIE, userFromSessionToken, type PublicUser } from "./auth";

/**
 * تمام دسترسی به کوکی و درخواست فقط از این فایل انجام می‌شود، تا اگر
 * API فریم‌ورک عوض شد فقط همین یک فایل نیاز به تغییر داشته باشد.
 *
 * روی Cloudflare تشخیص محیط تولید از process.env قابل اتکا نیست؛ بنابراین
 * امن بودن کوکی را از پروتکل خود درخواست تشخیص می‌دهیم.
 */

type CookieOptions = {
  maxAgeSeconds?: number;
  expires?: Date;
};

/** روی HTTPS کوکی‌ها secure می‌شوند؛ روی localhost نه. */
function isSecureRequest(): boolean {
  try {
    return new URL(getRequest().url).protocol === "https:";
  } catch {
    return process.env["NODE_ENV"] === "production";
  }
}

export function readCookie(name: string): string | undefined {
  return getCookie(name) ?? undefined;
}

export function writeCookie(name: string, value: string, options: CookieOptions = {}): void {
  setCookie(name, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: isSecureRequest(),
    path: "/",
    ...(options.maxAgeSeconds === undefined ? {} : { maxAge: options.maxAgeSeconds }),
    ...(options.expires === undefined ? {} : { expires: options.expires }),
  });
}

export function clearCookie(name: string): void {
  deleteCookie(name, { path: "/" });
}

/**
 * نشانی IP کاربر.
 *
 * روی Cloudflare هدر دقیق CF-Connecting-IP است، پس اول آن را می‌خوانیم.
 */
export function clientIp(): string {
  const headers = getRequest().headers;
  const cloudflareIp = headers.get("cf-connecting-ip");
  if (cloudflareIp) return cloudflareIp;
  const forwarded = headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() ?? "unknown";
}

/* ------------------------------------------------------------------ */
/* کاربر جاری                                                         */
/* ------------------------------------------------------------------ */

export async function currentUser(): Promise<PublicUser | null> {
  return userFromSessionToken(readCookie(SESSION_COOKIE));
}

export class AuthError extends Error {
  readonly statusCode: number;
  constructor(message: string, statusCode = 401) {
    super(message);
    this.name = "AuthError";
    this.statusCode = statusCode;
  }
}

export async function requireUser(): Promise<PublicUser> {
  const user = await currentUser();
  if (!user) throw new AuthError("برای ادامه باید وارد حساب خود شوید.");
  return user;
}

export async function requireAdmin(): Promise<PublicUser> {
  const user = await requireUser();
  if (user.role !== "admin") throw new AuthError("دسترسی به پنل مدیریت مجاز نیست.", 403);
  return user;
}

/* ------------------------------------------------------------------ */
/* کوکی سشن و سبد                                                  */
/* ------------------------------------------------------------------ */

export function setSessionCookie(token: string, expiresAt: Date): void {
  writeCookie(SESSION_COOKIE, token, { expires: expiresAt });
}

export function clearSessionCookie(): void {
  clearCookie(SESSION_COOKIE);
}

export function readSessionToken(): string | undefined {
  return readCookie(SESSION_COOKIE);
}

export function readCartToken(): string | undefined {
  return readCookie(CART_COOKIE);
}

export function setCartCookie(token: string): void {
  writeCookie(CART_COOKIE, token, { maxAgeSeconds: 60 * 60 * 24 * 60 });
}
