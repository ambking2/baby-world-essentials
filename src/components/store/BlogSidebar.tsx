import { useMutation } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { business } from "@/data/business";
import { formatJalali, toFaDigits } from "@/lib/format";
import { joinNewsletter } from "@/server/functions/catalog";

export type SidebarPost = {
  slug: string;
  title: string;
  cover: string | null;
  publishedAt: string | null;
};

export function BlogSidebar({
  recent,
  tags,
  search,
  onSearchChange,
  onSearchSubmit,
  activeTag,
  onTagSelect,
}: {
  recent: Array<SidebarPost>;
  tags: Array<{ tag: string; postCount: number }>;
  search?: string;
  onSearchChange?: (value: string) => void;
  onSearchSubmit?: () => void;
  activeTag?: string;
  onTagSelect?: (tag: string | undefined) => void;
}) {
  const [email, setEmail] = useState("");

  const subscribe = useMutation({
    mutationFn: () => joinNewsletter({ data: { email } }),
    onSuccess: () => {
      toast.success("ایمیل شما ثبت شد؛ از تخفیف‌ها باخبر می‌شوید.");
      setEmail("");
    },
    onError: () => toast.error("ثبت ایمیل انجام نشد."),
  });

  return (
    <aside className="space-y-4">
      {onSearchChange ? (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            onSearchSubmit?.();
          }}
          className="flex items-center gap-2 rounded-2xl border border-border bg-card p-2"
        >
          <Search className="ms-1 size-4 text-muted-foreground" aria-hidden />
          <input
            value={search ?? ""}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="جستجو در مقاله‌ها…"
            className="w-full bg-transparent text-xs outline-none"
          />
        </form>
      ) : null}

      <section className="rounded-3xl border border-border bg-card p-4">
        <h2 className="mb-3 text-xs font-extrabold text-foreground">آخرین مطالب</h2>
        <div className="space-y-3">
          {recent.map((post) => (
            <Link
              key={post.slug}
              to="/blog/$slug"
              params={{ slug: post.slug }}
              className="flex items-center gap-3 transition-colors hover:text-brand"
            >
              <img src={post.cover ?? "/images/workshop.jpg"} alt={post.title} className="size-14 rounded-xl object-cover" />
              <div className="min-w-0">
                <p className="line-clamp-2 text-[11px] font-bold leading-5">{post.title}</p>
                <p className="mt-1 text-[10px] text-muted-foreground">{post.publishedAt ? formatJalali(post.publishedAt) : "—"}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {tags.length > 0 ? (
        <section className="rounded-3xl border border-border bg-card p-4">
          <h2 className="mb-3 text-xs font-extrabold text-foreground">برچسب‌ها</h2>
          <div className="flex flex-wrap gap-2">
            {tags.map((item) => {
              const active = activeTag === item.tag;
              return (
                <button
                  key={item.tag}
                  type="button"
                  onClick={() => onTagSelect?.(active ? undefined : item.tag)}
                  className={`rounded-full border px-3 py-1.5 text-[10px] font-bold transition-colors ${
                    active ? "border-brand bg-brand text-primary-foreground" : "border-border text-muted-foreground hover:border-brand hover:text-brand"
                  }`}
                >
                  {item.tag} ({toFaDigits(item.postCount)})
                </button>
              );
            })}
          </div>
        </section>
      ) : null}

      <section className="rounded-3xl border border-border bg-brand-soft/50 p-4">
        <h2 className="text-xs font-extrabold text-foreground">خبرنامهٔ جهان کودک</h2>
        <p className="mt-1 text-[11px] leading-6 text-muted-foreground">تخفیف‌ها و راهنمای خرید سیسمونی را ایمیل می‌کنیم.</p>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            subscribe.mutate();
          }}
          className="mt-3 space-y-2"
        >
          <input
            required
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="ایمیل شما"
            dir="ltr"
            className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-xs outline-none focus:border-brand"
          />
          <button
            type="submit"
            disabled={subscribe.isPending}
            className="w-full rounded-full bg-brand px-4 py-2.5 text-[11px] font-bold text-primary-foreground disabled:opacity-60"
          >
            عضویت در خبرنامه
          </button>
        </form>
      </section>

      <section className="rounded-3xl border border-border bg-card p-4 text-[11px] leading-6 text-muted-foreground">
        <h2 className="mb-2 text-xs font-extrabold text-foreground">مشاورهٔ خرید</h2>
        <p>تلفن فروشگاه: {business.phoneDisplay}</p>
        <p>{business.hoursFull}</p>
        <p>{business.addressLine}</p>
      </section>
    </aside>
  );
}
