import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { Breadcrumb } from "@/components/store/Breadcrumb";
import { MobileFilterSheet } from "@/components/store/MobileFilterSheet";
import { FilterSidebar, type FilterState } from "@/components/store/FilterSidebar";
import { Pagination } from "@/components/store/Pagination";
import { ProductGrid } from "@/components/store/ProductGrid";
import { SortBar, type SortKeyUi } from "@/components/store/SortBar";
import { StoreShell, storeKeys } from "@/components/store/StoreShell";
import { toFaDigits } from "@/lib/format";
import { getCatalogShell, getCategoryPage } from "@/server/functions/catalog";
import { addCartItem } from "@/server/functions/cart";
import type { ProductCard } from "@/server/repo/products";

export const Route = createFileRoute("/category/$slug")({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData({
      queryKey: [
        "category",
        params.slug,
        1,
        "newest",
        { sizes: [], colors: [], onlyAvailable: false, onlyDiscounted: false },
      ],
      queryFn: () => getCategoryPage({ data: { slug: params.slug, page: 1, sort: "newest" } }),
    }),
  component: CategoryPage,
});

function CategoryPage() {
  const { slug } = Route.useParams();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<SortKeyUi>("newest");
  const [filters, setFilters] = useState<FilterState>({
    sizes: [],
    colors: [],
    onlyAvailable: false,
    onlyDiscounted: false,
  });
  const [filtersOpen, setFiltersOpen] = useState(false);

  const activeFiltersCount =
    filters.sizes.length +
    filters.colors.length +
    (filters.onlyAvailable ? 1 : 0) +
    (filters.onlyDiscounted ? 1 : 0) +
    (filters.minPrice !== undefined || filters.maxPrice !== undefined ? 1 : 0);

  const shellQuery = useQuery({
    queryKey: storeKeys.shell,
    queryFn: () => getCatalogShell(),
    staleTime: 5 * 60 * 1000,
  });

  const pageQuery = useQuery({
    queryKey: ["category", slug, page, sort, filters],
    queryFn: () =>
      getCategoryPage({
        data: {
          slug,
          page,
          sort,
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

  const data = pageQuery.data;
  const products = data?.products;
  const categories = shellQuery.data?.categories ?? [];

  return (
    <StoreShell>
      <div className="container-page py-base">
        <Breadcrumb
          items={(data?.breadcrumb ?? []).map((crumb) => ({
            title: crumb.title,
            href: `/category/${crumb.slug}`,
          }))}
          className="mb-4"
        />

        <div className="relative mb-10 text-center md:text-right">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h1 className="font-headline-md text-headline-md text-primary">
                {data?.category?.title ?? "دسته‌بندی محصولات"}
              </h1>
              {data?.category?.blurb ? (
                <p className="mt-2 max-w-2xl font-body-md text-body-md text-on-surface-variant">
                  {data.category.blurb}
                </p>
              ) : null}
            </div>
            {products ? (
              <span className="hidden shrink-0 rounded-full bg-primary-fixed px-6 py-2 text-[13px] font-bold text-on-primary-fixed md:inline-block">
                {toFaDigits(products.total)} کالا
              </span>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col gap-gutter md:flex-row">
          <FilterSidebar
            state={filters}
            onChange={(next) => {
              setFilters(next);
              setPage(1);
            }}
            priceBounds={products?.priceBounds ?? { min: 0, max: 20_000_000 }}
            availableSizes={products?.availableSizes ?? []}
            availableColors={products?.availableColors ?? []}
            categories={categories}
            activeSlug={slug}
            className="hidden w-72 shrink-0 md:block"
          />

          <div className="min-w-0 flex-1">
            <SortBar
              sort={sort}
              total={products?.total ?? 0}
              onChange={(next) => {
                setSort(next);
                setPage(1);
              }}
              onOpenFilters={() => setFiltersOpen(true)}
              activeFiltersCount={activeFiltersCount}
            />

            <ProductGrid
              products={products?.items ?? []}
              columns={3}
              onAddToCart={(product) => addToCart.mutate(product)}
              busyId={addToCart.isPending ? (addToCart.variables?.id ?? null) : null}
              emptyMessage={
                pageQuery.isLoading ? "در حال بارگزاری محصولات…" : "محصولی با این فیلترها پیدا نشد."
              }
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

        <MobileFilterSheet
          open={filtersOpen}
          onOpenChange={setFiltersOpen}
          state={filters}
          onChange={(next) => {
            setFilters(next);
            setPage(1);
          }}
          priceBounds={products?.priceBounds ?? { min: 0, max: 20_000_000 }}
          availableSizes={products?.availableSizes ?? []}
          availableColors={products?.availableColors ?? []}
          categories={categories}
          activeSlug={slug}
        />
      </div>
    </StoreShell>
  );
}
