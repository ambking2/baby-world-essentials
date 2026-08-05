import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type ReactNode, useEffect } from "react";
import { toast } from "sonner";
import { reportLovableError } from "@/lib/lovable-error-reporting";

import { SiteFooter } from "@/components/store/SiteFooter";
import { SiteHeader } from "@/components/store/SiteHeader";
import { AdminFloatingButton } from "@/components/store/AdminFloatingButton";
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

  useEffect(() => {
    if (shellQuery.error) {
      reportLovableError(shellQuery.error as Error, { boundary: "StoreShell_shellQuery" });
    }
  }, [shellQuery.error]);

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
    <div className="flex min-h-screen flex-col bg-white">
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
      
      <AdminFloatingButton />
    </div>
  );
}
