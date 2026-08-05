import { createFileRoute } from "@tanstack/react-router";
import { Clock, MapPin, Navigation, Phone } from "lucide-react";

import { Breadcrumb } from "@/components/store/Breadcrumb";
import { StoreShell } from "@/components/store/StoreShell";
import { business, serviceAreas } from "@/data/business";

export const Route = createFileRoute("/stores")({
  component: StoresPage,
});

const PAD = 0.01;

function StoresPage() {
  const lat = business.geo.lat;
  const lng = business.geo.lng;

  const mapUrl = "https://www.google.com/maps/search/?api=1&query=" + lat + "," + lng;

  const bbox = [lng - PAD, lat - PAD, lng + PAD, lat + PAD].join("%2C");
  const embedUrl =
    "https://www.openstreetmap.org/export/embed.html?bbox=" +
    bbox +
    "&layer=mapnik&marker=" +
    lat +
    "%2C" +
    lng;

  return (
    <StoreShell>
      <div className="container-page py-6">
        <Breadcrumb items={[{ title: "فروشگاه و محدودهٔ خدمات" }]} />

        <div className="grid gap-5 lg:grid-cols-[380px_1fr]">
          <div className="space-y-4">
            <div className="rounded-3xl border border-border bg-card p-6">
              <h1 className="text-lg font-extrabold text-foreground">
                {business.shortName} — شعبهٔ {business.city}
              </h1>
              <div className="mt-3 space-y-2 text-xs leading-7 text-muted-foreground">
                <p className="flex items-start gap-2">
                  <MapPin className="mt-1 size-4 text-brand" aria-hidden />
                  {business.addressLine}
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="size-4 text-brand" aria-hidden />
                  <a href={business.phoneHref} className="hover:text-brand">
                    {business.phoneDisplay}
                  </a>
                </p>
                <p className="flex items-center gap-2">
                  <Clock className="size-4 text-brand" aria-hidden />
                  {business.hoursFull}
                </p>
              </div>

              <a
                href={mapUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-xs font-bold text-primary-foreground"
              >
                <Navigation className="size-4" aria-hidden />
                مسیریابی تا فروشگاه
              </a>
            </div>

            <div className="rounded-3xl border border-border bg-card p-6">
              <h2 className="text-sm font-extrabold text-foreground">محدودهٔ تحویل و نصب</h2>
              <div className="mt-3 space-y-3">
                {serviceAreas.map((area) => (
                  <div key={area.title} className="rounded-2xl bg-secondary p-3 text-[11px] leading-6">
                    <p className="font-extrabold text-foreground">{area.title}</p>
                    <p className="text-muted-foreground">{area.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl border border-border bg-card">
            <iframe
              title="نقشهٔ فروشگاه جهان کودک"
              src={embedUrl}
              className="h-[420px] w-full border-0"
              loading="lazy"
            />
            <div className="p-4 text-[11px] leading-6 text-muted-foreground">
              برای دیدن حضوری سرویس خواب و کالسکه، قبل از مراجعه تماس بگیرید تا مدل مورد نظر برایتان آماده باشد.
            </div>
          </div>
        </div>
      </div>
    </StoreShell>
  );
}
