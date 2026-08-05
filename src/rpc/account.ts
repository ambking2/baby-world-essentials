import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { findUserById, hashPassword, passwordProblem, verifyPassword } from "../server/auth";
import { AuthError, requireUser } from "../server/context";
import { ordersForUser } from "../server/repo/orders";
import {
  deleteAddress,
  listAddresses,
  listWishlist,
  saveAddress,
  toggleWishlist,
  updatePasswordHash,
  updateProfile,
  wishlistIds,
} from "../server/repo/users";

export const getAccount = createServerFn({ method: "GET" }).handler(async () => {
  const user = await requireUser();
  const [orders, addresses, wishlist] = await Promise.all([
    ordersForUser(user.id),
    listAddresses(user.id),
    listWishlist(user.id),
  ]);
  return { user, orders, addresses, wishlist };
});

export const getWishlistIds = createServerFn({ method: "GET" }).handler(async () => {
  const user = await requireUser();
  return { ids: await wishlistIds(user.id) };
});

export const toggleWishlistItem = createServerFn({ method: "POST" })
  .validator((data: unknown) => z.object({ productId: z.number().int().positive() }).parse(data))
  .handler(async ({ data }) => {
    const user = await requireUser();
    const added = await toggleWishlist(user.id, data.productId);
    return {
      ok: true,
      added,
      message: added ? "به علاقه‌مندی‌ها افزوده شد." : "از علاقه‌مندی‌ها حذف شد.",
    };
  });

export const updateMyProfile = createServerFn({ method: "POST" })
  .validator((data: unknown) =>
    z
      .object({
        name: z.string().min(2, "نام را وارد کنید.").max(80).optional(),
        phone: z.string().max(20).optional(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const user = await requireUser();
    await updateProfile(user.id, { name: data.name ?? null, phone: data.phone ?? null });
    return { ok: true, message: "اطلاعات حساب شما به‌روز شد." };
  });

export const changeMyPassword = createServerFn({ method: "POST" })
  .validator((data: unknown) =>
    z
      .object({
        currentPassword: z.string().min(1, "رمز فعلی را وارد کنید.").max(120),
        newPassword: z.string().min(8, "رمز جدید باید حداقل ۸ کاراکتر باشد.").max(120),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const user = await requireUser();
    const row = await findUserById(user.id);
    if (!row) throw new AuthError("حساب کاربری پیدا نشد.", 404);

    const valid = await verifyPassword(data.currentPassword, row.password_hash);
    if (!valid) throw new AuthError("رمز فعلی درست نیست.", 400);

    const problem = passwordProblem(data.newPassword);
    if (problem) throw new AuthError(problem, 400);

    await updatePasswordHash(user.id, await hashPassword(data.newPassword));
    return { ok: true, message: "رمز عبور شما تغییر کرد." };
  });

export const saveMyAddress = createServerFn({ method: "POST" })
  .validator((data: unknown) =>
    z
      .object({
        id: z.number().int().positive().nullable().optional(),
        receiver: z.string().min(3, "نام تحویل‌گیرنده را وارد کنید.").max(80),
        phone: z.string().min(10, "شمارهٔ تماس را درست وارد کنید.").max(20),
        province: z.string().min(2, "استان را وارد کنید.").max(40),
        city: z.string().min(2, "شهر را وارد کنید.").max(40),
        postalCode: z.string().max(12).optional(),
        line: z.string().min(10, "نشانی دقیق را وارد کنید.").max(400),
        isDefault: z.boolean().optional(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const user = await requireUser();
    const id = await saveAddress(user.id, {
      id: data.id ?? null,
      receiver: data.receiver.trim(),
      phone: data.phone.trim(),
      province: data.province.trim(),
      city: data.city.trim(),
      postalCode: data.postalCode ?? null,
      line: data.line.trim(),
      ...(data.isDefault === undefined ? {} : { isDefault: data.isDefault }),
    });
    return { ok: true, id, addresses: await listAddresses(user.id), message: "نشانی ذخیره شد." };
  });

export const deleteMyAddress = createServerFn({ method: "POST" })
  .validator((data: unknown) => z.object({ id: z.number().int().positive() }).parse(data))
  .handler(async ({ data }) => {
    const user = await requireUser();
    await deleteAddress(user.id, data.id);
    return { ok: true, addresses: await listAddresses(user.id), message: "نشانی حذف شد." };
  });
