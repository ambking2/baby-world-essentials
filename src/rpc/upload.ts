import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { currentUser, requireAdmin } from "../server/context";
import { saveImage } from "../server/uploads";

const uploadSchema = z.object({
  base64: z.string().min(16).max(2_700_000),
  mimeType: z.string().min(3).max(60),
  purpose: z.enum(["product", "category", "blog", "receipt"]).optional(),
});

export const uploadAdminImage = createServerFn({ method: "POST" })
  .validator((data: unknown) => uploadSchema.parse(data))
  .handler(async ({ data }) => {
    await requireAdmin();
    const url = await saveImage(data.base64, data.mimeType, data.purpose ?? "product");
    return { ok: true, url, message: "تصویر بارگزاری شد." };
  });

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
