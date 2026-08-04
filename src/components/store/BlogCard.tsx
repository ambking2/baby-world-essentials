import { Link } from "@tanstack/react-router";
import { CalendarDays, MessageCircle } from "lucide-react";

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
    <article className="reveal card-hover overflow-hidden rounded-3xl border border-border bg-card">
      <Link to="/blog/$slug" params={{ slug: post.slug }} className="block overflow-hidden">
        <img
          src={post.cover ?? "/images/hero-nursery.jpg"}
          alt={post.title}
          loading="lazy"
          className="h-44 w-full object-cover transition-transform duration-500 hover:scale-105"
        />
      </Link>

      <div className="space-y-2 p-4">
        {post.tag ? (
          <span className="inline-flex rounded-full bg-brand-soft px-3 py-1 text-[10px] font-bold text-brand">{post.tag}</span>
        ) : null}

        <h3 className="line-clamp-2 text-sm font-extrabold leading-6 text-foreground">
          <Link to="/blog/$slug" params={{ slug: post.slug }} className="transition-colors hover:text-brand">
            {post.title}
          </Link>
        </h3>

        {post.excerpt ? <p className="line-clamp-2 text-[11px] leading-6 text-muted-foreground">{post.excerpt}</p> : null}

        <div className="flex items-center gap-3 pt-1 text-[10px] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <CalendarDays className="size-3" aria-hidden />
            {post.publishedAt ? formatJalali(post.publishedAt) : "—"}
          </span>
          <span className="inline-flex items-center gap-1">
            <MessageCircle className="size-3" aria-hidden />
            {toFaDigits(post.commentCount)} دیدگاه
          </span>
        </div>
      </div>
    </article>
  );
}
