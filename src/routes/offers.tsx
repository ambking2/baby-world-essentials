import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";

import { Countdown } from "@/components/store/Countdown";
import { ProductGrid } from "@/components/store/ProductGrid";
import { SectionHeading } from "@/components/store/SectionHeading";
import { StoreShell, storeKeys } from "@/components/store/StoreShell";
import { addCartItem } from "@/server/functions/cart";
import { getHomeProducts, getProducts } from "@/server/functions/products";
import type { ProductCard } from "@/server/repo/products";

export const Route = createFileRoute("/offers")({
  component: OffersPage,
});

function OffersPage() {
  const queryClient = useQueryClient();

  const homeQuery = useQuery({ queryKey: ["home-products"], queryFn: () => getHomeProducts(), staleTime: 60 * 1000 });

  const discountedQuery = useQuery({
    queryKey: ["offers"],
    queryFn: () => getProducts({ data: { onlyDiscounted: true, sort: "discount", perPage: 24 } }),
  });

  const addToCart = useMutation({
    mutationFn: (product: ProductCard) => addCartItem({ data: { productId: product.id, qty: 1 } }),
    onSuccess: (result) => {
      toast.success(result.message);
      void queryClient.invalidateQueries({ queryKey: storeKeys.cart });
    },
    onError: () => toast.error("افزودن به سبد انجام نشد."),
  });

  const gridProps = {
    onAddToCart: (product: ProductCard) => addToCart.mutate(product),
    busyId: addToCart.isPending ? (addToCart.variables?.id ?? null) : null,
  };

  const flash = homeQuery.data?.flashSale ?? [];
  const firstEnd = flash[0]?.saleEndsAt ?? null;

  return (
    <StoreShell>
      <div className="container-page py-8">
        <div className="mb-6 rounded-3xl border border-sale/30 bg-sale/5 p-6">
          <h1 className="text-xl font-extrabold text-sale">تخفیف‌ها و پیشنهادهای ویژه</h1>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground">
            فروش ویژهٔ سیسمونی، لباس نوزاد و تجهیزات اتاق کودک. موجودی محدود است.
          </p>
          {firstEnd ? (
            <div className="mt-4">
              <p className="mb-1.5 text-xs font-bold text-sale">نزدیک‌ترین تخفیف در حال پایان:</p>
              <Countdown endsAt={firstEnd} />
            </div>
          ) : null}
        </div>

        {flash.length > 0 ? (
          <section className="mb-10">
            <SectionHeading title="حراج زمان‌دار" subtitle="تا پایان مهلت، با قیمت ویژه" />
            <ProductGrid products={flash} columns={4} {...gridProps} />
          </section>
        ) : null}

        <section>
          <SectionHeading title="همهٔ کالاهای دارای تخفیف" subtitle="مرتب‌شده بر اساس بیشترین میزان تخفیف" />
          <ProductGrid
            products={discountedQuery.data?.items ?? []}
            columns={4}
            {...gridProps}
            emptyMessage={discountedQuery.isLoading ? "در حال بارگزاری…" : "فعلاً تخفیف فعالی ثبت نشده است."}
          />
        </section>
      </div>
    </StoreShell>
  );
}
