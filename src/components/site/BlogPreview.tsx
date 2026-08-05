import { useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Clock, Sparkles } from "lucide-react";

import { SectionHeading } from "@/components/store/SectionHeading";
import { postsQuery } from "@/lib/api/catalog";
import { toFaDigits } from "@/lib/format";

export function BlogPreview() {
  const { data: posts } = useSuspenseQuery(postsQuery());
  const list = posts.slice(0, 3);
  if (list.length === 0) return null;

  return (
    <section className="relative overflow-hidden py-20 md:py-28">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute right-0 top-1/4 size-96 rounded-full bg-brand/5 blur-[100px]" />
      </div>
      
      <div className="container-page relative">
        <SectionHeading 
          eyebrow="مجلهٔ مادر و نوزاد" 
          title="دانستنی‌های مفید جهان کودک" 
          subtitle="نکات کاربردی برای چیدمان اتاق، مراقبت از نوزاد و انتخاب بهترین لباس و سیسمونی"
          align="center"
        />

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {list.map((post) => (
            <article
              key={post.slug}
              className="group relative flex h-full flex-col overflow-hidden rounded-[2.8rem] border-2 border-white/90 bg-white/40 p-3 shadow-lift transition-all duration-500 hover:bg-white/80 hover:shadow-deep hover:-translate-y-2"
            >
              <div className="relative aspect-[16/10] overflow-hidden rounded-[2.2rem] shadow-inner">
                <img 
                  src={post.cover ?? "/images/cat-clothing.jpg"} 
                  alt="" 
                  className="size-full object-cover transition-transform duration-700 group-hover:scale-110" 
                />
                <div className="absolute end-4 top-4 rounded-2xl bg-white/90 px-3 py-1.5 text-center shadow-lift backdrop-blur-sm ring-1 ring-black/5">
                  <span className="block text-xs font-black text-brand">{toFaDigits(post.date.slice(-2))}</span>
                  <span className="block text-[10px] font-bold text-muted-foreground">مرداد</span>
                </div>
              </div>

              <div className="flex flex-1 flex-col p-5">
                <div className="mb-3 flex items-center gap-3">
                  <span className="inline-flex items-center gap-1 rounded-full bg-sky/20 px-2.5 py-1 text-[10px] font-bold text-sky">
                    <Sparkles className="size-3" />
                    آموزشی
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Clock className="size-3" />
                    {toFaDigits(post.readMinutes)} دقیقه
                  </span>
                </div>

                <h3 className="line-clamp-2 text-base font-black leading-7 text-foreground">
                  <Link
                    to="/blog/$slug"
                    params={{ slug: post.slug }}
                    className="transition-colors hover:text-brand"
                  >
                    {post.title}
                  </Link>
                </h3>
                <p className="mt-3 line-clamp-2 text-xs leading-6 text-muted-foreground">
                  {post.excerpt}
                </p>
                
                <div className="mt-auto pt-5">
                  <Link
                    to="/blog/$slug"
                    params={{ slug: post.slug }}
                    className="inline-flex items-center gap-2 text-xs font-black text-brand transition-all hover:gap-3"
                  >
                    مطالعه ادامه مطلب
                    <ArrowLeft className="size-4" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            to="/blog"
            className="toy-button inline-flex items-center gap-3 rounded-full bg-foreground px-8 py-3.5 text-sm font-extrabold text-background shadow-lift transition-transform hover:scale-[1.03]"
          >
            مشاهده همه مطالب مجله
            <ArrowLeft className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
