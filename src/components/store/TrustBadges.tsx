import { BadgeCheck, Headphones, RefreshCcw, Truck, Wallet } from "lucide-react";

import { business } from "@/data/business";
import { formatToman, toFaDigits } from "@/lib/format";

const ICONS = { truck: Truck, refresh: RefreshCcw, badge: BadgeCheck, wallet: Wallet, support: Headphones } as const;

type Badge = { icon: keyof typeof ICONS; title: string; body: string };

export function TrustBadges() {
  const badges: Array<Badge> = [
    {
      icon: "truck",
      title: "ارسال رایگان",
      body: `برای خرید بالای ${formatToman(business.freeShippingThreshold)}`,
    },
    {
      icon: "refresh",
      title: "مردودی آسان",
      body: `تا ${toFaDigits(business.returnWindowDays)} روز پس از تحویل`,
    },
    {
      icon: "badge",
      title: "ضمانت سازه",
      body: `${toFaDigits(business.structureWarrantyMonths)} ماه برای تولیدات کارگاه`,
    },
    {
      icon: "wallet",
      title: "پرداخت منعطف",
      body: "پرداخت در محل یا کارت‌به‌کارت با تأیید رسید",
    },
    {
      icon: "support",
      title: "مشاورهٔ واقعی",
      body: business.hoursShort,
    },
  ];

  return (
    <div className="container-page py-12 lg:py-24 border-y border-border">
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
        {badges.map((badge) => {
          const Icon = ICONS[badge.icon];
          return (
            <div
              key={badge.title}
              className="group flex flex-col items-center text-center lg:items-start lg:text-start"
            >
              <div className="mb-4 flex size-10 items-center justify-center rounded-full bg-secondary transition-colors group-hover:bg-primary/10">
                <Icon className="size-5 text-primary" aria-hidden />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-foreground">{badge.title}</h3>
              <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">{badge.body}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
