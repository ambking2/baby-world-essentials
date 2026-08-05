import { createServerFn } from "@tanstack/react-start";

export const getAccount = createServerFn({ method: "GET" }).handler(async () => {
  return (await import("../server/functions/account")).getAccount();
});

export const saveMyAddress = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as any)
  .handler(async ({ data }) => {
    return (await import("../server/functions/account")).saveMyAddress({ data });
  });

export const deleteMyAddress = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as any)
  .handler(async ({ data }) => {
    return (await import("../server/functions/account")).deleteMyAddress({ data });
  });

export const toggleWishlistItem = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as any)
  .handler(async ({ data }) => {
    return (await import("../server/functions/account")).toggleWishlistItem({ data });
  });

export const updateMyProfile = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as any)
  .handler(async ({ data }) => {
    return (await import("../server/functions/account")).updateMyProfile({ data });
  });

export const changeMyPassword = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as any)
  .handler(async ({ data }) => {
    return (await import("../server/functions/account")).changeMyPassword({ data });
  });

export const getWishlistIds = createServerFn({ method: "GET" }).handler(async () => {
  return (await import("../server/functions/account")).getWishlistIds();
});
