import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { currentUser, requireAdmin } from "../context";
import { saveImage } from "../uploads";

/**
 * بارگزاری تصویر.
 *
 * محل ذخیره‌سازی در src/server/uploads.ts مدیریت می‌شود: D1/R2 روی Cloudflare و
 * دیسک در اجرای محلی.
 */

const uploadSchema = z.object({
  /** محتوای base64 بدون پیشوند data:. */
  base64: z.string().min(16).max(2_700_000),
  mimeType: z.string().min(3).max(60),
  purpose: z.enum(["product", "category", "blog", "receipt"]).optional(),
});

/** بارگزاری تصویر در پنل مدیریت (محصول، دسته، مقاله). */
export const uploadAdminImage = createServerFn({ method: "POST" })
  .validator((data: unknown) => uploadSchema.parse(data))
  .handler(async ({ data }) => {
    await requireAdmin();
    const url = await saveImage(data.base64, data.mimeType, data.purpose ?? "product");
    return { ok: true, url, message: "تصویر بارگزاری شد." };
  });

/** بارگزاری تصویر رسید پرداخت توسط مشتری. */
export const uploadReceiptImage = createServerFn({ method: "POST" })
  .validator((data: unknown) => uploadSchema.parse(data))
  .handler(async ({ data }) => {
    const user = await currentUser();
    const url = await saveImage(
      data.base64,
      data.mimeType,
      user ? `receipt-u${user.id}` : "receipt",
    );
    return { ok: true, url, message: "رسید بارگزاری شد." };
  });
