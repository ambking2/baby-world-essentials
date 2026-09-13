import { useMutation } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Search, Sparkles } from "lucide-react";
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
    <aside className="space-y-6 lg:sticky lg:top-24">
      {onSearchChange ? (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            onSearchSubmit?.();
          }}
          className="card-soft flex items-center gap-2 rounded-lg p-3"
        >
          <Search className="ms-1 size-4 shrink-0 text-outline" aria-hidden />
          <input
            value={search ?? ""}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="جستجو در مقاله‌ها…"
            className="w-full bg-transparent text-sm text-on-surface outline-none placeholder:text-outline-variant"
          />
        </form>
      ) : null}

      <section className="card-soft rounded-lg p-5">
        <h2 className="font-label-md text-label-md mb-4 font-bold text-on-surface">آخرین مطالب</h2>
        <div className="space-y-3">
          {recent.map((post) => (
            <Link
              key={post.slug}
              to="/blog/$slug"
              params={{ slug: post.slug }}
              className="flex items-center gap-3 rounded-lg bg-surface-container-low p-2.5 transition-colors hover:bg-primary-fixed/50"
            >
              <img src={post.cover ?? "/images/workshop.jpg"} alt={post.title} className="size-16 shrink-0 rounded-lg object-cover" />
              <div className="min-w-0">
                <p className="line-clamp-2 text-[12px] font-bold leading-6 text-on-surface">{post.title}</p>
                <p className="mt-1 text-[10px] text-on-surface-variant">{post.publishedAt ? formatJalali(post.publishedAt) : "—"}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {tags.length > 0 ? (
        <section className="card-soft rounded-lg p-5">
          <h2 className="font-label-md text-label-md mb-4 font-bold text-on-surface">برچسب‌ها</h2>
          <div className="flex flex-wrap gap-2">
            {tags.map((item) => {
              const active = activeTag === item.tag;
              return (
                <button
                  key={item.tag}
                  type="button"
                  onClick={() => onTagSelect?.(active ? undefined : item.tag)}
                  className={`rounded-full px-3 py-1.5 text-[11px] font-bold transition-colors ${
                    active
                      ? "bg-primary text-on-primary shadow-md shadow-primary/20"
                      : "bg-surface-container-low text-on-surface-variant hover:bg-primary-fixed hover:text-primary"
                  }`}
                >
                  {item.tag} ({toFaDigits(item.postCount)})
                </button>
              );
            })}
          </div>
        </section>
      ) : null}

      <section className="rounded-lg bg-gradient-to-br from-primary to-primary-container p-6 text-on-primary">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-[11px] font-bold backdrop-blur-md">
          <Sparkles className="size-3.5" aria-hidden />
          خبرنامهٔ جهان کودک
        </div>
        <h2 className="font-headline-sm text-headline-sm mt-3 font-bold">مقاله و تخفیف را یک‌جا بگیرید</h2>
        <p className="mt-2 text-[12px] leading-6 text-white/85">راهنمای خرید سیسمونی و خبر تخفیف‌ها را ایمیل می‌کنیم.</p>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            subscribe.mutate();
          }}
          className="mt-4 space-y-2"
        >
          <input
            required
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="ایمیل شما"
            dir="ltr"
            className="w-full rounded-full border-0 bg-white px-4 py-3 text-xs text-on-surface outline-none"
          />
          <button
            type="submit"
            disabled={subscribe.isPending}
            className="w-full rounded-full bg-white px-4 py-3 text-[12px] font-bold text-primary shadow-sm transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-60"
          >
            عضویت در خبرنامه
          </button>
        </form>
      </section>

      <section className="card-soft rounded-lg p-5 text-[12px] leading-6 text-on-surface-variant">
        <h2 className="font-label-md text-label-md mb-2 font-bold text-on-surface">مشاورهٔ خرید</h2>
        <p>تلفن فروشگاه: {business.phoneDisplay}</p>
        <p>{business.hoursFull}</p>
        <p>{business.addressLine}</p>
      </section>
    </aside>
  );
}
