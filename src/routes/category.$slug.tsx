import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { Breadcrumb } from "@/components/store/Breadcrumb";
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
      <div className="container-page py-6">
        <Breadcrumb
          items={(data?.breadcrumb ?? []).map((crumb) => ({ title: crumb.title, href: `/category/${crumb.slug}` }))}
          className="mb-4"
        />

        <div className="mb-5 rounded-3xl border border-border bg-card p-5">
          <h1 className="text-xl font-extrabold text-foreground">{data?.category?.title ?? "دسته‌بندی محصولات"}</h1>
          {data?.category?.blurb ? (
            <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground">{data.category.blurb}</p>
          ) : null}
          {products ? (
            <p className="mt-2 text-xs text-muted-foreground">{toFaDigits(products.total)} کالا در این دسته پیدا شد</p>
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
            categories={categories}
            activeSlug={slug}
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
              emptyMessage={pageQuery.isLoading ? "در حال بارگزاری محصولات…" : "محصولی با این فیلترها پیدا نشد."}
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
