import { useState } from "react";
import { Heart, Minus, Plus, ShoppingCart, Truck, RotateCcw, ShieldCheck, Headset } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { formatToman, toFaDigits } from "@/lib/format";
import { discountPercent, type ProductWithDetail } from "@/types/catalog";

const benefits = [
  { icon: ShieldCheck, title: "ضمانت اصالت کالا", note: "فاکتور رسمی فروشگاه" },
  { icon: Truck, title: "ارسال سریع", note: "ابهر و زنجان ۲۴ ساعته" },
  { icon: Headset, title: "پشتیبانی", note: "شنبه تا پنجشنبه، ۹ تا ۲۱" },
  { icon: RotateCcw, title: "امکان مرجوعی", note: "تا ۷ روز پس از تحویل" },
];

export function ProductPurchase({ product }: { product: ProductWithDetail }) {
  const [qty, setQty] = useState(1);
  const off = discountPercent(product);
  const outOfStock = product.stock <= 0;
  const max = Math.max(product.stock, 1);

  function addToCart() {
    toast.success("به سبد اضافه شد", {
      description: `${product.title} — ${toFaDigits(qty)} عدد`,
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="border border-border bg-card p-4">
        {product.oldPrice ? (
          <div className="flex items-center gap-2">
            <span className="text-[13px] text-muted-foreground line-through">
              {formatToman(product.oldPrice)} تومان
            </span>
            <span className="bg-sale px-1.5 py-0.5 text-[11px] font-bold text-sale-foreground">
              ٪{toFaDigits(off)}
            </span>
          </div>
        ) : null}
        <div className="mt-1 flex items-baseline gap-1.5">
          <span className="text-2xl font-bold text-foreground">{formatToman(product.price)}</span>
          <span className="text-xs text-muted-foreground">تومان</span>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <span className="text-[13px] text-muted-foreground">تعداد</span>
          <div className="flex items-center border border-border">
            <button
              type="button"
              aria-label="کاهش تعداد"
              disabled={outOfStock || qty <= 1}
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="grid size-9 place-items-center text-foreground disabled:text-muted-foreground/50"
            >
              <Minus className="size-4" aria-hidden="true" />
            </button>
            <span className="w-10 text-center text-sm font-medium text-foreground">
              {toFaDigits(qty)}
            </span>
            <button
              type="button"
              aria-label="افزایش تعداد"
              disabled={outOfStock || qty >= max}
              onClick={() => setQty((q) => Math.min(max, q + 1))}
              className="grid size-9 place-items-center text-foreground disabled:text-muted-foreground/50"
            >
              <Plus className="size-4" aria-hidden="true" />
            </button>
          </div>
          {!outOfStock && product.stock <= 4 ? (
            <span className="text-xs font-medium text-sale">
              تنها {toFaDigits(product.stock)} عدد در انبار
            </span>
          ) : null}
        </div>

        <div className="mt-4 grid gap-2">
          <Button className="w-full rounded-md" disabled={outOfStock} onClick={addToCart}>
            <ShoppingCart data-icon="inline-start" aria-hidden="true" />
            {outOfStock ? "ناموجود" : "افزودن به سبد"}
          </Button>
          <div className="grid grid-cols-[1fr_auto] gap-2">
            <Button
              variant="outline"
              className="w-full rounded-md"
              disabled={outOfStock}
              onClick={() => toast("در حال انتقال به پرداخت", { description: "ثبت سفارش تلفنی: ۰۲۴-۳۵۲۲-۳۳۴۴" })}
            >
              خرید و پرداخت
            </Button>
            <Button
              variant="outline"
              size="icon"
              aria-label="افزودن به علاقه‌مندی‌ها"
              className="rounded-md"
              onClick={() => toast("به علاقه‌مندی‌ها اضافه شد")}
            >
              <Heart className="size-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </div>

      <ul className="divide-y divide-border border border-border bg-card">
        {benefits.map(({ icon: Icon, title, note }) => (
          <li key={title} className="flex items-center gap-3 px-4 py-3">
            <Icon className="size-5 shrink-0 text-primary" aria-hidden="true" />
            <div className="min-w-0">
              <p className="text-[13px] font-medium text-foreground">{title}</p>
              <p className="text-[11px] text-muted-foreground">{note}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
