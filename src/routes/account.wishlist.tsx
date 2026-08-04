import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { HeartOff } from "lucide-react";
import { toast } from "sonner";

import { Price } from "@/components/store/Price";
import { storeKeys } from "@/components/store/StoreShell";
import { getAccount, toggleWishlistItem } from "@/server/functions/account";
import { addCartItem } from "@/server/functions/cart";

export const Route = createFileRoute("/account/wishlist")({
  component: AccountWishlist,
});

function AccountWishlist() {
  const queryClient = useQueryClient();
  const accountQuery = useQuery({ queryKey: ["account"], queryFn: () => getAccount() });

  const removeItem = useMutation({
    mutationFn: (productId: number) => toggleWishlistItem({ data: { productId } }),
    onSuccess: (result) => {
      toast.success(result.message);
      void queryClient.invalidateQueries({ queryKey: ["account"] });
    },
  });

  const addToCart = useMutation({
    mutationFn: (productId: number) => addCartItem({ data: { productId, qty: 1 } }),
    onSuccess: (result) => {
      toast.success(result.message);
      void queryClient.invalidateQueries({ queryKey: storeKeys.cart });
    },
    onError: () => toast.error("افزودن به سبد انجام نشد."),
  });

  const items = accountQuery.data?.wishlist ?? [];

  return (
    <div className="space-y-3">
      <h1 className="text-sm font-extrabold">علاقه‌مندی‌های من</h1>

      {items.length === 0 ? (
        <div className="rounded-3xl border border-border bg-card p-10 text-center text-xs text-muted-foreground">
          فعلاً محصولی را نشان نکرده‌اید.
        </div>
      ) : (
        items.map((item) => (
          <div key={item.productId} className="flex items-center gap-3 rounded-3xl border border-border bg-card p-3">
            <Link to="/product/$slug" params={{ slug: item.slug }} className="shrink-0">
              <img src={item.cover ?? "/images/cat-toys.jpg"} alt={item.title} className="size-20 rounded-2xl object-cover" />
            </Link>
            <div className="min-w-0 flex-1">
              <Link
                to="/product/$slug"
                params={{ slug: item.slug }}
                className="line-clamp-1 text-xs font-extrabold text-foreground hover:text-brand"
              >
                {item.title}
              </Link>
              <div className="mt-1">
                <Price price={item.price} effectivePrice={item.effectivePrice} size="sm" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={item.stock <= 0 || addToCart.isPending}
                onClick={() => addToCart.mutate(item.productId)}
                className="rounded-full bg-brand px-4 py-2 text-[11px] font-bold text-primary-foreground disabled:opacity-50"
              >
                {item.stock > 0 ? "افزودن به سبد" : "ناموجود"}
              </button>
              <button
                type="button"
                onClick={() => removeItem.mutate(item.productId)}
                className="text-muted-foreground transition-colors hover:text-sale"
                aria-label="حذف از علاقه‌مندی‌ها"
              >
                <HeartOff className="size-4" aria-hidden />
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
