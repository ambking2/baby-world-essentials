import { createServerFn } from "@tanstack/react-start";

export const getCart = createServerFn({ method: "GET" }).handler(async () => {
  return (await import("../server/functions/cart")).getCart();
});

export const addCartItem = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as any)
  .handler(async ({ data }) => {
    return (await import("../server/functions/cart")).addCartItem({ data });
  });

export const updateCartItemQty = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as any)
  .handler(async ({ data }) => {
    return (await import("../server/functions/cart")).updateCartItemQty({ data });
  });

export const deleteCartItem = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as any)
  .handler(async ({ data }) => {
    return (await import("../server/functions/cart")).deleteCartItem({ data });
  });

export const emptyCart = createServerFn({ method: "POST" }).handler(async () => {
  return (await import("../server/functions/cart")).emptyCart();
});
