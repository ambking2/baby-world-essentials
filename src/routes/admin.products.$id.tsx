import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ImagePlus, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { formatToman, slugify } from "@/lib/format";
import { getAdminProductForm, saveAdminProduct } from "@/server/functions/admin";
import { uploadAdminImage } from "@/server/functions/upload";

export const Route = createFileRoute("/admin/products/$id")({
  component: AdminProductForm,
});

type ImageRow = { url: string; alt: string };
type AttributeRow = { name: string; value: string };
type VariantRow = { size: string; color: string; colorHex: string; priceDelta: number; stock: number };

const field =
  "w-full rounded-xl border border-border bg-background px-3 py-2.5 text-xs outline-none transition-colors focus:border-brand";
const label = "mb-1 block text-[11px] font-bold text-foreground";

function readFileAsBase64(file: File): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolvePromise, rejectPromise) => {
    const reader = new FileReader();
    reader.onerror = () => rejectPromise(new Error("خواندن فایل انجام نشد."));
    reader.onload = () => {
      const result = String(reader.result ?? "");
      const commaIndex = result.indexOf(",");
      resolvePromise({ base64: commaIndex >= 0 ? result.slice(commaIndex + 1) : result, mimeType: file.type });
    };
    reader.readAsDataURL(file);
  });
}

