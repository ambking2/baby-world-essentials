import { createServerFn } from "@tanstack/react-start";

export const getCatalogShell = createServerFn({ method: "GET" }).handler(async () => {
  return (await import("../server/functions/catalog")).getCatalogShell();
});

export const getCategoryPage = createServerFn({ method: "GET" })
  .validator((data: unknown) => data as any)
  .handler(async ({ data }) => {
    return (await import("../server/functions/catalog")).getCategoryPage({ data });
  });

export const joinNewsletter = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as any)
  .handler(async ({ data }) => {
    return (await import("../server/functions/catalog")).joinNewsletter({ data });
  });

export const sendContactMessage = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as any)
  .handler(async ({ data }) => {
    return (await import("../server/functions/catalog")).sendContactMessage({ data });
  });
