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
    <article className="reveal group overflow-hidden rounded-xl border border-surface-container-high bg-surface-container-lowest shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(0,75,209,0.12)]">
      <Link to="/blog/$slug" params={{ slug: post.slug }} className="block overflow-hidden">
        <div className="relative aspect-[16/10] overflow-hidden">
          <img
            src={post.cover ?? "/images/hero-nursery.jpg"}
            alt={post.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          {post.tag ? (
            <span className="absolute right-3 top-3 rounded-full bg-surface-container-lowest/90 px-3 py-1 text-[11px] font-bold text-primary shadow-sm backdrop-blur-sm">
              {post.tag}
            </span>
          ) : null}
        </div>
      </Link>

      <div className="space-y-3 p-card-padding">
        <h3 className="font-headline-sm text-headline-sm line-clamp-2 leading-8 text-on-surface transition-colors group-hover:text-primary">
          <Link to="/blog/$slug" params={{ slug: post.slug }}>
            {post.title}
          </Link>
        </h3>

        {post.excerpt ? <p className="line-clamp-2 text-[13px] leading-7 text-on-surface-variant">{post.excerpt}</p> : null}

        <div className="flex flex-wrap items-center gap-3 border-t border-surface-container-low pt-3 text-[11px] text-on-surface-variant">
          <span className="inline-flex items-center gap-1">
            <CalendarDays className="size-3.5" aria-hidden />
            {post.publishedAt ? formatJalali(post.publishedAt) : "—"}
          </span>
          <span className="inline-flex items-center gap-1">
            <MessageCircle className="size-3.5" aria-hidden />
            {toFaDigits(post.commentCount)} دیدگاه
          </span>
          <Link
            to="/blog/$slug"
            params={{ slug: post.slug }}
            className="ms-auto inline-flex items-center gap-1 font-bold text-primary transition-transform group-hover:-translate-x-1"
          >
            ادامه مطلب
            <ArrowUpLeft className="size-3.5" aria-hidden />
          </Link>
        </div>
      </div>
    </article>
  );
}
