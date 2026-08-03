import { createFileRoute } from "@tanstack/react-router";

import { SiteLayout } from "@/components/site/SiteLayout";
import { PageHeader } from "@/components/site/PageHeader";
import { TrustSection } from "@/components/site/TrustSection";
import workshop from "@/assets/workshop.jpg";
import { toFaDigits } from "@/lib/format";

const title = "درباره فروشگاه جهان کودک ابهر";
const description =
  "فروشگاه سیسمونی جهان کودک از سال ۱۳۹۲ در ابهر فعال است؛ سرویس خواب چوبی را در کارگاه خودمان می‌سازیم و بقیه کالاها را مستقیم تهیه می‌کنیم.";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://baby-world-essentials.lovable.app/about" },
    ],
    links: [{ rel: "canonical", href: "https://baby-world-essentials.lovable.app/about" }],
  }),
  component: AboutPage,
  errorComponent: ({ error }) => (
    <div role="alert" className="container-page py-20 text-center text-sm">
      {error.message}
    </div>
  ),
  notFoundComponent: () => <div className="container-page py-20 text-center">یافت نشد</div>,
});

function AboutPage() {
  return (
    <SiteLayout>
      <PageHeader
        title="درباره جهان کودک"
        description="یک فروشگاه محلی در ابهر که کارگاه ساخت مبلمان کودک هم دارد."
        crumbs={[{ label: "درباره ما" }]}
      />

      <div className="container-page grid items-start gap-8 py-10 md:grid-cols-2">
        <div className="flex flex-col gap-4 text-[15px] leading-8 text-foreground/85">
          <p>
            کار ما سال {toFaDigits(1392)} با یک مغازه کوچک در خیابان طالقانی ابهر شروع شد. آن موقع
            فقط پوشاک و لوازم جانبی نوزاد می‌فروختیم.
          </p>
          <p>
            از سال {toFaDigits(1396)} کارگاه نجاری راه انداختیم و سرویس خواب، دراور و تعویض‌کن را
            خودمان می‌سازیم. بدنه‌ها از چوب راش است، رنگ‌ها پایه آب و بدون بو، و ابعاد را می‌توانید
            سفارشی بدهید.
          </p>
          <p>
            بقیه کالاها — کالسکه، لوازم تغذیه و اسباب‌بازی — را مستقیم از واردکننده می‌گیریم تا قیمت
            برای مشتری منطقی بماند. برای همه سفارش‌ها فاکتور رسمی صادر می‌کنیم.
          </p>
          <p>
            امکان پرداخت تا شش قسط ماهیانه بدون بهره برای خرید بالای {toFaDigits("۵٬۰۰۰٬۰۰۰")} تومان
            وجود دارد؛ تسویه با چک یا اقساط کارت‌به‌کارت انجام می‌شود.
          </p>
          <p className="text-sm text-muted-foreground">مدیریت فروشگاه: آقای عسگری</p>
        </div>

        <img
          src={workshop}
          alt="کارگاه نجاری فروشگاه جهان کودک"
          width={1024}
          height={768}
          loading="lazy"
          className="w-full rounded-2xl object-cover"
        />
      </div>

      <TrustSection />
    </SiteLayout>
  );
}
