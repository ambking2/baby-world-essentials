import { featuredProducts } from "@/data/catalog";
import { ProductCard } from "@/components/site/ProductCard";

export function FeaturedProducts() {
  return (
    <section id="featured" className="scroll-mt-28 border-y border-border bg-sand/60 py-14 md:py-20">
      <div className="container-page">
        <h2 className="text-xl font-bold md:text-2xl">پرفروش‌های این ماه</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          قیمت‌ها برای خرید حضوری و تلفنی یکسان است. موجودی را پیش از مراجعه تلفنی بپرسید.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featuredProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
