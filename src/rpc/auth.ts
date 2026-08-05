import { createServerFn } from "@tanstack/react-start";

export const getSession = createServerFn({ method: "GET" }).handler(async () => {
  return (await import("../server/functions/auth")).getSession();
});

export const registerUser = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as any)
  .handler(async ({ data }) => {
    return (await import("../server/functions/auth")).registerUser({ data });
  });

export const resendVerificationCode = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as any)
  .handler(async ({ data }) => {
    return (await import("../server/functions/auth")).resendVerificationCode({ data });
  });

export const verifyEmailCode = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as any)
  .handler(async ({ data }) => {
    return (await import("../server/functions/auth")).verifyEmailCode({ data });
  });

export const loginUser = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as any)
  .handler(async ({ data }) => {
    return (await import("../server/functions/auth")).loginUser({ data });
  });

export const logoutUser = createServerFn({ method: "POST" }).handler(async () => {
  return (await import("../server/functions/auth")).logoutUser();
});

export const requestPasswordReset = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as any)
  .handler(async ({ data }) => {
    return (await import("../server/functions/auth")).requestPasswordReset({ data });
  });

export const resetPassword = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as any)
  .handler(async ({ data }) => {
    return (await import("../server/functions/auth")).resetPassword({ data });
  });
