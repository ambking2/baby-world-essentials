import { createFileRoute, Link } from "@tanstack/react-router";
import { Award, Hammer, Store, Truck } from "lucide-react";

import { Breadcrumb } from "@/components/store/Breadcrumb";
import { StoreShell } from "@/components/store/StoreShell";
import { TrustBadges } from "@/components/store/TrustBadges";
import { business, yearsInBusiness } from "@/data/business";
import { useReveal } from "@/hooks/use-reveal";
import { toFaDigits } from "@/lib/format";

export const Route = createFileRoute("/about")({
  component: AboutPage,
});

const PILLARS = [
  {
    icon: Store,
    title: "فروشگاه حقیقی در ابهر",
    text: "می‌توانید حضوری کالا را ببینید، لمس کنید و با مشاوره خرید کنید.",
  },
  {
    icon: Hammer,
    title: "تولید در کارگاه خودمان",
    text: "سرویس خواب و دراور را با چوب سالم و رنگ بی‌خطر می‌سازیم.",
  },
  {
    icon: Award,
    title: `گارانتی ${toFaDigits(business.structureWarrantyMonths)} ماههٔ سازه`,
    text: "خدمات پس از فروش و تعویض قطعات در همان فروشگاه.",
  },
  {
    icon: Truck,
    title: "ارسال به همهٔ ایران",
    text: "نصب رایگان در ابهر و شهرهای اطراف، ارسال باباری به دیگر شهرها.",
  },
] as const;

function AboutPage() {
  const containerRef = useReveal<HTMLDivElement>();

  return (
    <StoreShell>
      <div className="container-page py-6" ref={containerRef}>
        <Breadcrumb items={[{ title: "دربارهٔ ما" }]} />

        <section className="reveal grid gap-5 overflow-hidden rounded-3xl border border-border bg-card p-6 lg:grid-cols-2">
          <div className="space-y-3">
            <h1 className="text-xl font-extrabold leading-8 text-foreground">{business.name}</h1>
            <p className="text-xs leading-7 text-muted-foreground">
              از سال {toFaDigits(business.foundedJalali)} در {business.city} کنار خانواده‌هایی هستیم که برای اولین بار سیسمونی خرید می‌کنند.
              در این {toFaDigits(yearsInBusiness)} سال، هم کارگاه تولید سرویس خواب راه انداختیم و هم مجموعه‌ای از معتبرترین
              برندهای کالسکه، شیردهی و پوشاک نوزاد را گرد آوردیم.
            </p>
            <p className="text-xs leading-7 text-muted-foreground">
              مدیریت: {business.manager} · تلفن مشاوره: {business.phoneDisplay}
              <br />
              نشانی: {business.addressLine}
              <br />
              ساعات کاری: {business.hoursFull}
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <Link to="/stores" className="rounded-full bg-brand px-5 py-2.5 text-xs font-bold text-primary-foreground">
                مسیر فروشگاه
              </Link>
              <Link
                to="/contact"
                className="rounded-full border border-border px-5 py-2.5 text-xs font-bold transition-colors hover:border-brand hover:text-brand"
              >
                تماس با ما
              </Link>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <img src="/images/hero-nursery.jpg" alt="اتاق نوزاد" className="h-40 w-full rounded-2xl object-cover sm:h-full" />
            <img src="/images/workshop.jpg" alt="کارگاه تولید" className="h-40 w-full rounded-2xl object-cover sm:h-full" />
          </div>
        </section>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {PILLARS.map((pillar) => (
            <div key={pillar.title} className="reveal card-hover rounded-3xl border border-border bg-card p-5">
              <span className="grid size-10 place-items-center rounded-2xl bg-brand-soft text-brand">
                <pillar.icon className="size-5" aria-hidden />
              </span>
              <h2 className="mt-3 text-xs font-extrabold text-foreground">{pillar.title}</h2>
              <p className="mt-1 text-[11px] leading-6 text-muted-foreground">{pillar.text}</p>
            </div>
          ))}
        </div>

        <div className="mt-5">
          <TrustBadges />
        </div>
      </div>
    </StoreShell>
  );
}
