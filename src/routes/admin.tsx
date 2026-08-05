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
  const isAuthorized = user?.role === "admin" || user?.role === "sales";

  if (sessionQuery.isLoading) {
    return (
      <div className="container-page py-16">
        <div className="skeleton h-40 rounded-3xl" />
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="container-page py-20 text-center">
        <h1 className="text-lg font-extrabold text-foreground">دسترسی محدود به مدیر یا کارشناس فروشگاه است</h1>
        <p className="mt-2 text-xs text-muted-foreground">با حساب مناسب وارد شوید تا پنل نمایش داده شود.</p>
        <div className="mt-4 flex justify-center gap-2">
          <Link to="/auth/login" className="rounded-full bg-primary px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-primary/95 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 outline-none transition-all">
            ورود مدیر / کارشناس
          </Link>
          <Link to="/" className="rounded-full border border-border px-5 py-2.5 text-xs font-bold hover:border-primary hover:text-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 outline-none transition-all">
            بازگشت به فروشگاه
          </Link>
        </div>
      </div>
    );
  }

  const roleNav = ADMIN_NAV.filter(item => {
    if (user?.role === "admin") return true;
    // Sales role restrictions
    const salesAllowed = ["داشبورد", "محصولات", "سفارش‌ها", "دیدگاه‌ها و نقدها", "مشتریان و پیام‌ها"];
    return salesAllowed.includes(item.label);
  });

  return (
    <div className="min-h-screen bg-secondary/40">
      <div className="mx-auto flex max-w-[100rem] gap-4 p-4">
        <aside className="sticky top-4 hidden h-fit w-56 shrink-0 space-y-3 rounded-3xl border border-border bg-card p-4 lg:block">
          <div className="rounded-2xl bg-secondary p-3">
            <p className="text-xs font-extrabold text-foreground">پنل مدیریت</p>
            <p className="mt-1 text-[10px] text-muted-foreground">{business.name}</p>
          </div>

          <nav className="space-y-1">
            {roleNav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.exact }}
                activeProps={{ className: "bg-primary text-white shadow-sm" }}
                inactiveProps={{ className: "text-muted-foreground hover:bg-secondary/60 hover:text-foreground" }}
                className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-[11px] font-bold transition-all focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 outline-none"
              >
                <item.icon className="size-4" aria-hidden />
                {item.label}
              </Link>
            ))}
          </nav>

          <Link to="/" className="block rounded-xl border border-border px-3 py-2.5 text-center text-[11px] font-bold text-muted-foreground hover:border-primary hover:text-primary transition-all focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 outline-none">
            مشاهدهٔ سایت
          </Link>
        </aside>

        <main className="min-w-0 flex-1 space-y-4">
          <div className="rounded-3xl border border-border bg-card p-3 lg:hidden">
            <div className="flex flex-wrap gap-2">
              {roleNav.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  activeOptions={{ exact: item.exact }}
                  activeProps={{ className: "bg-primary text-white shadow-sm" }}
                  inactiveProps={{ className: "text-muted-foreground" }}
                  className="rounded-full border border-border px-3 py-1.5 text-[10px] font-bold transition-all focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 outline-none"
                >
                  {item.label}
                </Link>
              ))}
            </div>
            
            <div className="mt-3 border-t border-border/50 pt-3">
              <Link 
                to="/" 
                className="flex items-center justify-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-3 py-2.5 text-[11px] font-bold text-primary transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 outline-none"
              >
                <ShoppingBag className="size-3.5" />
                مشاهدهٔ سایت
              </Link>
            </div>
          </div>

          <Outlet />
        </main>
      </div>
    </div>
  );
}
