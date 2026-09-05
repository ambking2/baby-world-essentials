import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { Heart, LogOut, MapPin, Package, UserRound } from "lucide-react";
import { toast } from "sonner";

import { StoreShell, storeKeys } from "@/components/store/StoreShell";
import { logoutUser } from "@/server/functions/auth";
import { getSession } from "@/server/functions/auth";

export const Route = createFileRoute("/account")({
  component: AccountLayout,
});

const NAV = [
  { to: "/account", label: "پروفایل من", icon: UserRound },
  { to: "/account/orders", label: "سفارش‌های من", icon: Package },
  { to: "/account/addresses", label: "نشانی‌ها", icon: MapPin },
  { to: "/account/wishlist", label: "علاقه‌مندی‌ها", icon: Heart },
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
          <h1 className="text-lg font-extrabold">برای دیدن پنل کاربری وارد شوید</h1>
          <Link to="/auth/login" className="mt-4 inline-flex rounded-full bg-brand px-5 py-2.5 text-xs font-bold text-primary-foreground">
            ورود به حساب
          </Link>
        </div>
      </StoreShell>
    );
  }

  return (
    <StoreShell>
      <div className="container-page grid gap-5 py-8 lg:grid-cols-[240px_1fr]">
        <aside className="h-fit space-y-2 rounded-3xl border border-border bg-card p-4">
          <div className="rounded-2xl bg-brand-soft/60 p-3">
            <p className="text-xs font-extrabold text-foreground">{user?.name ?? "کاربر جهان کودک"}</p>
            <p className="mt-1 text-[11px] text-muted-foreground" dir="ltr">
              {user?.email ?? ""}
            </p>
          </div>

          <nav className="space-y-1">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.to === "/account" }}
                activeProps={{ className: "bg-brand text-primary-foreground" }}
                inactiveProps={{ className: "text-muted-foreground hover:bg-secondary" }}
                className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-bold transition-colors"
              >
                <item.icon className="size-4" aria-hidden />
                {item.label}
              </Link>
            ))}
          </nav>

          <button
            type="button"
            onClick={() => logout.mutate()}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-bold text-muted-foreground transition-colors hover:bg-secondary hover:text-sale"
          >
            <LogOut className="size-4" aria-hidden />
            خروج از حساب
          </button>
        </aside>

        <div className="min-w-0">
          <Outlet />
        </div>
      </div>
    </StoreShell>
  );
}
