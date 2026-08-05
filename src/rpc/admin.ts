import { createServerFn } from "@tanstack/react-start";

export const getAdminDashboard = createServerFn({ method: "GET" }).handler(async () => {
  return (await import("../server/functions/admin")).getAdminDashboard();
});

export const getAdminProducts = createServerFn({ method: "GET" })
  .validator((data: unknown) => data as any)
  .handler(async ({ data }) => {
    return (await import("../server/functions/admin")).getAdminProducts({ data });
  });

export const getAdminProductForm = createServerFn({ method: "GET" })
  .validator((data: unknown) => data as any)
  .handler(async ({ data }) => {
    return (await import("../server/functions/admin")).getAdminProductForm({ data });
  });

export const saveAdminProduct = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as any)
  .handler(async ({ data }) => {
    return (await import("../server/functions/admin")).saveAdminProduct({ data });
  });

export const removeAdminProduct = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as any)
  .handler(async ({ data }) => {
    return (await import("../server/functions/admin")).removeAdminProduct({ data });
  });

export const setAdminProductFlags = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as any)
  .handler(async ({ data }) => {
    return (await import("../server/functions/admin")).setAdminProductFlags({ data });
  });

export const setAdminProductDiscount = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as any)
  .handler(async ({ data }) => {
    return (await import("../server/functions/admin")).setAdminProductDiscount({ data });
  });

export const getAdminCategories = createServerFn({ method: "GET" }).handler(async () => {
  return (await import("../server/functions/admin")).getAdminCategories();
});

export const saveAdminCategory = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as any)
  .handler(async ({ data }) => {
    return (await import("../server/functions/admin")).saveAdminCategory({ data });
  });

export const removeAdminCategory = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as any)
  .handler(async ({ data }) => {
    return (await import("../server/functions/admin")).removeAdminCategory({ data });
  });

export const getAdminOrders = createServerFn({ method: "GET" })
  .validator((data: unknown) => data as any)
  .handler(async ({ data }) => {
    return (await import("../server/functions/admin")).getAdminOrders({ data });
  });

export const getAdminOrder = createServerFn({ method: "GET" })
  .validator((data: unknown) => data as any)
  .handler(async ({ data }) => {
    return (await import("../server/functions/admin")).getAdminOrder({ data });
  });

export const setAdminOrderStatus = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as any)
  .handler(async ({ data }) => {
    return (await import("../server/functions/admin")).setAdminOrderStatus({ data });
  });

export const reviewAdminPayment = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as any)
  .handler(async ({ data }) => {
    return (await import("../server/functions/admin")).reviewAdminPayment({ data });
  });

export const getAdminPosts = createServerFn({ method: "GET" }).handler(async () => {
  return (await import("../server/functions/admin")).getAdminPosts();
});

export const saveAdminPost = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as any)
  .handler(async ({ data }) => {
    return (await import("../server/functions/admin")).saveAdminPost({ data });
  });

export const removeAdminPost = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as any)
  .handler(async ({ data }) => {
    return (await import("../server/functions/admin")).removeAdminPost({ data });
  });

export const getAdminComments = createServerFn({ method: "GET" })
  .validator((data: unknown) => data as any)
  .handler(async ({ data }) => {
    return (await import("../server/functions/admin")).getAdminComments({ data });
  });

export const setAdminCommentStatus = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as any)
  .handler(async ({ data }) => {
    return (await import("../server/functions/admin")).setAdminCommentStatus({ data });
  });

export const removeAdminComment = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as any)
  .handler(async ({ data }) => {
    return (await import("../server/functions/admin")).removeAdminComment({ data });
  });

export const setAdminReviewStatus = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as any)
  .handler(async ({ data }) => {
    return (await import("../server/functions/admin")).setAdminReviewStatus({ data });
  });

export const getAdminCustomers = createServerFn({ method: "GET" })
  .validator((data: unknown) => data as any)
  .handler(async ({ data }) => {
    return (await import("../server/functions/admin")).getAdminCustomers({ data });
  });

export const markAdminMessageRead = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as any)
  .handler(async ({ data }) => {
    return (await import("../server/functions/admin")).markAdminMessageRead({ data });
  });

export const getAdminCoupons = createServerFn({ method: "GET" }).handler(async () => {
  return (await import("../server/functions/admin")).getAdminCoupons();
});

export const saveAdminCoupon = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as any)
  .handler(async ({ data }) => {
    return (await import("../server/functions/admin")).saveAdminCoupon({ data });
  });

export const removeAdminCoupon = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as any)
  .handler(async ({ data }) => {
    return (await import("../server/functions/admin")).removeAdminCoupon({ data });
  });

export const getAdminSettings = createServerFn({ method: "GET" }).handler(async () => {
  return (await import("../server/functions/admin")).getAdminSettings();
});

export const saveAdminSettings = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as any)
  .handler(async ({ data }) => {
    return (await import("../server/functions/admin")).saveAdminSettings({ data });
  });
