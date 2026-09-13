import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { HeartOff, ShoppingCart } from "lucide-react";
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
    <div className="space-y-4">
      <h1 className="font-headline-md text-headline-md font-bold text-on-surface">علاقه‌مندی‌های من</h1>

      {items.length === 0 ? (
        <div className="card-soft rounded-lg p-12 text-center">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-surface-container-low">
            <HeartOff className="size-6 text-on-surface-variant" />
          </div>
          <p className="text-sm text-on-surface-variant">فعلاً محصولی را نشان نکرده‌اید. با آیتم قلب روی کارت محصولات، آن‌ها را اینجا ذخیره کنید.</p>
          <Link to="/shop" className="mt-4 inline-block rounded-full bg-primary px-6 py-2.5 text-[13px] font-bold text-on-primary shadow-md shadow-primary/25">
            رفتن به فروشگاه
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.productId} className="card-soft soft-tactile flex items-center gap-4 rounded-lg p-3">
              <Link to="/product/$slug" params={{ slug: item.slug }} className="shrink-0 overflow-hidden rounded-lg bg-surface-container-low">
                <img src={item.cover ?? "/images/cat-toys.jpg"} alt={item.title} className="size-24 object-cover transition-transform duration-500 hover:scale-105" />
              </Link>
              <div className="min-w-0 flex-1">
                <Link
                  to="/product/$slug"
                  params={{ slug: item.slug }}
                  className="line-clamp-2 text-sm font-bold text-on-surface transition-colors hover:text-primary"
                >
                  {item.title}
                </Link>
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                  {item.stock > 0 ? (
                    <Price price={item.price} effectivePrice={item.effectivePrice} size="sm" />
                  ) : (
                    <span className="text-[12px] font-bold text-destructive">ناموجود در انبار</span>
                  )}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={item.stock <= 0 || addToCart.isPending}
                      onClick={() => addToCart.mutate(item.productId)}
                      className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-[12px] font-bold text-on-primary shadow-md shadow-primary/20 transition-transform hover:scale-105 active:scale-95 disabled:opacity-50"
                    >
                      <ShoppingCart className="size-3.5" />
                      {item.stock > 0 ? "افزودن به سبد" : "ناموجود"}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeItem.mutate(item.productId)}
                      className="flex size-8 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-error-container hover:text-on-error-container"
                      aria-label="حذف از علاقه‌مندی‌ها"
                    >
                      <HeartOff className="size-4" aria-hidden />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
