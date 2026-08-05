import { BadgeCheck, Headphones, RefreshCcw, Truck, Wallet } from "lucide-react";

import { business } from "@/data/business";
import { formatToman, toFaDigits } from "@/lib/format";
import { useReveal } from "@/hooks/use-reveal";

const ICONS = { truck: Truck, refresh: RefreshCcw, badge: BadgeCheck, wallet: Wallet, support: Headphones } as const;

type Badge = { icon: keyof typeof ICONS; title: string; body: string; tone: string };

export function TrustBadges() {
  const containerRef = useReveal<HTMLDivElement>({ stagger: 60 });

  const badges: Array<Badge> = [
    {
      icon: "truck",
      title: "ارسال رایگان",
      body: `برای خرید بالای ${formatToman(business.freeShippingThreshold)}`,
      tone: "from-[#ffe7d6] to-[#fff6ef]",
    },
    {
      icon: "refresh",
      title: "مردودی آسان",
      body: `تا ${toFaDigits(business.returnWindowDays)} روز پس از تحویل`,
      tone: "from-[#ffe8ef] to-[#fff7fa]",
    },
    {
      icon: "badge",
      title: "ضمانت سازه",
      body: `${toFaDigits(business.structureWarrantyMonths)} ماه برای تولیدات کارگاه`,
      tone: "from-[#e8f4ff] to-[#f8fbff]",
    },
    {
      icon: "wallet",
      title: "پرداخت منعطف",
      body: "پرداخت در محل یا کارت‌به‌کارت با تأیید رسید",
      tone: "from-[#fff3db] to-[#fffbf3]",
    },
    {
      icon: "support",
      title: "مشاورهٔ واقعی",
      body: business.hoursShort,
      tone: "from-[#e9fff5] to-[#f8fffc]",
    },
  ];

  return (
    <div ref={containerRef} className="container-page">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        {badges.map((badge) => {
          const Icon = ICONS[badge.icon];
          return (
            <div
              key={badge.title}
              className={`reveal rounded-[2.5rem] border border-white/80 bg-gradient-to-br ${badge.tone} p-5 shadow-soft transition-all duration-500 hover:shadow-lift hover:-translate-y-1`}
            >
              <span className="mb-4 grid size-12 place-items-center rounded-[1.3rem] bg-white/85 text-brand shadow-soft">
                <Icon className="size-5" aria-hidden />
              </span>
              <h3 className="text-sm font-extrabold text-foreground">{badge.title}</h3>
              <p className="mt-1 text-[11px] leading-6 text-muted-foreground">{badge.body}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
