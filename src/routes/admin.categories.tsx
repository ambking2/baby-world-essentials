import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { slugify, toFaDigits } from "@/lib/format";
import { getAdminCategories, removeAdminCategory, saveAdminCategory } from "@/server/functions/admin";

export const Route = createFileRoute("/admin/categories")({
  component: AdminCategories,
});

const field =
  "w-full rounded-xl border border-border bg-background px-3 py-2.5 text-xs outline-none transition-colors focus:border-brand";
const label = "mb-1 block text-[11px] font-bold text-foreground";

type FormState = {
  id: number | null;
  slug: string;
  title: string;
  blurb: string;
  image: string;
  parentId: number | "";
  kind: "general" | "clothing";
  sort: number;
  isActive: boolean;
};

const emptyForm: FormState = {
  id: null,
  slug: "",
  title: "",
  blurb: "",
  image: "",
  parentId: "",
  kind: "general",
  sort: 0,
  isActive: true,
};

function AdminCategories() {
  const queryClient = useQueryClient();
  const categoriesQuery = useQuery({ queryKey: ["admin-categories"], queryFn: () => getAdminCategories() });
  const [form, setForm] = useState<FormState>(emptyForm);

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
    void queryClient.invalidateQueries({ queryKey: ["catalog-shell"] });
  };

  const save = useMutation({
    mutationFn: () =>
      saveAdminCategory({
        data: {
          ...(form.id === null ? {} : { id: form.id }),
          slug: form.slug.trim().length > 0 ? form.slug.trim() : slugify(form.title),
          title: form.title.trim(),
          blurb: form.blurb.trim().length > 0 ? form.blurb.trim() : null,
          image: form.image.trim().length > 0 ? form.image.trim() : null,
          parentId: form.parentId === "" ? null : form.parentId,
          kind: form.kind,
          sort: form.sort,
          isActive: form.isActive,
        },
      }),
    onSuccess: (result) => {
      toast.success(result.message);
      setForm(emptyForm);
      refresh();
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "ذخیرهٔ دسته انجام نشد."),
  });

  const remove = useMutation({
    mutationFn: (id: number) => removeAdminCategory({ data: { id } }),
    onSuccess: (result) => {
      toast.success(result.message);
      refresh();
    },
  });

  const tree = categoriesQuery.data?.tree ?? [];
  const flat = categoriesQuery.data?.flat ?? [];

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
      <section className="space-y-3 rounded-3xl border border-border bg-card p-5">
        <h1 className="text-sm font-extrabold text-foreground">دسته‌بندی‌ها</h1>

        {tree.map((root) => (
          <div key={root.id} className="rounded-2xl border border-border p-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-xs font-extrabold text-foreground">
                  {root.title}
                  {root.kind === "clothing" ? " · پوشاک" : ""}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {root.slug} · {toFaDigits(root.productCount)} محصول
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setForm({
                      id: root.id,
                      slug: root.slug,
                      title: root.title,
                      blurb: root.blurb ?? "",
                      image: root.image ?? "",
                      parentId: root.parentId ?? "",
                      kind: root.kind === "clothing" ? "clothing" : "general",
                      sort: root.sort,
                      isActive: true,
                    })
                  }
                  className="rounded-lg border border-border px-3 py-1 text-[10px] font-bold hover:border-brand hover:text-brand"
                >
                  ویرایش
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`دستهٔ «${root.title}» حذف شود؟`)) remove.mutate(root.id);
                  }}
                  className="rounded-lg border border-border p-1.5 text-muted-foreground hover:border-sale hover:text-sale"
                  aria-label="حذف دسته"
                >
                  <Trash2 className="size-3.5" aria-hidden />
                </button>
              </div>
            </div>

            {root.children.length > 0 ? (
              <div className="mt-2 space-y-2 border-s border-border ps-3">
                {root.children.map((child) => (
                  <div key={child.id} className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-[11px] font-bold text-foreground">{child.title}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {child.slug} · {toFaDigits(child.productCount)} محصول
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setForm({
                            id: child.id,
                            slug: child.slug,
                            title: child.title,
                            blurb: child.blurb ?? "",
                            image: child.image ?? "",
                            parentId: child.parentId ?? "",
                            kind: child.kind === "clothing" ? "clothing" : "general",
                            sort: child.sort,
                            isActive: true,
                          })
                        }
                        className="rounded-lg border border-border px-3 py-1 text-[10px] font-bold hover:border-brand hover:text-brand"
                      >
                        ویرایش
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`دستهٔ «${child.title}» حذف شود؟`)) remove.mutate(child.id);
                        }}
                        className="rounded-lg border border-border p-1.5 text-muted-foreground hover:border-sale hover:text-sale"
                        aria-label="حذف زیردسته"
                      >
                        <Trash2 className="size-3.5" aria-hidden />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </section>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          save.mutate();
        }}
        className="h-fit space-y-3 rounded-3xl border border-border bg-card p-5"
      >
        <h2 className="text-sm font-extrabold text-foreground">
          {form.id === null ? "دستهٔ جدید" : "ویرایش دسته"}
        </h2>

        <div>
          <span className={label}>عنوان</span>
          <input required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} className={field} />
        </div>
        <div>
          <span className={label}>نامک (slug)</span>
          <input value={form.slug} onChange={(event) => setForm({ ...form, slug: event.target.value })} dir="ltr" className={field} />
        </div>
        <div>
          <span className={label}>توضیح کوتاه</span>
          <textarea value={form.blurb} onChange={(event) => setForm({ ...form, blurb: event.target.value })} rows={3} className={field} />
        </div>
        <div>
          <span className={label}>مسیر تصویر</span>
          <input
            value={form.image}
            onChange={(event) => setForm({ ...form, image: event.target.value })}
            placeholder="/images/cat-clothing.jpg"
            dir="ltr"
            className={field}
          />
        </div>
        <div>
          <span className={label}>دستهٔ والد</span>
          <select
            value={form.parentId === "" ? "" : String(form.parentId)}
            onChange={(event) => setForm({ ...form, parentId: event.target.value === "" ? "" : Number(event.target.value) })}
            className={field}
          >
            <option value="">دستهٔ اصلی</option>
            {flat
              .filter((category) => category.id !== form.id)
              .map((category) => (
                <option key={category.id} value={String(category.id)}>
                  {category.title}
                </option>
              ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className={label}>نوع دسته</span>
            <select
              value={form.kind}
              onChange={(event) => setForm({ ...form, kind: event.target.value === "clothing" ? "clothing" : "general" })}
              className={field}
            >
              <option value="general">عمومی</option>
              <option value="clothing">پوشاک (انتخاب سایز)</option>
            </select>
          </div>
          <div>
            <span className={label}>ترتیب</span>
            <input
              type="number"
              value={form.sort}
              onChange={(event) => setForm({ ...form, sort: Number(event.target.value) })}
              className={field}
            />
          </div>
        </div>

        <label className="flex items-center gap-2 text-[11px]">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(event) => setForm({ ...form, isActive: event.target.checked })}
            className="size-4 accent-[var(--color-brand)]"
          />
          فعال باشد
        </label>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={save.isPending}
            className="flex-1 rounded-full bg-brand px-4 py-2.5 text-[11px] font-bold text-primary-foreground disabled:opacity-60"
          >
            ذخیره
          </button>
          {form.id === null ? null : (
            <button
              type="button"
              onClick={() => setForm(emptyForm)}
              className="rounded-full border border-border px-4 py-2.5 text-[11px] font-bold hover:border-brand hover:text-brand"
            >
              لغو
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
