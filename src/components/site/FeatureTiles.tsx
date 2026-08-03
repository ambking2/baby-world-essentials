import { HandHeart, RotateCcw, Truck } from "lucide-react";

const tiles = [
  {
    icon: HandHeart,
    title: "ساخت کارگاه خودمان",
    text: "سرویس خواب و دراور را در کارگاه ابهر با چوب راش می‌سازیم؛ ۱۸ ماه ضمانت.",
    className: "bg-sale text-sale-foreground",
  },
  {
    icon: Truck,
    title: "ارسال سریع",
    text: "ابهر و زنجان تحویل رایگان، سایر شهرها با باربری و پست پیشتاز.",
    className: "bg-primary text-primary-foreground",
  },
  {
    icon: RotateCcw,
    title: "مرجوعی ۷ روزه",
    text: "کالای پلمب و استفاده‌نشده تا ۷ روز بدون دلیل قابل بازگشت است.",
    className: "bg-muted-foreground/25 text-foreground",
  },
];

export function FeatureTiles() {
  return (
    <section className="container-page -mt-2 grid gap-3 py-6 md:grid-cols-3 md:gap-5 md:py-8">
      {tiles.map((t) => (
        <div key={t.title} className={`flex gap-3 rounded-2xl p-5 ${t.className}`}>
          <t.icon className="mt-0.5 size-7 shrink-0" aria-hidden="true" />
          <div>
            <h2 className="text-sm font-black">{t.title}</h2>
            <p className="mt-1.5 text-xs leading-6 opacity-90">{t.text}</p>
          </div>
        </div>
      ))}
    </section>
  );
}
