import type { Product } from "@/types/catalog";
import { ProductCard } from "@/components/site/ProductCard";

export function ProductGrid({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-secondary/40 p-10 text-center">
        <p className="text-sm font-medium text-foreground">فعلاً کالایی در این بخش نداریم</p>
        <p className="mt-1 text-xs text-muted-foreground">
          برای موجودی جدید با فروشگاه تماس بگیرید: ۰۲۴-۳۵۲۲۳۳۴۴
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:gap-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
