import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type ReactNode } from "react";
import { toast } from "sonner";

import { SiteFooter } from "@/components/store/SiteFooter";
import { SiteHeader } from "@/components/store/SiteHeader";
import { joinNewsletter, getCatalogShell } from "@/server/functions/catalog";
import { getCart } from "@/server/functions/cart";
import { getSession } from "@/server/functions/auth";

/** کلیدهای کوئری مشترک در همهٔ صفحات. */
export const storeKeys = {
  shell: ["catalog-shell"] as const,
  cart: ["cart"] as const,
  session: ["session"] as const,
};

/**
 * پوستهٔ فروشگاه: هدر + محتوا + فوتر.
 * دادهٔ دسته‌بندی، سبد خرید و نشست کاربر یک‌جا گرفته می‌شود.
 */
export function StoreShell({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  const shellQuery = useQuery({
    queryKey: storeKeys.shell,
    queryFn: () => getCatalogShell(),
    staleTime: 5 * 60 * 1000,
  });

  const cartQuery = useQuery({
    queryKey: storeKeys.cart,
    queryFn: () => getCart(),
  });

  const sessionQuery = useQuery({
    queryKey: storeKeys.session,
    queryFn: () => getSession(),
    staleTime: 60 * 1000,
  });

  const subscribe = useMutation({
    mutationFn: (email: string) => joinNewsletter({ data: { email } }),
    onSuccess: (result) => toast.success(result.message),
    onError: () => toast.error("ایمیل واردشده درست نیست."),
  });

  const categories = shellQuery.data?.categories ?? [];
  const cart = cartQuery.data;
  const user = sessionQuery.data?.user ?? null;

  void queryClient;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:z-[70] focus:m-2 focus:rounded-lg focus:bg-brand focus:px-3 focus:py-2 focus:text-sm focus:text-primary-foreground"
      >
        رفتن به محتوای اصلی
      </a>

      <SiteHeader
        categories={categories}
        cartCount={cart?.itemCount ?? 0}
        cartTotal={cart?.grandTotal ?? 0}
        userName={user ? (user.name ?? user.email) : null}
        isAdmin={user?.role === "admin"}
        announcement={shellQuery.data?.announcement ?? null}
      />

      <main id="main" className="flex-1">
        {children}
      </main>

      <SiteFooter
        categories={categories}
        onSubscribe={(email) => subscribe.mutate(email)}
        subscribing={subscribe.isPending}
      />
    </div>
  );
}
