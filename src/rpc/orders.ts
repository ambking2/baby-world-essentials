import { createServerFn } from "@tanstack/react-start";

export const getCheckoutData = createServerFn({ method: "GET" }).handler(async () => {
  return (await import("../server/functions/orders")).getCheckoutData();
});

export const checkCoupon = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as any)
  .handler(async ({ data }) => {
    return (await import("../server/functions/orders")).checkCoupon({ data });
  });

export const submitCheckout = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as any)
  .handler(async ({ data }) => {
    return (await import("../server/functions/orders")).submitCheckout({ data });
  });

export const getOrder = createServerFn({ method: "GET" })
  .validator((data: unknown) => data as any)
  .handler(async ({ data }) => {
    return (await import("../server/functions/orders")).getOrder({ data });
  });

export const getMyOrders = createServerFn({ method: "GET" }).handler(async () => {
  return (await import("../server/functions/orders")).getMyOrders();
});

export const submitReceipt = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as any)
  .handler(async ({ data }) => {
    return (await import("../server/functions/orders")).submitReceipt({ data });
  });
