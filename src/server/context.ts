import { deleteCookie, getCookie, getRequest, setCookie } from "@tanstack/react-start/server";

import { CART_COOKIE, SESSION_COOKIE, userFromSessionToken, type PublicUser } from "./auth";

/**
 * تمام دسترسی به کوکی و درخواست فقط از این فایل انجام می‌شود، تا اگر
 * API فریم‌ورک عوض شد فقط همین یک فایل نیاز به تغییر داشته باشد.
 */

const isProd = process.env["NODE_ENV"] === "production";

type CookieOptions = {
  maxAgeSeconds?: number;
  expires?: Date;
};

export function readCookie(name: string): string | undefined {
  return getCookie(name) ?? undefined;
}

export function writeCookie(name: string, value: string, options: CookieOptions = {}): void {
  setCookie(name, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: isProd,
    path: "/",
    ...(options.maxAgeSeconds === undefined ? {} : { maxAge: options.maxAgeSeconds }),
    ...(options.expires === undefined ? {} : { expires: options.expires }),
  });
}

export function clearCookie(name: string): void {
  deleteCookie(name, { path: "/" });
}

export function clientIp(): string {
  const forwarded = getRequest().headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() ?? "unknown";
}

/* ------------------------------------------------------------------ */
/* کاربر جاری                                                         */
/* ------------------------------------------------------------------ */

export function currentUser(): PublicUser | null {
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

export function requireUser(): PublicUser {
  const user = currentUser();
  if (!user) throw new AuthError("برای ادامه باید وارد حساب خود شوید.");
  return user;
}

export function requireAdmin(): PublicUser {
  const user = requireUser();
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
