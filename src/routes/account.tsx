import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import {
  ChevronLeft,
  Heart,
  Headset,
  LogOut,
  MapPin,
  Package,
  Smile,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";

import { StoreShell, storeKeys } from "@/components/store/StoreShell";
import { business } from "@/data/business";
import { logoutUser } from "@/server/functions/auth";
import { getSession } from "@/server/functions/auth";

export const Route = createFileRoute("/account")({
  component: AccountLayout,
});

const NAV = [
  { to: "/account", label: "پروفایل من", icon: UserRound, exact: true },
  { to: "/account/orders", label: "سفارش‌ها و رهگیری", icon: Package, exact: false },
  { to: "/account/addresses", label: "نشانی‌ها", icon: MapPin, exact: false },
  { to: "/account/wishlist", label: "علاقه‌مندی‌ها", icon: Heart, exact: false },
] as const;

function AccountLayout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const sessionQuery = useQuery({ queryKey: storeKeys.session, queryFn: () => getSession() });

  const logout = useMutation({
    mutationFn: () => logoutUser(),
    onSuccess: () => {
      toast.success("از حساب خود خارج شدید.");
      void queryClient.invalidateQueries({ queryKey: storeKeys.session });
      void navigate({ to: "/" });
    },
  });

  const user = sessionQuery.data?.user ?? null;

  if (!sessionQuery.isLoading && !user) {
    return (
      <StoreShell>
        <div className="container-page py-20 text-center">
          <div className="card-soft mx-auto max-w-md rounded-xl p-10">
            <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-full bg-primary-fixed text-primary">
              <UserRound className="size-8" />
            </div>
            <h1 className="font-headline-sm text-headline-sm mb-2 font-bold">برای دیدن پنل کاربری وارد شوید</h1>
            <p className="mb-6 text-sm text-on-surface-variant">اطلاعات حساب، سفارش‌ها و نشانی‌های شما پس از ورود در دسترس است.</p>
            <Link
              to="/auth/login"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-primary-container px-8 py-3 text-sm font-bold text-on-primary shadow-lg shadow-primary/25"
            >
              ورود به حساب
            </Link>
          </div>
        </div>
      </StoreShell>
    );
  }

  return (
    <StoreShell>
      <div className="container-page grow py-8">
        {/* Greeting ribbon */}
        <div className="mb-8 flex flex-col justify-between gap-4 rounded-lg border border-primary/10 bg-surface-container-low/70 p-6 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <span className="flex size-14 items-center justify-center rounded-full bg-primary-container text-on-primary shadow-lg shadow-primary/25">
              <Smile className="size-7" />
            </span>
            <div>
              <h1 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                {user?.name ? `${user.name} عزیز،` : "خوش آمدید،"}
              </h1>
              <p className="text-[13px] text-on-surface-variant">به پنل کاربری جهان کودک خوش آمدید.</p>
            </div>
          </div>
          <div className="text-[12px] text-on-surface-variant">
            پشتیبانی: <span className="font-bold text-primary" dir="ltr">{business.phoneDisplay}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 items-start gap-gutter lg:grid-cols-12">
          {/* Sidebar */}
          <aside className="space-y-6 lg:col-span-4">
            {/* Profile card */}
            <div className="card-soft relative overflow-hidden rounded-lg p-card-padding text-center">
              <div className="pointer-events-none absolute -top-8 -right-8 size-28 rounded-full bg-primary-fixed/40 blur-2xl" />
              <div className="pointer-events-none absolute -bottom-10 -left-10 size-32 rounded-full bg-secondary-fixed/40 blur-2xl" />
              <div className="relative">
                <div className="relative mx-auto mb-3">
                  <span className="grid size-24 place-items-center rounded-full border-2 border-primary bg-primary-fixed text-3xl font-black text-primary">
                    {(user?.name ?? user?.email ?? "ک")[0]}
                  </span>
                  <span className="absolute bottom-0 right-0 flex size-7 items-center justify-center rounded-full border-2 border-surface-container-lowest bg-emerald-500 text-white">
                    <UserRound className="size-3.5" />
                  </span>
                </div>
                <p className="font-headline-sm text-headline-sm font-bold text-on-surface">{user?.name ?? "کاربر جهان کودک"}</p>
                <p className="mt-1 text-[12px] text-on-surface-variant" dir="ltr">{user?.email}</p>
              </div>
            </div>

            {/* Nav menu */}
            <nav className="card-soft rounded-lg p-2">
              {NAV.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  activeOptions={{ exact: item.exact }}
                  className="flex items-center justify-between rounded px-4 py-3.5 text-[13px] font-bold text-on-surface-variant transition-colors hover:bg-surface-container-low data-[status=active]:bg-primary/10 data-[status=active]:font-bold data-[status=active]:text-primary"
                >
                  <span className="flex items-center gap-3">
                    <item.icon className="size-4" aria-hidden />
                    {item.label}
                  </span>
                  <ChevronLeft className="size-4 opacity-40" aria-hidden />
                </Link>
              ))}
              <button
                type="button"
                onClick={() => logout.mutate()}
                className="flex w-full items-center gap-3 rounded px-4 py-3.5 text-[13px] font-bold text-destructive transition-colors hover:bg-error-container/50"
              >
                <LogOut className="size-4" aria-hidden />
                خروج از حساب
              </button>
            </nav>

            {/* Support widget */}
            <div className="flex gap-3 rounded-lg border border-primary/10 bg-surface-container p-5">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-on-primary">
                <Headset className="size-5" />
              </span>
              <div>
                <p className="text-[13px] font-bold text-on-surface">نیاز به کمک دارید؟</p>
                <p className="mt-1 text-[12px] leading-5 text-on-surface-variant">
                  کارشناسان ما {business.hoursShort} پاسخ‌گو هستند.
                </p>
                <Link to="/contact" className="mt-2 inline-block text-[12px] font-bold text-primary hover:underline">
                  تماس با پشتیبانی
                </Link>
              </div>
            </div>
          </aside>

          {/* Content */}
          <div className="min-w-0 space-y-8 lg:col-span-8">
            <Outlet />
          </div>
        </div>
      </div>
    </StoreShell>
  );
}
