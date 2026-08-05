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
    <aside className="space-y-4">
      {onSearchChange ? (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            onSearchSubmit?.();
          }}
          className="storybook-panel flex items-center gap-2 p-3"
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

      <section className="storybook-panel p-4">
        <h2 className="mb-3 text-sm font-black text-foreground">آخرین مطالب</h2>
        <div className="space-y-3">
          {recent.map((post) => (
            <Link
              key={post.slug}
              to="/blog/$slug"
              params={{ slug: post.slug }}
              className="flex items-center gap-3 rounded-[1.3rem] border border-white/70 bg-white/75 p-2.5 shadow-soft transition-colors hover:text-brand"
            >
              <img src={post.cover ?? "/images/workshop.jpg"} alt={post.title} className="size-16 rounded-[1rem] object-cover" />
              <div className="min-w-0">
                <p className="line-clamp-2 text-[11px] font-bold leading-6">{post.title}</p>
                <p className="mt-1 text-[10px] text-muted-foreground">{post.publishedAt ? formatJalali(post.publishedAt) : "—"}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {tags.length > 0 ? (
        <section className="storybook-panel p-4">
          <h2 className="mb-3 text-sm font-black text-foreground">برچسب‌ها</h2>
          <div className="flex flex-wrap gap-2">
            {tags.map((item) => {
              const active = activeTag === item.tag;
              return (
                <button
                  key={item.tag}
                  type="button"
                  onClick={() => onTagSelect?.(active ? undefined : item.tag)}
                  className={`rounded-full border px-3 py-1.5 text-[10px] font-extrabold transition-colors ${
                    active ? "border-brand bg-gradient-to-r from-brand to-sale text-primary-foreground" : "border-white/80 bg-white/80 text-muted-foreground hover:border-brand hover:text-brand"
                  }`}
                >
                  {item.tag} ({toFaDigits(item.postCount)})
                </button>
              );
            })}
          </div>
        </section>
      ) : null}

      <section className="storybook-panel p-5">
        <div className="inline-flex items-center gap-2 rounded-full bg-brand-soft px-3 py-1 text-[11px] font-extrabold text-brand">
          <Sparkles className="size-3.5" aria-hidden />
          خبرنامهٔ جهان کودک
        </div>
        <h2 className="mt-3 text-sm font-black text-foreground">مقاله و تخفیف را یک‌جا بگیرید</h2>
        <p className="mt-2 text-[11px] leading-6 text-muted-foreground">راهنمای خرید سیسمونی و خبر تخفیف‌ها را ایمیل می‌کنیم.</p>
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
            className="w-full rounded-full border border-white/80 bg-white px-4 py-3 text-xs outline-none focus:border-brand"
          />
          <button
            type="submit"
            disabled={subscribe.isPending}
            className="toy-button w-full rounded-full bg-gradient-to-r from-brand to-sale px-4 py-3 text-[11px] font-extrabold text-primary-foreground disabled:opacity-60"
          >
            عضویت در خبرنامه
          </button>
        </form>
      </section>

      <section className="storybook-panel p-4 text-[11px] leading-6 text-muted-foreground">
        <h2 className="mb-2 text-sm font-black text-foreground">مشاورهٔ خرید</h2>
        <p>تلفن فروشگاه: {business.phoneDisplay}</p>
        <p>{business.hoursFull}</p>
        <p>{business.addressLine}</p>
      </section>
    </aside>
  );
}
