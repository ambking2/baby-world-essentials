import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        gcTime: 5 * 60_000,
        refetchOnWindowFocus: false,
      },
    },
  });

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreload: "intent",
    defaultPreloadStaleTime: 30_000,
  });

  // انتقال کشِ react-query از سرور به کلاینت هنگام SSR — بدون این، داده‌های
  // loader روی کلاینت وجود ندارند و هیدریشن ناسازگاری رخ می‌دهد.
  setupRouterSsrQueryIntegration({ router, queryClient });

  return router;
};
