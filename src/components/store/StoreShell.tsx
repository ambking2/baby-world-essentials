import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type ReactNode } from "react";
import { toast } from "sonner";

import { SiteFooter } from "@/components/store/SiteFooter";
import { SiteHeader } from "@/components/store/SiteHeader";
import { joinNewsletter, getCatalogShell } from "@/server/functions/catalog";
import { getCart } from "@/server/functions/cart";
import { getSession } from "@/server/functions/auth";

export const storeKeys = {
  shell: ["catalog-shell"] as const,
  cart: ["cart"] as const,
  session: ["session"] as const,
};

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
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 top-24 size-72 rounded-full bg-brand/10 blur-3xl" />
        <div className="absolute right-[-5rem] top-80 size-80 rounded-full bg-sale/10 blur-3xl" />
        <div className="absolute left-1/3 top-[38rem] size-80 rounded-full bg-sky/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 right-0 h-72 bg-gradient-to-t from-brand-soft/30 to-transparent" />
      </div>

      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:z-[70] focus:m-2 focus:rounded-lg focus:bg-brand focus:px-3 focus:py-2 focus:text-sm focus:text-primary-foreground"
      >
        رفتن به محتوای اصلی
      </a>

      <div className="relative z-10">
        <SiteHeader
          categories={categories}
          cartCount={cart?.itemCount ?? 0}
          cartTotal={cart?.grandTotal ?? 0}
          userName={user ? (user.name ?? user.email) : null}
          isAdmin={user?.role === "admin"}
          announcement={shellQuery.data?.announcement ?? null}
        />
      </div>

      <main id="main" className="relative z-10 flex-1 pb-8">
        {children}
      </main>

      <div className="relative z-10">
        <SiteFooter
          categories={categories}
          onSubscribe={(email) => subscribe.mutate(email)}
          subscribing={subscribe.isPending}
        />
      </div>
    </div>
  );
}
