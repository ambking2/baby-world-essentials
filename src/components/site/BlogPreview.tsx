import { useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

import { SectionHeading } from "@/components/site/SectionHeading";
import { postsQuery } from "@/lib/api/catalog";
import { toFaDigits } from "@/lib/format";

export function BlogPreview() {
  const { data: posts } = useSuspenseQuery(postsQuery());
  const list = posts.slice(0, 3);
  if (list.length === 0) return null;

  return (
    <section className="bg-secondary/60 py-12 md:py-16">
      <div className="container-page">
        <SectionHeading eyebrow="راهنمای خرید" title="از وبلاگ فروشگاه" />

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {list.map((post) => (
            <article
              key={post.slug}
              className="flex h-full flex-col rounded-2xl bg-card p-5 shadow-soft"
            >
              <span className="grid size-12 place-items-center rounded-2xl bg-primary text-center text-[11px] font-black leading-tight text-primary-foreground">
                {post.date.slice(-5)}
              </span>
              <h3 className="mt-4 text-sm font-black leading-7 text-foreground">
                <Link
                  to="/blog/$slug"
                  params={{ slug: post.slug }}
                  className="hover:text-primary"
                >
                  {post.title}
                </Link>
              </h3>
              <p className="mt-2 line-clamp-3 text-xs leading-7 text-muted-foreground">
                {post.excerpt}
              </p>
              <p className="mt-3 text-[11px] text-muted-foreground">
                {post.author} · {toFaDigits(post.readMinutes)} دقیقه مطالعه
              </p>
            </article>
          ))}
        </div>

        <div className="mt-7 text-center">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 rounded-full bg-foreground py-2.5 ps-6 pe-2.5 text-xs font-bold text-background hover:opacity-90"
          >
            همه مطلب‌ها
            <span className="grid size-7 place-items-center rounded-full bg-primary text-primary-foreground">
              <ArrowLeft className="size-4" aria-hidden="true" />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
