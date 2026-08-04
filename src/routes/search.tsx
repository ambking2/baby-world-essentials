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

type SearchParams = { q: string };

export const Route = createFileRoute("/search")({
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    q: typeof search["q"] === "string" ? (search["q"] as string) : "",
  }),
  component: SearchPage,
});

function SearchPage() {
  const { q } = Route.useSearch();
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
    queryKey: ["search", q, page, sort, filters],
    queryFn: () =>
      getProducts({
        data: {
          page,
          sort,
          perPage: 12,
          ...(q.trim().length > 0 ? { q: q.trim() } : {}),
          ...(filters.minPrice === undefined ? {} : { minPrice: filters.minPrice }),
          ...(filters.maxPrice === undefined ? {} : { maxPrice: filters.maxPrice }),
          ...(filters.sizes.length > 0 ? { sizes: filters.sizes } : {}),
          ...(filters.colors.length > 0 ? { colors: filters.colors } : {}),
          ...(filters.onlyAvailable ? { onlyAvailable: true } : {}),
          ...(filters.onlyDiscounted ? { onlyDiscounted: true } : {}),
        },
      }),
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
        <div className="mb-5 rounded-3xl border border-border bg-card p-5">
          <h1 className="text-xl font-extrabold text-foreground">
            {q.trim().length > 0 ? `نتایج جستجو برای «${q}»` : "همهٔ محصولات فروشگاه"}
          </h1>
          {products ? (
            <p className="mt-2 text-xs text-muted-foreground">{toFaDigits(products.total)} کالا پیدا شد</p>
          ) : null}
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
              emptyMessage={listQuery.isLoading ? "در حال جستجو…" : "نتیجه‌ای پیدا نشد؛ عبارت دیگری را امتحان کنید."}
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
