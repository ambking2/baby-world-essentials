import { randomBytes } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { AuthError, currentUser, requireAdmin } from "../context";

const UPLOAD_DIR = resolve(process.cwd(), "public/uploads");
const MAX_BYTES = 4 * 1024 * 1024;

const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

const uploadSchema = z.object({
  /** محتوای base64 بدون پیشوند data:. */
  base64: z.string().min(16).max(8_000_000),
  mimeType: z.string().min(3).max(60),
  purpose: z.enum(["product", "category", "blog", "receipt"]).optional(),
});

async function saveImage(base64: string, mimeType: string, prefix: string): Promise<string> {
  const extension = EXTENSIONS[mimeType];
  if (!extension) throw new AuthError("فقط تصویر JPG، PNG، WEBP یا GIF قابل بارگزاری است.", 400);

  const buffer = Buffer.from(base64, "base64");
  if (buffer.byteLength === 0) throw new AuthError("فایل دریافتی خالی است.", 400);
  if (buffer.byteLength > MAX_BYTES) throw new AuthError("حجم تصویر نباید بیشتر از ۴ مگابایت باشد.", 400);

  await mkdir(UPLOAD_DIR, { recursive: true });
  const name = `${prefix}-${Date.now()}-${randomBytes(4).toString("hex")}.${extension}`;
  await writeFile(resolve(UPLOAD_DIR, name), buffer);

  return `/uploads/${name}`;
}

/** بارگزاری تصویر در پنل مدیریت (محصول، دسته، مقاله). */
export const uploadAdminImage = createServerFn({ method: "POST" })
  .validator((data: unknown) => uploadSchema.parse(data))
  .handler(async ({ data }) => {
    requireAdmin();
    const url = await saveImage(data.base64, data.mimeType, data.purpose ?? "product");
    return { ok: true, url, message: "تصویر بارگزاری شد." };
  });

/** بارگزاری تصویر رسید پرداخت توسط مشتری. */
export const uploadReceiptImage = createServerFn({ method: "POST" })
  .validator((data: unknown) => uploadSchema.parse(data))
  .handler(async ({ data }) => {
    const user = currentUser();
    const url = await saveImage(data.base64, data.mimeType, user ? `receipt-u${user.id}` : "receipt");
    return { ok: true, url, message: "رسید بارگزاری شد." };
  });
