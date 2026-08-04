import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import {
  BadgePercent,
  FolderTree,
  LayoutDashboard,
  MessagesSquare,
  Newspaper,
  Package,
  Settings,
  ShoppingBag,
  Users,
} from "lucide-react";

import { storeKeys } from "@/components/store/StoreShell";
import { business } from "@/data/business";
import { getSession } from "@/server/functions/auth";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

const ADMIN_NAV = [
  { to: "/admin", label: "داشبورد", icon: LayoutDashboard, exact: true },
  { to: "/admin/products", label: "محصولات", icon: Package, exact: false },
  { to: "/admin/categories", label: "دسته‌بندی‌ها", icon: FolderTree, exact: false },
  { to: "/admin/orders", label: "سفارش‌ها", icon: ShoppingBag, exact: false },
  { to: "/admin/coupons", label: "کدهای تخفیف", icon: BadgePercent, exact: false },
  { to: "/admin/posts", label: "مقاله‌ها", icon: Newspaper, exact: false },
  { to: "/admin/comments", label: "دیدگاه‌ها و نقدها", icon: MessagesSquare, exact: false },
  { to: "/admin/customers", label: "مشتریان و پیام‌ها", icon: Users, exact: false },
  { to: "/admin/settings", label: "تنطیمات", icon: Settings, exact: false },
] as const;

function AdminLayout() {
  const sessionQuery = useQuery({ queryKey: storeKeys.session, queryFn: () => getSession() });
  const user = sessionQuery.data?.user ?? null;
  const isAdmin = user?.role === "admin";

  if (sessionQuery.isLoading) {
    return (
      <div className="container-page py-16">
        <div className="skeleton h-40 rounded-3xl" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container-page py-20 text-center">
        <h1 className="text-lg font-extrabold text-foreground">دسترسی محدود به مدیر فروشگاه است</h1>
        <p className="mt-2 text-xs text-muted-foreground">با حساب مدیر وارد شوید تا پنل نمایش داده شود.</p>
        <div className="mt-4 flex justify-center gap-2">
          <Link to="/auth/login" className="rounded-full bg-brand px-5 py-2.5 text-xs font-bold text-primary-foreground">
            ورود مدیر
          </Link>
          <Link to="/" className="rounded-full border border-border px-5 py-2.5 text-xs font-bold hover:border-brand hover:text-brand">
            بازگشت به فروشگاه
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/40">
      <div className="mx-auto flex max-w-[100rem] gap-4 p-4">
        <aside className="sticky top-4 hidden h-fit w-56 shrink-0 space-y-3 rounded-3xl border border-border bg-card p-4 lg:block">
          <div className="rounded-2xl bg-brand-soft/60 p-3">
            <p className="text-xs font-extrabold text-foreground">پنل مدیریت</p>
            <p className="mt-1 text-[10px] text-muted-foreground">{business.name}</p>
          </div>

          <nav className="space-y-1">
            {ADMIN_NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.exact }}
                activeProps={{ className: "bg-brand text-primary-foreground" }}
                inactiveProps={{ className: "text-muted-foreground hover:bg-secondary" }}
                className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-[11px] font-bold transition-colors"
              >
                <item.icon className="size-4" aria-hidden />
                {item.label}
              </Link>
            ))}
          </nav>

          <Link to="/" className="block rounded-xl border border-border px-3 py-2.5 text-center text-[11px] font-bold text-muted-foreground hover:border-brand hover:text-brand">
            مشاهدهٔ سایت
          </Link>
        </aside>

        <main className="min-w-0 flex-1 space-y-4">
          <div className="flex flex-wrap gap-2 rounded-3xl border border-border bg-card p-3 lg:hidden">
            {ADMIN_NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.exact }}
                activeProps={{ className: "bg-brand text-primary-foreground" }}
                inactiveProps={{ className: "text-muted-foreground" }}
                className="rounded-full border border-border px-3 py-1.5 text-[10px] font-bold"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <Outlet />
        </main>
      </div>
    </div>
  );
}
