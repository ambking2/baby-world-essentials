import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "@tanstack/react-router";
import { LayoutDashboard, ShoppingBag } from "lucide-react";

import { getSession } from "@/server/functions/auth";
import { storeKeys } from "./StoreShell";

export function AdminFloatingButton() {
  const location = useLocation();
  const sessionQuery = useQuery({ 
    queryKey: storeKeys.session, 
    queryFn: () => getSession(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const user = sessionQuery.data?.user;
  const isStaff = user?.role === "admin" || user?.role === "sales";
  
  const isAdminPath = location.pathname.startsWith("/admin");

  // Only show floating button for staff
  if (!isStaff) return null;

  const targetPath = isAdminPath ? "/" : "/admin";
  const label = isAdminPath ? "مشاهده سایت" : "پنل مدیریت";
  const Icon = isAdminPath ? ShoppingBag : LayoutDashboard;

  return (
    <Link
      to={targetPath}
      className="fixed bottom-6 right-6 z-[100] flex items-center gap-2 rounded-full bg-primary px-5 py-3.5 text-xs font-bold text-white shadow-[0_20px_50px_rgba(79,111,82,0.3)] ring-4 ring-white transition-all hover:scale-105 active:scale-95 focus-visible:ring-primary focus-visible:ring-offset-2 outline-none group"
      title={label}
    >
      <Icon className="size-4 transition-transform group-hover:rotate-12" />
      <span className="hidden sm:inline">{label}</span>
    </Link>
  );
}
