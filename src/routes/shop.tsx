import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { FilterSidebar, type FilterState } from "@/components/store/FilterSidebar";
import { Pagination } from "@/components/store/Pagination";
import { ProductGrid } from "@/components/store/ProductGrid";
import { SortBar, type SortKeyUi } from "@/components/store/SortBar";
import { StoreShell, storeKeys } from "@/components/store/StoreShell";
import { toFaDigits } from "@/lib/format";
import { getCatalogShell } from "@/server/functions/catalog";
import { addCartItem } from "@/server/functions/cart";
import { getProducts } from "@/server/functions/products";
import type { ProductCard } from "@/server/repo/products";

const title = "فروشگاه | همه کالاهای سیسمونی جهان کودک";
const description =
  "فهرست کامل کالاهای فروشگاه جهان کودک ابهر: سرویس خواب، کالسکه، پوشاک نوزاد، اسباب‌بازی چوبی و لوازم تغذیه با ارسال به سراسر ایران.";

export const Route = createFileRoute("/shop")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData({
      queryKey: ["shop", 1, "newest", { sizes: [], colors: [], onlyAvailable: false, onlyDiscounted: false }],
      queryFn: () => getProducts({ data: { page: 1, sort: "newest", perPage: 12 } }),
    }),
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
    ],
  }),
  component: ShopPage,
});

function ShopPage() {
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<SortKeyUi>("newest");
  const [filters, setFilters] = useState<FilterState>({
    sizes: [],
    colors: [],
    onlyAvailable: false,
    onlyDiscounted: false,
  });

  const shellQuery = useQuery({
    queryKey: storeKeys.shell,
    queryFn: () => getCatalogShell(),
    staleTime: 5 * 60 * 1000,
  });

  const listQuery = useQuery({
    queryKey: ["shop", page, sort, filters],
    queryFn: () =>
      getProducts({
        data: {
          page,
          sort,
          perPage: 12,
          ...(filters.minPrice === undefined ? {} : { minPrice: filters.minPrice }),
          ...(filters.maxPrice === undefined ? {} : { maxPrice: filters.maxPrice }),
          ...(filters.sizes.length > 0 ? { sizes: filters.sizes } : {}),
          ...(filters.colors.length > 0 ? { colors: filters.colors } : {}),
          ...(filters.onlyAvailable ? { onlyAvailable: true } : {}),
          ...(filters.onlyDiscounted ? { onlyDiscounted: true } : {}),
        },
      }),
    staleTime: 60_000,
    placeholderData: (previous) => previous,
  });

  const addToCart = useMutation({
    mutationFn: (product: ProductCard) => addCartItem({ data: { productId: product.id, qty: 1 } }),
    onSuccess: (result) => {
      toast.success(result.message);
      void queryClient.invalidateQueries({ queryKey: storeKeys.cart });
    },
    onError: () => toast.error("افزودن به سبد انجام نشد."),
  });

  const products = listQuery.data;

  return (
    <StoreShell>
      <div className="container-page py-6">
        <div className="mb-10 lg:mb-16">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">فروشگاه</h1>
          <div className="mt-3 flex items-center gap-2">
            <div className="h-1 w-12 bg-primary rounded-full"></div>
            {products ? (
              <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                شامل {toFaDigits(products.total)} کالا در جهان کودک
              </p>
            ) : null}
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
          <FilterSidebar
            state={filters}
            onChange={(next) => {
              setFilters(next);
              setPage(1);
            }}
            priceBounds={products?.priceBounds ?? { min: 0, max: 20_000_000 }}
            availableSizes={products?.availableSizes ?? []}
            availableColors={products?.availableColors ?? []}
            categories={shellQuery.data?.categories ?? []}
            className="hidden lg:block"
          />

          <div>
            <SortBar
              sort={sort}
              total={products?.total ?? 0}
              onChange={(next) => {
                setSort(next);
                setPage(1);
              }}
            />

            <ProductGrid
              products={products?.items ?? []}
              columns={3}
              onAddToCart={(product) => addToCart.mutate(product)}
              busyId={addToCart.isPending ? (addToCart.variables?.id ?? null) : null}
              emptyMessage={listQuery.isLoading ? "در حال بارگذاری…" : "فعلاً کالایی در این بخش نداریم."}
            />

            <Pagination
              page={products?.page ?? 1}
              pageCount={products?.pageCount ?? 1}
              onChange={(next) => {
                setPage(next);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="mt-8"
            />
          </div>
        </div>
      </div>
    </StoreShell>
  );
}
