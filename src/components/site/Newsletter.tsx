import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Newsletter() {
  return (
    <section className="relative mt-14 bg-primary text-primary-foreground">
      <div className="cloud-top" aria-hidden="true" />
      <div className="container-page grid items-center gap-6 py-16 md:grid-cols-2">
        <div>
          <h2 className="text-xl font-black md:text-2xl">از تخفیف‌های فروشگاه باخبر شوید</h2>
          <p className="mt-2 text-sm text-white/85">
            هر دو هفته یک پیام: کالاهای تازه‌رسیده و قیمت‌های ویژه. بدون تبلیغات اضافه.
          </p>
        </div>
        <form
          className="flex flex-col gap-3 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            toast.success("شماره شما ثبت شد");
          }}
        >
          <label htmlFor="newsletter-phone" className="sr-only">
            شماره موبایل
          </label>
          <Input
            id="newsletter-phone"
            name="phone"
            type="tel"
            inputMode="numeric"
            required
            placeholder="۰۹۱۲۳۴۵۶۷۸۹"
            className="h-12 rounded-full border-transparent bg-background text-foreground"
          />
          <Button type="submit" size="lg" variant="secondary" className="rounded-full px-8">
            ثبت شماره
          </Button>
        </form>
      </div>
    </section>
  );
}
