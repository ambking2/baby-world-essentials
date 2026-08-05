import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { addCartItem } from "@/server/functions/cart";
import { storeKeys } from "@/components/store/StoreShell";
import type { ProductCard } from "@/server/repo/products";

export function useAddToCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (product: ProductCard) =>
      addCartItem({ data: { productId: product.id } }),
    onSuccess: (result) => {
      toast.success(result.message);
      void queryClient.invalidateQueries({ queryKey: storeKeys.cart });
    },
    onError: () => {
      toast.error("خطا در افزودن به سبد خرید.");
    },
  });
}
