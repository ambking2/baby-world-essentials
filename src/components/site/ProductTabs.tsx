import { Star } from "lucide-react";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toFaDigits } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ProductWithDetail } from "@/types/catalog";

function Stars({ value }: { value: number }) {
  return (
    <span className="flex items-center gap-0.5" aria-label={`${toFaDigits(value)} از ۵`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={cn("size-3.5", i <= Math.round(value) ? "fill-clay text-clay" : "text-border")}
          aria-hidden="true"
        />
      ))}
    </span>
  );
}

export function ProductTabs({ product }: { product: ProductWithDetail }) {
  const { detail } = product;

  return (
    <section className="border border-border bg-card">
      <Tabs defaultValue="desc" dir="rtl">
        <TabsList className="h-auto w-full justify-start gap-0 overflow-x-auto rounded-none border-b border-border bg-secondary p-0">
          {[
            ["desc", "توضیحات محصول"],
            ["specs", "مشخصات فنی"],
            ["reviews", `نظرات کاربران (${toFaDigits(product.reviewCount)})`],
            ["faq", "سوالات متداول"],
          ].map(([value, label]) => (
            <TabsTrigger
              key={value}
              value={value!}
              className="rounded-none border-b-2 border-transparent px-4 py-3 text-[13px] font-medium text-muted-foreground data-[state=active]:border-primary data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-none"
            >
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="desc" className="m-0 p-5">
          <div className="max-w-3xl space-y-3">
            {detail.description.map((paragraph) => (
              <p key={paragraph} className="text-[13px] leading-7 text-foreground">
                {paragraph}
              </p>
            ))}
            <ul className="mt-4 space-y-1.5 border-t border-border pt-4">
              {detail.highlights.map((item) => (
                <li key={item} className="flex gap-2 text-[13px] leading-6 text-muted-foreground">
                  <span className="mt-2.5 size-1.5 shrink-0 bg-primary" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </TabsContent>

        <TabsContent value="specs" className="m-0 p-5">
          <table className="w-full max-w-3xl border-collapse text-[13px]">
            <tbody>
              <tr className="border-b border-border">
                <th scope="row" className="w-40 bg-secondary px-3 py-2.5 text-start font-medium text-muted-foreground">
                  کد کالا
                </th>
                <td className="px-3 py-2.5 text-foreground">{detail.sku}</td>
              </tr>
              <tr className="border-b border-border">
                <th scope="row" className="w-40 bg-secondary px-3 py-2.5 text-start font-medium text-muted-foreground">
                  برند
                </th>
                <td className="px-3 py-2.5 text-foreground">{product.brand}</td>
              </tr>
              {detail.specs.map((spec) => (
                <tr key={spec.label} className="border-b border-border last:border-b-0">
                  <th
                    scope="row"
                    className="w-40 bg-secondary px-3 py-2.5 text-start font-medium text-muted-foreground"
                  >
                    {spec.label}
                  </th>
                  <td className="px-3 py-2.5 text-foreground">{spec.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TabsContent>

        <TabsContent value="reviews" className="m-0 p-5">
          <div className="mb-4 flex flex-wrap items-center gap-4 border border-border bg-secondary px-4 py-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-foreground">
                {toFaDigits(product.rating.toFixed(1))}
              </span>
              <span className="text-xs text-muted-foreground">از ۵</span>
            </div>
            <Stars value={product.rating} />
            <span className="text-xs text-muted-foreground">
              بر پایه {toFaDigits(product.reviewCount)} نظر ثبت‌شده
            </span>
          </div>

          <ul className="space-y-3">
            {detail.reviews.map((review) => (
              <li key={review.id} className="border border-border p-4">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="text-[13px] font-medium text-foreground">{review.author}</span>
                  <span className="text-[11px] text-muted-foreground">{review.city}</span>
                  {review.verified ? (
                    <span className="bg-primary/10 px-1.5 py-0.5 text-[11px] text-primary">
                      خرید تأییدشده
                    </span>
                  ) : null}
                  <span className="ms-auto text-[11px] text-muted-foreground">{review.date}</span>
                </div>
                <div className="mt-2">
                  <Stars value={review.rating} />
                </div>
                <p className="mt-2 text-[13px] leading-7 text-foreground">{review.body}</p>
              </li>
            ))}
          </ul>
        </TabsContent>

        <TabsContent value="faq" className="m-0 p-5">
          <Accordion type="single" collapsible className="max-w-3xl">
            {detail.faqs.map((faq) => (
              <AccordionItem key={faq.q} value={faq.q} className="border-border">
                <AccordionTrigger className="text-start text-[13px] font-medium text-foreground hover:no-underline">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-[13px] leading-7 text-muted-foreground">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </TabsContent>
      </Tabs>
    </section>
  );
}
