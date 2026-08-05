import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Search, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Pagination } from "@/components/store/Pagination";
import { formatToman, toFaDigits } from "@/lib/format";
import {
  getAdminProducts,
  removeAdminProduct,
  setAdminProductDiscount,
  setAdminProductFlags,
} from "@/server/functions/admin";

export const Route = createFileRoute("/admin/products/")({
  component: AdminProducts,
});

const cellInput =
  "w-24 rounded-lg border border-border bg-background px-2 py-1 text-[10px] outline-none focus:border-brand";

function AdminProducts() {
  const queryClient = useQueryClient();
  const [term, setTerm] = useState("");
  const [appliedTerm, setAppliedTerm] = useState("");
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [page, setPage] = useState(1);

  const productsQuery = useQuery({
    queryKey: ["admin-products", appliedTerm, categoryId, page],
    queryFn: () =>
      getAdminProducts({
        data: {
          page,
          ...(appliedTerm.trim().length > 0 ? { q: appliedTerm.trim() } : {}),
          ...(categoryId === "" ? {} : { categoryId }),
        },
      }),
  });

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    void queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
  };

  const saveFlags = useMutation({
    mutationFn: (input: { id: number; isActive?: boolean; stock?: number; price?: number }) =>
      setAdminProductFlags({ data: input }),
    onSuccess: (result) => {
      toast.success(result.message);
      refresh();
    },
  });

  const saveDiscount = useMutation({
    mutationFn: (input: { id: number; percent: number; timed?: boolean; endsAt?: string | null }) =>
      setAdminProductDiscount({ data: input }),
    onSuccess: (result) => {
      toast.success(result.message);
      refresh();
    },
  });

  const deleteProduct = useMutation({
    mutationFn: (id: number) => removeAdminProduct({ data: { id } }),
    onSuccess: (result) => {
      toast.success(result.message);
      refresh();
    },
  });

  const items = productsQuery.data?.items ?? [];
  const categories = productsQuery.data?.categories ?? [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 rounded-3xl border border-border bg-card p-4">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setAppliedTerm(term);
            setPage(1);
          }}
          className="flex flex-1 items-center gap-2 rounded-xl border border-border px-3 py-2"
        >
          <Search className="size-4 text-muted-foreground" aria-hidden />
          <input
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            placeholder="جستجو با نام، کد یا نامک…"
            className="w-full bg-transparent text-xs outline-none"
          />
        </form>

        <select
          value={categoryId === "" ? "" : String(categoryId)}
          onChange={(event) => {
            setCategoryId(event.target.value === "" ? "" : Number(event.target.value));
            setPage(1);
          }}
          className="rounded-xl border border-border bg-background px-3 py-2 text-xs outline-none focus:border-brand"
        >
          <option value="">همهٔ دسته‌ها</option>
          {categories.map((category) => (
            <option key={category.id} value={String(category.id)}>
              {category.title}
            </option>
          ))}
        </select>

        <Link
          to="/admin/products/$id"
          params={{ id: "new" }}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-[11px] font-bold text-white shadow-sm hover:bg-primary/95 transition-all focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 outline-none"
        >
          <Plus className="size-4" aria-hidden />
          محصول جدید
        </Link>
      </div>

      <div className="overflow-x-auto rounded-3xl border border-border bg-card p-4">
        <table className="w-full min-w-[900px] text-[11px]">
          <thead className="text-muted-foreground">
            <tr className="border-b border-border">
              <th className="p-2 text-start font-bold">محصول</th>
              <th className="p-2 text-start font-bold">دسته</th>
              <th className="p-2 text-start font-bold">قیمت (تومان)</th>
              <th className="p-2 text-start font-bold">موجودی</th>
              <th className="p-2 text-start font-bold">تخفیف ساده (%)</th>
              <th className="p-2 text-start font-bold">تخفیف زمان‌دار</th>
              <th className="p-2 text-start font-bold">فعال</th>
              <th className="p-2 text-start font-bold" />
            </tr>
          </thead>
          <tbody>
            {items.map((row) => (
              <tr key={row.id} className="border-b border-border/60 last:border-0">
                <td className="p-2">
                  <div className="flex items-center gap-2">
                    <img src={row.cover ?? "/images/cat-toys.jpg"} alt={row.title} className="size-10 rounded-lg object-cover" />
                    <div>
                      <Link to="/admin/products/$id" params={{ id: String(row.id) }} className="font-extrabold hover:text-brand">
                        {row.title}
                      </Link>
                      <p className="text-[10px] text-muted-foreground">
                        {row.code} · فروش: {toFaDigits(row.soldCount)}
                        {row.variantCount > 0 ? ` · ${toFaDigits(row.variantCount)} تنوع` : ""}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="p-2 text-muted-foreground">{row.categoryTitle ?? "—"}</td>
                <td className="p-2">
                  <input
                    type="number"
                    defaultValue={row.price}
                    onBlur={(event) => {
                      const price = Number(event.target.value);
                      if (Number.isFinite(price) && price !== row.price) saveFlags.mutate({ id: row.id, price });
                    }}
                    className={cellInput}
                  />
                  <p className="mt-1 text-[10px] text-muted-foreground">{formatToman(row.price)}</p>
                </td>
                <td className="p-2">
                  <input
                    type="number"
                    defaultValue={row.stock}
                    onBlur={(event) => {
                      const stock = Number(event.target.value);
                      if (Number.isFinite(stock) && stock !== row.stock) saveFlags.mutate({ id: row.id, stock });
                    }}
                    className={`${cellInput} ${row.stock <= 2 ? "border-sale text-sale" : ""}`}
                  />
                </td>
                <td className="p-2">
                  <input
                    type="number"
                    min={0}
                    max={90}
                    defaultValue={row.discountPercent}
                    onBlur={(event) => {
                      const percent = Number(event.target.value);
                      if (Number.isFinite(percent) && percent !== row.discountPercent) {
                        saveDiscount.mutate({ id: row.id, percent });
                      }
                    }}
                    className={cellInput}
                  />
                </td>
                <td className="p-2">
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min={0}
                      max={90}
                      defaultValue={row.salePercent}
                      id={`sale-${row.id}`}
                      className="w-14 rounded-lg border border-border bg-background px-2 py-1 text-[10px] outline-none focus:border-brand"
                    />
                    <input
                      type="date"
                      defaultValue={row.saleEndsAt ? row.saleEndsAt.slice(0, 10) : ""}
                      id={`sale-end-${row.id}`}
                      className="w-28 rounded-lg border border-border bg-background px-2 py-1 text-[10px] outline-none focus:border-brand"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const percentEl = document.getElementById(`sale-${row.id}`) as HTMLInputElement | null;
                        const endEl = document.getElementById(`sale-end-${row.id}`) as HTMLInputElement | null;
                        const percent = Number(percentEl?.value ?? 0);
                        const endValue = endEl?.value ?? "";
                        saveDiscount.mutate({
                          id: row.id,
                          percent,
                          timed: true,
                          endsAt: endValue.length > 0 ? new Date(`${endValue}T23:59:00`).toISOString() : null,
                        });
                      }}
                      className="rounded-lg bg-primary px-3 py-1 text-[10px] font-bold text-white hover:bg-primary/95 transition-all focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 outline-none"
                    >
                      ثبت
                    </button>
                  </div>
                </td>
                <td className="p-2">
                  <input
                    type="checkbox"
                    checked={row.isActive}
                    onChange={(event) => saveFlags.mutate({ id: row.id, isActive: event.target.checked })}
                    className="size-4 accent-[var(--color-brand)]"
                  />
                </td>
                <td className="p-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`محصول «${row.title}» حذف شود؟`)) deleteProduct.mutate(row.id);
                    }}
                    className="rounded-lg border border-border p-1.5 text-muted-foreground hover:border-sale hover:text-sale"
                    aria-label="حذف محصول"
                  >
                    <Trash2 className="size-4" aria-hidden />
                  </button>
                </td>
              </tr>
            ))}
            {items.length === 0 && !productsQuery.isLoading ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-muted-foreground">
                  محصولی پیدا نشد.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>

        <Pagination page={page} pageCount={productsQuery.data?.pageCount ?? 1} onChange={setPage} />
      </div>
    </div>
  );
}
