import { Link } from "@tanstack/react-router";
import { ArrowUpLeft, CalendarDays, MessageCircle } from "lucide-react";

import { formatJalali, toFaDigits } from "@/lib/format";

export type BlogCardData = {
  slug: string;
  title: string;
  excerpt: string | null;
  cover: string | null;
  tag: string | null;
  author: string;
  publishedAt: string | null;
  commentCount: number;
};

export function BlogCard({ post }: { post: BlogCardData }) {
  return (
    <article className="reveal card-hover storybook-panel p-2">
      <Link to="/blog/$slug" params={{ slug: post.slug }} className="group block overflow-hidden rounded-[1.7rem]">
        <div className="relative overflow-hidden rounded-[1.7rem]">
          <img
            src={post.cover ?? "/images/hero-nursery.jpg"}
            alt={post.title}
            loading="lazy"
            className="h-52 w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/65 via-charcoal/10 to-transparent" />
          {post.tag ? (
            <span className="absolute start-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[10px] font-extrabold text-brand shadow-soft">
              {post.tag}
            </span>
          ) : null}
        </div>
      </Link>

      <div className="space-y-3 px-3 pb-3 pt-4">
        <h3 className="line-clamp-2 text-base font-black leading-7 text-foreground">
          <Link to="/blog/$slug" params={{ slug: post.slug }} className="transition-colors hover:text-brand">
            {post.title}
          </Link>
        </h3>

        {post.excerpt ? <p className="line-clamp-3 text-[11px] leading-7 text-muted-foreground">{post.excerpt}</p> : null}

        <div className="flex flex-wrap items-center gap-3 rounded-[1.2rem] border border-white/70 bg-white/75 px-3 py-2 text-[10px] text-muted-foreground shadow-soft">
          <span className="inline-flex items-center gap-1">
            <CalendarDays className="size-3" aria-hidden />
            {post.publishedAt ? formatJalali(post.publishedAt) : "—"}
          </span>
          <span className="inline-flex items-center gap-1">
            <MessageCircle className="size-3" aria-hidden />
            {toFaDigits(post.commentCount)} دیدگاه
          </span>
          <Link to="/blog/$slug" params={{ slug: post.slug }} className="ms-auto inline-flex items-center gap-1 font-extrabold text-brand">
            ادامه مطلب
            <ArrowUpLeft className="size-3.5" aria-hidden />
          </Link>
        </div>
      </div>
    </article>
  );
}
