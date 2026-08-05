import { createServerFn } from "@tanstack/react-start";

export const getBlogIndex = createServerFn({ method: "GET" })
  .validator((data: unknown) => data as any)
  .handler(async ({ data }) => {
    return (await import("../server/functions/blog")).getBlogIndex({ data });
  });

export const getBlogPost = createServerFn({ method: "GET" })
  .validator((data: unknown) => data as any)
  .handler(async ({ data }) => {
    return (await import("../server/functions/blog")).getBlogPost({ data });
  });

export const submitBlogComment = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as any)
  .handler(async ({ data }) => {
    return (await import("../server/functions/blog")).submitBlogComment({ data });
  });
