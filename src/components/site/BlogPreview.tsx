import { useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Clock } from "lucide-react";

import { SectionHeading } from "@/components/store/SectionHeading";
import { postsQuery } from "@/lib/api/catalog";
import { toFaDigits } from "@/lib/format";

export function BlogPreview() {
  const { data: posts } = useSuspenseQuery(postsQuery());
  const list = posts.slice(0, 3);
  if (list.length === 0) return null;

  return (
    <div className="grid gap-16 md:grid-cols-3">
      {list.map((post) => (
        <article key={post.slug} className="group flex flex-col">
          <Link
            to="/blog/$slug"
            params={{ slug: post.slug }}
            className="relative mb-6 block aspect-[16/10] overflow-hidden bg-muted/20 rounded-2xl border border-border/50 shadow-sm"
          >
            <img 
              src={(post as any).cover ?? "/images/cat-clothing.jpg"} 
              alt={post.title} 
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" 
            />
          </Link>

          <div className="flex items-center gap-4 mb-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary">آموزشی</span>
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase tracking-widest">
              <Clock className="size-3" />
              <span>{toFaDigits(post.readMinutes)} دقیقه مطالعه</span>
            </div>
          </div>

          <h3 className="mb-4 text-xl font-bold leading-tight">
            <Link
              to="/blog/$slug"
              params={{ slug: post.slug }}
              className="transition-colors hover:text-primary"
            >
              {post.title}
            </Link>
          </h3>
          
          <p className="mb-6 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
            {post.excerpt}
          </p>
          
          <Link
            to="/blog/$slug"
            params={{ slug: post.slug }}
            className="group mt-auto flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-colors hover:text-primary"
          >
            مطالعه مقاله
            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
          </Link>
        </article>
      ))}
    </div>
  );
}
