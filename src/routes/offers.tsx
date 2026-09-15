import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Timer } from "lucide-react";
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
      {/* Header band */}
      <section className="relative overflow-hidden bg-surface-container-low py-12 md:py-16">
        <div className="pointer-events-none absolute -right-16 -top-10 size-72 rounded-full bg-tertiary-fixed/50 blur-3xl" />
        <div className="pointer-events-none absolute -left-10 bottom-0 size-64 rounded-full bg-primary-fixed/60 blur-3xl" />
        <div className="relative container-page">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-outline-variant/60 bg-surface-container-lowest px-4 py-1.5 font-label-md text-label-md text-tertiary shadow-sm">
                <Timer className="size-4" />
                موجودی محدود — فرصت را از دست ندهید
              </span>
              <h1 className="font-display-lg text-display-lg-mobile font-extrabold tracking-tight text-on-surface md:text-display-lg">
                تخفیف‌ها و <span className="text-primary">پیشنهادهای ویژه</span>
              </h1>
              <p className="font-body-md text-body-md mt-3 max-w-2xl text-on-surface-variant">
                فروش ویژهٔ سیسمونی، لباس نوزاد و تجهیزات اتاق کودک؛ مرتب‌شده بر اساس بیشترین میزان تخفیف.
              </p>
            </div>
            {firstEnd ? <Countdown endsAt={firstEnd} /> : null}
          </div>
        </div>
      </section>

      <div className="container-page py-section-gap">
        {flash.length > 0 ? (
          <section className="mb-16">
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
