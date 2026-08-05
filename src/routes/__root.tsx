import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import { Toaster } from "@/components/ui/sonner";
import { business } from "@/data/business";
import appCss from "../styles.css?url";
import storeCss from "../styles/store.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <p className="text-7xl font-extrabold text-brand">۴۰۴</p>
        <h1 className="mt-4 text-xl font-bold text-foreground">این صفحه پیدا نشد</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          شاید نشانی را اشتباه وارد کرده‌اید یا این محصول جمع‌آوری شده است.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            بازگشت به صفحهٔ اول
          </Link>
          <a
            href={business.phoneHref}
            className="inline-flex items-center justify-center rounded-full border border-input bg-background px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-accent/10"
          >
            تماس با فروشگاه
          </a>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-bold tracking-tight text-foreground">/skill:redesign ری دیزاین کن طبق عکس هایی که فرستادم</h1>
        <p className="mt-2 text-sm text-muted-foreground whitespace-pre-line">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-input bg-background px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-accent/10"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: `${business.name} | فروشگاه اینترنتی سیسمونی و لوازم نوزاد` },
      {
        name: "description",
        content: `خرید اینترنتی سیسمونی نوزاد: تخت و سرویس خواب، لباس، کالسکه، اسباب‌بازی و لوازم شیردهی. ارسال به سراسر ایران و تحویل حضوری در ${business.city}.`,
      },
      { name: "theme-color", content: "#f6efe9" },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: business.name },
      { property: "og:locale", content: "fa_IR" },
      { property: "og:image", content: business.ogImage },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;600;700;800&display=swap",
      },
      { rel: "stylesheet", href: appCss },
      { rel: "stylesheet", href: storeCss },
      { rel: "icon", href: "/favicon.ico" },
    ],
  }),

  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Toaster position="top-center" dir="rtl" />
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
    </QueryClientProvider>
  );
}
