import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import {
  consumeEmailCode,
  createSession,
  createUser,
  destroyAllSessions,
  destroySession,
  findUserByEmail,
  hashPassword,
  issueEmailCode,
  markEmailVerified,
  normalizeEmail,
  passwordProblem,
  rateLimit,
  toPublicUser,
  verifyPassword,
} from "../server/auth";
import {
  AuthError,
  clearSessionCookie,
  clientIp,
  currentUser,
  readCartToken,
  readSessionToken,
  setSessionCookie,
} from "../server/context";
import { run } from "../server/db";
import { resetPasswordEmail, sendMail, verificationEmail } from "../server/mailer";
import { attachCartToUser, findCartByToken } from "../server/repo/cart";

async function mergeGuestCart(userId: number): Promise<void> {
  const cart = await findCartByToken(readCartToken());
  if (cart && cart.user_id === null) await attachCartToUser(cart.id, userId);
}

function guard(action: string): void {
  if (!rateLimit(`${action}:${clientIp()}`, 8, 60_000)) {
    throw new AuthError("درخواست‌های شما زیاد است؛ یک دقیقه بعد دوباره تلاش کنید.", 429);
  }
}

export const getSession = createServerFn({ method: "GET" }).handler(async () => ({
  user: await currentUser(),
}));

export const registerUser = createServerFn({ method: "POST" })
  .validator((data: unknown) =>
    z
      .object({
        name: z.string().min(2, "نام و نام خانوادگی را وارد کنید.").max(80),
        email: z.string().email("ایمیل معتبر وارد کنید.").max(160),
        phone: z.string().max(20).optional(),
        password: z.string().min(8, "رمز عبور باید حداقل ۸ کاراکتر باشد.").max(120),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    guard("register");

    const problem = passwordProblem(data.password);
    if (problem) throw new AuthError(problem, 400);

    const email = normalizeEmail(data.email);
    if (await findUserByEmail(email)) {
      throw new AuthError("این ایمیل قبلاً ثبت شده است. از همین ایمیل وارد شوید.", 400);
    }

    const user = await createUser({
      email,
      password: data.password,
      name: data.name.trim(),
      phone: data.phone ?? null,
    });

    const code = await issueEmailCode(user.id, "verify_email");
    await sendMail(verificationEmail(user.email, code));

    return {
      ok: true,
      email: user.email,
      message: "کد تأیید به ایمیل شما ارسال شد.",
    };
  });

export const resendVerificationCode = createServerFn({ method: "POST" })
  .validator((data: unknown) => z.object({ email: z.string().email().max(160) }).parse(data))
  .handler(async ({ data }) => {
    guard("resend-code");
    const user = await findUserByEmail(data.email);
    if (user && user.email_verified_at === null) {
      const code = await issueEmailCode(user.id, "verify_email");
      await sendMail(verificationEmail(user.email, code));
    }
    return {
      ok: true,
      message: "اگر حساب تأییدنشده‌ای با این ایمیل وجود داشته باشد، کد جدید ارسال شد.",
    };
  });

export const verifyEmailCode = createServerFn({ method: "POST" })
  .validator((data: unknown) =>
    z
      .object({
        email: z.string().email().max(160),
        code: z.string().min(4).max(8),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    guard("verify-email");

    const user = await findUserByEmail(data.email);
    if (!user) throw new AuthError("حسابی با این ایمیل پیدا نشد.", 404);

    const valid = await consumeEmailCode(user.id, "verify_email", data.code);
    if (!valid) throw new AuthError("کد واردشده نادرست یا منقضی شده است.", 400);

    await markEmailVerified(user.id);
    const session = await createSession(user.id);
    setSessionCookie(session.token, session.expiresAt);
    await mergeGuestCart(user.id);

    return {
      ok: true,
      user: toPublicUser({ ...user, email_verified_at: new Date().toISOString() }),
    };
  });

export const loginUser = createServerFn({ method: "POST" })
  .validator((data: unknown) =>
    z
      .object({
        email: z.string().email("ایمیل معتبر وارد کنید.").max(160),
        password: z.string().min(1, "رمز عبور را وارد کنید.").max(120),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    guard("login");

    const user = await findUserByEmail(data.email);
    const valid = user ? await verifyPassword(data.password, user.password_hash) : false;
    if (!user || !valid) {
      throw new AuthError("ایمیل یا رمز عبور درست نیست.", 400);
    }

    if (user.email_verified_at === null) {
      const code = await issueEmailCode(user.id, "verify_email");
      await sendMail(verificationEmail(user.email, code));
      return {
        ok: false,
        needsVerification: true,
        email: user.email,
        message: "ابتدا ایمیل خود را تأیید کنید؛ کد جدید ارسال شد.",
      };
    }

    const session = await createSession(user.id);
    setSessionCookie(session.token, session.expiresAt);
    await mergeGuestCart(user.id);

    return { ok: true, needsVerification: false, user: toPublicUser(user) };
  });

export const logoutUser = createServerFn({ method: "POST" }).handler(async () => {
  await destroySession(readSessionToken());
  clearSessionCookie();
  return { ok: true };
});

export const requestPasswordReset = createServerFn({ method: "POST" })
  .validator((data: unknown) => z.object({ email: z.string().email().max(160) }).parse(data))
  .handler(async ({ data }) => {
    guard("reset-request");
    const user = await findUserByEmail(data.email);
    if (user) {
      const code = await issueEmailCode(user.id, "reset_password");
      await sendMail(resetPasswordEmail(user.email, code));
    }
    return { ok: true, message: "اگر این ایمیل در سایت ثبت شده باشد، کد بازیابی ارسال شد." };
  });

export const resetPassword = createServerFn({ method: "POST" })
  .validator((data: unknown) =>
    z
      .object({
        email: z.string().email().max(160),
        code: z.string().min(4).max(8),
        password: z.string().min(8, "رمز عبور باید حداقل ۸ کاراکتر باشد.").max(120),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    guard("reset-password");

    const problem = passwordProblem(data.password);
    if (problem) throw new AuthError(problem, 400);

    const user = await findUserByEmail(data.email);
    if (!user) throw new AuthError("حسابی با این ایمیل پیدا نشد.", 404);

    const valid = await consumeEmailCode(user.id, "reset_password", data.code);
    if (!valid) throw new AuthError("کد واردشده نادرست یا منقضی شده است.", 400);

    const passwordHash = await hashPassword(data.password);
    await run("UPDATE users SET password_hash = ? WHERE id = ?", passwordHash, user.id);
    await destroyAllSessions(user.id);
    clearSessionCookie();

    return { ok: true, message: "رمز عبور تغییر کرد. دوباره وارد شوید." };
  });
