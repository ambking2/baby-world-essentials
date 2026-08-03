import { createFileRoute } from "@tanstack/react-router";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { toast } from "sonner";

import { SiteLayout } from "@/components/site/SiteLayout";
import { PageHeader } from "@/components/site/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toFaDigits } from "@/lib/format";

const title = "تماس با فروشگاه جهان کودک ابهر";
const description =
  "آدرس، تلفن و ساعت کار فروشگاه جهان کودک در ابهر؛ برای مشاوره خرید سیسمونی و سفارش سرویس خواب تماس بگیرید.";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://baby-world-essentials.lovable.app/contact" },
    ],
    links: [{ rel: "canonical", href: "https://baby-world-essentials.lovable.app/contact" }],
  }),
  component: ContactPage,
  errorComponent: ({ error }) => (
    <div role="alert" className="container-page py-20 text-center text-sm">
      {error.message}
    </div>
  ),
  notFoundComponent: () => <div className="container-page py-20 text-center">یافت نشد</div>,
});

function ContactPage() {
  return (
    <SiteLayout>
      <PageHeader
        title="تماس با ما"
        description="برای موجودی، سفارش سرویس خواب یا پیگیری ارسال تماس بگیرید."
        crumbs={[{ label: "تماس" }]}
      />

      <div className="container-page grid gap-8 py-10 lg:grid-cols-2">
        <div>
          <ul className="flex flex-col gap-4 text-sm">
            <li className="flex gap-3">
              <MapPin className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
              <span>
                زنجان، ابهر، خیابان طالقانی، روبه‌روی بانک ملت، پلاک {toFaDigits(142)}
              </span>
            </li>
            <li className="flex gap-3">
              <Phone className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
              <a href="tel:+982435223344">{toFaDigits("024-35223344")}</a>
            </li>
            <li className="flex gap-3">
              <Mail className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
              info@jahankoodak.ir
            </li>
            <li className="flex gap-3">
              <Clock className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
              شنبه تا پنجشنبه {toFaDigits("۹:۰۰")} تا {toFaDigits("۲۱:۰۰")} — جمعه‌ها تعطیل
            </li>
          </ul>

          <iframe
            title="نقشه محل فروشگاه جهان کودک در ابهر"
            src="https://www.openstreetmap.org/export/embed.html?bbox=49.19%2C36.13%2C49.24%2C36.16&layer=mapnik"
            className="mt-6 h-72 w-full rounded-2xl border border-border"
            loading="lazy"
          />
        </div>

        <form
          className="rounded-2xl border border-border bg-card p-6"
          onSubmit={(e) => {
            e.preventDefault();
            toast.success("پیام شما ثبت شد؛ همان روز کاری تماس می‌گیریم");
          }}
        >
          <p className="text-sm font-bold text-foreground">فرم تماس</p>
          <div className="mt-5 flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">نام و نام خانوادگی</Label>
              <Input id="name" name="name" required placeholder="مریم رحیمی" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="phone">شماره موبایل</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                inputMode="numeric"
                required
                pattern="[0-9۰-۹]{11}"
                placeholder="۰۹۱۲۳۴۵۶۷۸۹"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="message">پیام شما</Label>
              <Textarea id="message" name="message" required rows={5} placeholder="سؤال یا سفارش شما" />
            </div>
            <Button type="submit" className="rounded-full">
              ارسال پیام
            </Button>
          </div>
        </form>
      </div>
    </SiteLayout>
  );
}
