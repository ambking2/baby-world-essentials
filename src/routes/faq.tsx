import { createFileRoute, Link } from "@tanstack/react-router";

import { Breadcrumb } from "@/components/store/Breadcrumb";
import { StoreShell } from "@/components/store/StoreShell";
import { business } from "@/data/business";
import { toFaDigits } from "@/lib/format";

export const Route = createFileRoute("/faq")({
  component: FaqPage,
});

const FAQS = [
  {
    q: "روش پرداخت چگونه است؟",
    a: "دو روش فعال است: کارت‌به‌کارت (پس از ثبت سفارش، شمارهٔ کارت نمایش داده می‌شود و رسید را در همان صفحه ثبت می‌کنید) و پرداخت در محل هنگام تحویل.",
  },
  {
    q: "هزینهٔ ارسال چقدر است؟",
    a: `سفارش‌های بالای پنج میلیون تومان ارسال رایگان دارند؛ در غیر این صورت کرایهٔ ثابت محاسبه می‌شود. در ${business.localCities.join("، ")} نصب رایگان است.`,
  },
  {
    q: "گارانتی محصولات چند ماه است؟",
    a: `سازهٔ سرویس خواب و دراور تولید کارگاه خودمان ${toFaDigits(business.structureWarrantyMonths)} ماه گارانتی دارد. کالاهای برندی طبق گارانتی نمایندگی رسمی پشتیبانی می‌شوند.`,
  },
  {
    q: "امکان مرجوع کردن کالا وجود دارد؟",
    a: `تا ${toFaDigits(business.returnWindowDays)} روز پس از تحویل، در صورت سالم بودن بسته‌بندی و استفاده نشدن کالا، مرجوع یا تعویض انجام می‌شود. پوشاک زیر و محصولات بهداشتی مستثنا هستند.`,
  },
  {
    q: "سفارش ساخت با طرح و رنگ دلخواه ممکن است؟",
    a: `بله. زمان ساخت معمولاً ${business.customBuildDays} است. برای هماهنگی طرح، رنگ و ابعاد با ${business.phoneDisplay} تماس بگیرید.`,
  },
  {
    q: "سایز پوشاک را چگونه انتخاب کنم؟",
    a: "در صفحهٔ محصولات پوشاک، انتخاب سایز و رنگ اجباری است و راهنمای سایز بر اساس ماه تولد نوزاد نمایش داده می‌شود.",
  },
] as const;

function FaqPage() {
  return (
    <StoreShell>
      <div className="container-page py-6">
        <Breadcrumb items={[{ title: "پرسش‌های پرتکرار" }]} />

        <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
          <div className="space-y-3">
            <h1 className="text-lg font-extrabold text-foreground">پرسش‌های پرتکرار</h1>
            {FAQS.map((item) => (
              <details key={item.q} className="group rounded-3xl border border-border bg-card p-4">
                <summary className="cursor-pointer list-none text-xs font-extrabold text-foreground group-open:text-brand">
                  {item.q}
                </summary>
                <p className="mt-2 text-[11px] leading-7 text-muted-foreground">{item.a}</p>
              </details>
            ))}
          </div>

          <aside className="h-fit space-y-3 rounded-3xl border border-border bg-brand-soft/50 p-5 text-xs leading-7">
            <h2 className="text-sm font-extrabold text-foreground">جوابتان را پیدا نکردید؟</h2>
            <p className="text-muted-foreground">مشاوران فروشگاه در ساعات {business.hoursShort} پاسخگوی شما هستند.</p>
            <a href={business.phoneHref} className="inline-flex rounded-full bg-brand px-5 py-2.5 text-xs font-bold text-primary-foreground">
              تماس با {business.phoneDisplay}
            </a>
            <Link to="/contact" className="block text-[11px] font-bold text-brand hover:underline">
              یا پیام متنی بفرستید
            </Link>
          </aside>
        </div>
      </div>
    </StoreShell>
  );
}
