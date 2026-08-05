import { createServerFn } from "@tanstack/react-start";

export const getHomeProducts = createServerFn({ method: "GET" }).handler(async () => {
  return (await import("../server/functions/products")).getHomeProducts();
});

export const suggestProducts = createServerFn({ method: "GET" })
  .validator((data: unknown) => data as any)
  .handler(async ({ data }) => {
    return (await import("../server/functions/products")).suggestProducts({ data });
  });

export const getProducts = createServerFn({ method: "GET" })
  .validator((data: unknown) => data as any)
  .handler(async ({ data }) => {
    return (await import("../server/functions/products")).getProducts({ data });
  });

export const getProductPage = createServerFn({ method: "GET" })
  .validator((data: unknown) => data as any)
  .handler(async ({ data }) => {
    return (await import("../server/functions/products")).getProductPage({ data });
  });

export const submitReview = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as any)
  .handler(async ({ data }) => {
    return (await import("../server/functions/products")).submitReview({ data });
  });
