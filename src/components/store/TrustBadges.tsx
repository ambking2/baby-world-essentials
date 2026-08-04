import { BadgeCheck, Headphones, RefreshCcw, Truck, Wallet } from "lucide-react";

import { business } from "@/data/business";
import { formatToman, toFaDigits } from "@/lib/format";
import { useReveal } from "@/hooks/use-reveal";

const ICONS = { truck: Truck, refresh: RefreshCcw, badge: BadgeCheck, wallet: Wallet, support: Headphones } as const;

type Badge = { icon: keyof typeof ICONS; title: string; body: string };

/** نوار اعتمادسازی زیر اسلایدر صفحهٔ اول. */
export function TrustBadges() {
  const containerRef = useReveal<HTMLDivElement>({ stagger: 60 });

  const badges: Array<Badge> = [
    { icon: "truck", title: "ارسال رایگان", body: `برای خرید بالای ${formatToman(business.freeShippingThreshold)}` },
    { icon: "refresh", title: "مردودی آسان", body: `تا ${toFaDigits(business.returnWindowDays)} روز پس از تحویل` },
    { icon: "badge", title: "ضمانت سازه", body: `${toFaDigits(business.structureWarrantyMonths)} ماه برای تولیدات کارگاه` },
    { icon: "wallet", title: "پرداخت در محل", body: "یا کارت‌به‌کارت با تأیید رسید" },
    { icon: "support", title: "مشاورهٔ خرید", body: business.hoursShort },
  ];

  return (
    <div ref={containerRef} className="container-page">
      <div className="grid grid-cols-2 gap-3 rounded-3xl border border-border bg-card p-4 md:grid-cols-5">
        {badges.map((badge) => {
          const Icon = ICONS[badge.icon];
          return (
            <div key={badge.title} className="reveal flex items-center gap-3">
              <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-brand-soft text-brand">
                <Icon className="size-5" aria-hidden />
              </span>
              <span className="leading-tight">
                <span className="block text-xs font-extrabold text-foreground">{badge.title}</span>
                <span className="block text-[11px] text-muted-foreground">{badge.body}</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
