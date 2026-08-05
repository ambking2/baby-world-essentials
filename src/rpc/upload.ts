import { createServerFn } from "@tanstack/react-start";

export const uploadAdminImage = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as any)
  .handler(async ({ data }) => {
    return (await import("../server/functions/upload")).uploadAdminImage({ data });
  });

export const uploadReceiptImage = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as any)
  .handler(async ({ data }) => {
    return (await import("../server/functions/upload")).uploadReceiptImage({ data });
  });