function AdminProductForm() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const productId = id === "new" ? null : Number(id);

  const formQuery = useQuery({
    queryKey: ["admin-product-form", id],
    queryFn: () => getAdminProductForm({ data: { id: productId } }),
  });

  const [code, setCode] = useState("");
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [price, setPrice] = useState(0);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [salePercent, setSalePercent] = useState(0);
  const [saleEndsAt, setSaleEndsAt] = useState("");
  const [stock, setStock] = useState(0);
  const [weightGrams, setWeightGrams] = useState(0);
  const [badge, setBadge] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [madeInWorkshop, setMadeInWorkshop] = useState(false);
  const [images, setImages] = useState<Array<ImageRow>>([]);
  const [attributes, setAttributes] = useState<Array<AttributeRow>>([]);
  const [variants, setVariants] = useState<Array<VariantRow>>([]);

  const values = formQuery.data?.values ?? null;
  const categories = formQuery.data?.categories ?? [];

  useEffect(() => {
    if (!values) return;
    setCode(values.code);
    setSlug(values.slug);
    setTitle(values.title);
    setSubtitle(values.subtitle ?? "");
    setDescription(values.description ?? "");
    setCategoryId(values.categoryId ?? "");
    setPrice(values.price);
    setDiscountPercent(values.discountPercent ?? 0);
    setSalePercent(values.salePercent ?? 0);
    setSaleEndsAt(values.saleEndsAt ? values.saleEndsAt.slice(0, 10) : "");
    setStock(values.stock ?? 0);
    setWeightGrams(values.weightGrams ?? 0);
    setBadge(values.badge ?? "");
    setIsActive(values.isActive !== false);
    setIsFeatured(values.isFeatured === true);
    setMadeInWorkshop(values.madeInWorkshop === true);
    setImages((values.images ?? []).map((image) => ({ url: image.url, alt: image.alt ?? "" })));
    setAttributes((values.attributes ?? []).map((attribute) => ({ name: attribute.name, value: attribute.value })));
    setVariants(
      (values.variants ?? []).map((variant) => ({
        size: variant.size ?? "",
        color: variant.color ?? "",
        colorHex: variant.colorHex ?? "",
        priceDelta: variant.priceDelta ?? 0,
        stock: variant.stock ?? 0,
      })),
    );
  }, [values]);

  const upload = useMutation({
    mutationFn: async (file: File) => {
      const payload = await readFileAsBase64(file);
      return uploadAdminImage({ data: { base64: payload.base64, mimeType: payload.mimeType, purpose: "product" } });
    },
    onSuccess: (result) => {
      setImages((current) => [...current, { url: result.url, alt: "" }]);
      toast.success(result.message);
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "بارگزاری تصویر انجام نشد."),
  });

  const save = useMutation({
    mutationFn: () =>
      saveAdminProduct({
        data: {
          ...(productId === null ? {} : { id: productId }),
          code: code.trim(),
          slug: slug.trim().length > 0 ? slug.trim() : slugify(title),
          title: title.trim(),
          subtitle: subtitle.trim().length > 0 ? subtitle.trim() : null,
          description: description.trim().length > 0 ? description.trim() : null,
          categoryId: categoryId === "" ? null : categoryId,
          price: Math.max(0, Math.round(price)),
          discountPercent,
          salePercent,
          saleEndsAt: saleEndsAt.length > 0 ? new Date(`${saleEndsAt}T23:59:00`).toISOString() : null,
          stock,
          weightGrams,
          isActive,
          isFeatured,
          madeInWorkshop,
          badge: badge.trim().length > 0 ? badge.trim() : null,
          images: images.filter((image) => image.url.trim().length > 0).map((image) => ({ url: image.url, alt: image.alt })),
          attributes: attributes.filter((attribute) => attribute.name.trim().length > 0 && attribute.value.trim().length > 0),
          variants: variants
            .filter((variant) => variant.size.trim().length > 0 || variant.color.trim().length > 0)
            .map((variant) => ({
              size: variant.size.trim().length > 0 ? variant.size.trim() : null,
              color: variant.color.trim().length > 0 ? variant.color.trim() : null,
              colorHex: variant.colorHex.trim().length > 0 ? variant.colorHex.trim() : null,
              priceDelta: variant.priceDelta,
              stock: variant.stock,
            })),
        },
      }),
    onSuccess: (result) => {
      toast.success(result.message);
      void queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      void navigate({ to: "/admin/products" });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "ذخیرهٔ محصول انجام نشد."),
  });

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        save.mutate();
      }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between rounded-3xl border border-border bg-card p-4">
        <h1 className="text-sm font-extrabold text-foreground">
          {productId === null ? "افزودن محصول جدید" : `ویرایش محصول: ${title}`}
        </h1>
        <div className="flex gap-2">
          <Link to="/admin/products" className="rounded-full border border-border px-4 py-2 text-[11px] font-bold hover:border-primary hover:text-primary transition-colors">
            بازگشت
          </Link>
          <button
            type="submit"
            disabled={save.isPending}
            className="rounded-full bg-primary px-6 py-2 text-[11px] font-bold text-white shadow-sm hover:bg-primary/95 disabled:opacity-60"
          >
            {save.isPending ? "در حال ذخیره…" : "ذخیرهٔ محصول"}
          </button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <section className="space-y-3 rounded-3xl border border-border bg-card p-5">
            <h2 className="text-xs font-extrabold text-foreground">اطلاعات اصلی</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <span className={label}>عنوان محصول</span>
                <input required value={title} onChange={(event) => setTitle(event.target.value)} className={field} />
              </div>
              <div>
                <span className={label}>کد محصول</span>
                <input required value={code} onChange={(event) => setCode(event.target.value)} dir="ltr" className={field} />
              </div>
              <div>
                <span className={label}>نامک آدرس (slug)</span>
                <input
                  value={slug}
                  onChange={(event) => setSlug(event.target.value)}
                  onBlur={() => setSlug((current) => (current.trim().length > 0 ? current.trim() : slugify(title)))}
                  dir="ltr"
                  className={field}
                />
              </div>
              <div>
                <span className={label}>دسته‌بندی</span>
                <select
                  value={categoryId === "" ? "" : String(categoryId)}
                  onChange={(event) => setCategoryId(event.target.value === "" ? "" : Number(event.target.value))}
                  className={field}
                >
                  <option value="">بدون دسته</option>
                  {categories.map((category) => (
                    <option key={category.id} value={String(category.id)}>
                      {category.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <span className={label}>زیرعنوان</span>
                <input value={subtitle} onChange={(event) => setSubtitle(event.target.value)} className={field} />
              </div>
              <div className="sm:col-span-2">
                <span className={label}>توضیحات</span>
                <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={6} className={field} />
              </div>
            </div>
          </section>

          <section className="space-y-3 rounded-3xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-extrabold text-foreground">تصاویر محصول</h2>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-primary px-4 py-2 text-[11px] font-bold text-white shadow-sm hover:bg-primary/95 transition-colors">
                <ImagePlus className="size-4" aria-hidden />
                {upload.isPending ? "در حال بارگزاری…" : "بارگزاری تصویر"}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) upload.mutate(file);
                    event.target.value = "";
                  }}
                />
              </label>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {images.map((image, index) => (
                <div key={`${image.url}-${index}`} className="space-y-2 rounded-2xl border border-border p-2">
                  <img src={image.url} alt={image.alt} className="h-28 w-full rounded-xl object-cover" />
                  <input
                    value={image.alt}
                    onChange={(event) =>
                      setImages((current) =>
                        current.map((item, itemIndex) => (itemIndex === index ? { ...item, alt: event.target.value } : item)),
                      )
                    }
                    placeholder="متن جایگزین تصویر"
                    className="w-full rounded-lg border border-border bg-background px-2 py-1 text-[10px] outline-none focus:border-brand"
                  />
                  <button
                    type="button"
                    onClick={() => setImages((current) => current.filter((_, itemIndex) => itemIndex !== index))}
                    className="w-full rounded-lg border border-border py-1 text-[10px] font-bold text-muted-foreground hover:border-sale hover:text-sale"
                  >
                    حذف تصویر
                  </button>
                </div>
              ))}
              {images.length === 0 ? (
                <p className="col-span-full rounded-2xl border border-dashed border-border p-6 text-center text-[11px] text-muted-foreground">
                  برای این محصول تصویری بارگزاری نشده است.
                </p>
              ) : null}
            </div>
          </section>

          <section className="space-y-3 rounded-3xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-extrabold text-foreground">ویژگی‌ها (جدول مشخصات)</h2>
              <button
                type="button"
                onClick={() => setAttributes((current) => [...current, { name: "", value: "" }])}
                className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-[10px] font-bold hover:border-primary hover:text-primary transition-colors"
              >
                <Plus className="size-3" aria-hidden />
                افزودن ویژگی
              </button>
            </div>

            {attributes.map((attribute, index) => (
              <div key={`attribute-${index}`} className="flex gap-2">
                <input
                  value={attribute.name}
                  onChange={(event) =>
                    setAttributes((current) =>
                      current.map((item, itemIndex) => (itemIndex === index ? { ...item, name: event.target.value } : item)),
                    )
                  }
                  placeholder="نام ویژگی (مانند جنس)"
                  className={field}
                />
                <input
                  value={attribute.value}
                  onChange={(event) =>
                    setAttributes((current) =>
                      current.map((item, itemIndex) => (itemIndex === index ? { ...item, value: event.target.value } : item)),
                    )
                  }
                  placeholder="مقدار"
                  className={field}
                />
                <button
                  type="button"
                  onClick={() => setAttributes((current) => current.filter((_, itemIndex) => itemIndex !== index))}
                  className="rounded-xl border border-border px-3 text-muted-foreground hover:border-sale hover:text-sale"
                  aria-label="حذف ویژگی"
                >
                  <Trash2 className="size-4" aria-hidden />
                </button>
              </div>
            ))}
          </section>

          <section className="space-y-3 rounded-3xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-extrabold text-foreground">تنوع سایز و رنگ (مخصوص پوشاک)</h2>
              <button
                type="button"
                onClick={() =>
                  setVariants((current) => [...current, { size: "", color: "", colorHex: "", priceDelta: 0, stock: 0 }])
                }
                className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-[10px] font-bold hover:border-primary hover:text-primary transition-colors"
              >
                <Plus className="size-3" aria-hidden />
                افزودن تنوع
              </button>
            </div>

            {variants.map((variant, index) => (
              <div key={`variant-${index}`} className="grid gap-2 sm:grid-cols-[1fr_1fr_90px_1fr_1fr_44px]">
                <input
                  value={variant.size}
                  onChange={(event) =>
                    setVariants((current) =>
                      current.map((item, itemIndex) => (itemIndex === index ? { ...item, size: event.target.value } : item)),
                    )
                  }
                  placeholder="سایز (۳–۶ ماه)"
                  className={field}
                />
                <input
                  value={variant.color}
                  onChange={(event) =>
                    setVariants((current) =>
                      current.map((item, itemIndex) => (itemIndex === index ? { ...item, color: event.target.value } : item)),
                    )
                  }
                  placeholder="رنگ"
                  className={field}
                />
                <input
                  type="color"
                  value={variant.colorHex.length > 0 ? variant.colorHex : "#f7f5f1"}
                  onChange={(event) =>
                    setVariants((current) =>
                      current.map((item, itemIndex) => (itemIndex === index ? { ...item, colorHex: event.target.value } : item)),
                    )
                  }
                  className="h-10 w-full rounded-xl border border-border bg-background"
                />
                <input
                  type="number"
                  value={variant.priceDelta}
                  onChange={(event) =>
                    setVariants((current) =>
                      current.map((item, itemIndex) =>
                        itemIndex === index ? { ...item, priceDelta: Number(event.target.value) } : item,
                      ),
                    )
                  }
                  placeholder="اختلاف قیمت"
                  className={field}
                />
                <input
                  type="number"
                  value={variant.stock}
                  onChange={(event) =>
                    setVariants((current) =>
                      current.map((item, itemIndex) => (itemIndex === index ? { ...item, stock: Number(event.target.value) } : item)),
                    )
                  }
                  placeholder="موجودی"
                  className={field}
                />
                <button
                  type="button"
                  onClick={() => setVariants((current) => current.filter((_, itemIndex) => itemIndex !== index))}
                  className="rounded-xl border border-border text-muted-foreground hover:border-sale hover:text-sale"
                  aria-label="حذف تنوع"
                >
                  <Trash2 className="mx-auto size-4" aria-hidden />
                </button>
              </div>
            ))}
            <p className="text-[10px] leading-5 text-muted-foreground">
              اگر محصول در دستهٔ لباس است، برای هر سایز و رنگ یک ردیف بسازید؛ مشتری هنگام سفارش باید سایز را انتخاب کند.
            </p>
          </section>
        </div>

        <aside className="h-fit space-y-3 rounded-3xl border border-border bg-card p-5">
          <h2 className="text-xs font-extrabold text-foreground">قیمت، موجودی و تخفیف</h2>

          <div>
            <span className={label}>قیمت (تومان)</span>
            <input type="number" value={price} onChange={(event) => setPrice(Number(event.target.value))} className={field} />
            <p className="mt-1 text-[10px] text-muted-foreground">{formatToman(price)}</p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className={label}>موجودی</span>
              <input type="number" value={stock} onChange={(event) => setStock(Number(event.target.value))} className={field} />
            </div>
            <div>
              <span className={label}>وزن (گرم)</span>
              <input
                type="number"
                value={weightGrams}
                onChange={(event) => setWeightGrams(Number(event.target.value))}
                className={field}
              />
            </div>
            <div>
              <span className={label}>تخفیف ساده (%)</span>
              <input
                type="number"
                min={0}
                max={90}
                value={discountPercent}
                onChange={(event) => setDiscountPercent(Number(event.target.value))}
                className={field}
              />
            </div>
            <div>
              <span className={label}>تخفیف زمان‌دار (%)</span>
              <input
                type="number"
                min={0}
                max={90}
                value={salePercent}
                onChange={(event) => setSalePercent(Number(event.target.value))}
                className={field}
              />
            </div>
          </div>

          <div>
            <span className={label}>پایان تخفیف زمان‌دار</span>
            <input type="date" value={saleEndsAt} onChange={(event) => setSaleEndsAt(event.target.value)} className={field} />
          </div>

          <div>
            <span className={label}>برچسب روی کارت</span>
            <input value={badge} onChange={(event) => setBadge(event.target.value)} placeholder="مانند پرفروش" className={field} />
          </div>

          <div className="space-y-2 pt-1 text-[11px]">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={isActive} onChange={(event) => setIsActive(event.target.checked)} className="size-4 accent-[var(--color-brand)]" />
              نمایش در فروشگاه
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={isFeatured} onChange={(event) => setIsFeatured(event.target.checked)} className="size-4 accent-[var(--color-brand)]" />
              نمایش در محصولات ویژهٔ صفحهٔ اول
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={madeInWorkshop}
                onChange={(event) => setMadeInWorkshop(event.target.checked)}
                className="size-4 accent-[var(--color-brand)]"
              />
              تولید کارگاه خودمان
            </label>
          </div>
        </aside>
      </div>
    </form>
  );
}
