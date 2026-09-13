import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, CalendarDays, Clock, MessageCircle, Search, Sparkles } from "lucide-react";
import { useState } from "react";

import { BlogCard } from "@/components/store/BlogCard";
import { BlogSidebar } from "@/components/store/BlogSidebar";
import { Pagination } from "@/components/store/Pagination";
import { StoreShell } from "@/components/store/StoreShell";
import { useReveal } from "@/hooks/use-reveal";
import { formatJalali, toFaDigits } from "@/lib/format";
import { cn } from "@/lib/utils";
import { getBlogIndex } from "@/server/functions/blog";

export const Route = createFileRoute("/blog/")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData({
      queryKey: ["blog", 1, "", ""],
      queryFn: () => getBlogIndex({ data: { page: 1, perPage: 12 } }),
    }),
  component: BlogIndexPage,
});

function BlogIndexPage() {
  const [page, setPage] = useState(1);
  const [tag, setTag] = useState<string | undefined>(undefined);
  const [searchText, setSearchText] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");

  const blogQuery = useQuery({
    queryKey: ["blog", page, tag ?? "", appliedSearch],
    queryFn: () =>
      getBlogIndex({
        data: {
          page,
          perPage: 12,
          ...(tag === undefined ? {} : { tag }),
          ...(appliedSearch.trim().length > 0 ? { q: appliedSearch.trim() } : {}),
        },
      }),
    staleTime: 60_000,
    placeholderData: (previous) => previous,
  });

  const posts = blogQuery.data?.posts.items ?? [];
  const total = blogQuery.data?.posts.total ?? 0;
  const pageCount = blogQuery.data?.posts.pageCount ?? 1;
  const containerRef = useReveal<HTMLDivElement>({ watch: posts.length });
  const tags = blogQuery.data?.tags ?? [];

  // Featured = first post on first page without filters
  const featured = !tag && !appliedSearch && page === 1 ? posts[0] : null;
  const gridPosts = featured ? posts.slice(1) : posts;

  return (
    <StoreShell>
      {/* 1. Hero — cloud atmosphere */}
      <section className="relative overflow-hidden bg-gradient-to-b from-surface-container-low via-background to-background pt-12 pb-16 md:pt-16 md:pb-24">
        <div className="pointer-events-none absolute -right-24 -top-16 size-96 rounded-full bg-secondary-fixed/40 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 top-20 size-80 rounded-full bg-primary-fixed/50 blur-3xl" />
        <div className="relative z-10 container-page">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-surface-container-high bg-surface-container-lowest px-4 py-2 font-label-md text-label-md text-primary shadow-sm">
              <Sparkles className="size-4 text-primary-container" />
              دانشنامهٔ والدینی که بهترین‌ها را می‌خواهند
            </div>
            <h1 className="font-display-lg text-display-lg-mobile mb-6 font-extrabold tracking-tight text-on-surface md:text-display-lg">
              مجلهٔ <span className="text-primary underline decoration-secondary-container decoration-wavy decoration-2 underline-offset-8">جهان کودک</span>
            </h1>
            <p className="font-body-lg text-body-lg mx-auto mb-8 max-w-2xl text-on-surface-variant">
              راهنمای خرید سیسمونی، مراقبت از نوزاد و تجربه‌های واقعی والدین — {toFaDigits(total)} مقالهٔ تخصصی.
            </p>
            <div className="relative mx-auto max-w-xl">
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  setAppliedSearch(searchText);
                  setPage(1);
                }}
                className="flex items-center rounded-full border-2 border-surface-container-high bg-surface-container-lowest p-2 pr-3 transition-colors focus-within:border-primary"
              >
                <Search className="size-5 shrink-0 pr-1 text-outline" />
                <input
                  value={searchText}
                  onChange={(event) => setSearchText(event.target.value)}
                  placeholder="جستجو در مقاله‌ها (مثلاً: خواب نوزاد، سیسمونی…)"
                  className="w-full border-0 bg-transparent px-2 text-sm text-on-surface outline-none placeholder:text-outline-variant"
                />
                <button
                  type="submit"
                  className="flex shrink-0 items-center gap-1 rounded-full bg-primary-container px-6 py-2.5 font-label-md text-label-md font-bold text-on-primary shadow-sm transition-colors hover:bg-primary"
                >
                  جستجو
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Category pill bar */}
      {tags.length > 0 ? (
        <section className="container-page -mt-4 mb-14">
          <div className="hide-scrollbar flex items-center gap-3 overflow-x-auto pb-4">
            <button
              type="button"
              onClick={() => {
                setTag(undefined);
                setPage(1);
              }}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-full px-6 py-3 font-label-md text-label-md transition-transform active:scale-95",
                !tag ? "bg-primary text-on-primary shadow-md" : "bg-surface-container-lowest text-on-surface-variant shadow-sm hover:text-primary",
              )}
            >
              همه مقالات
            </button>
            {tags.map((item) => {
              const active = tag === item.tag;
              return (
                <button
                  key={item.tag}
                  type="button"
                  onClick={() => {
                    setTag(active ? undefined : item.tag);
                    setPage(1);
                  }}
                  className={cn(
                    "flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-5 py-3 font-label-md text-label-md shadow-sm transition-all active:scale-95",
                    active ? "bg-primary text-on-primary" : "bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-low hover:text-primary",
                  )}
                >
                  {item.tag}
                  <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-bold", active ? "bg-white/25" : "bg-surface-container")}>
                    {toFaDigits(item.postCount)}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      ) : null}

      {/* 3. Featured article */}
      {featured ? (
        <section className="container-page mb-20">
          <Link to="/blog/$slug" params={{ slug: featured.slug }} className="group block overflow-hidden rounded-2xl border border-surface-container-high/60 bg-surface-container-lowest p-6 shadow-sm md:p-8">
            <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
              <div className="relative h-80 overflow-hidden rounded-2xl sm:h-96 lg:col-span-7 lg:h-[420px]">
                <img
                  src={featured.cover ?? "/images/hero-nursery.jpg"}
                  alt={featured.title}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <span className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 font-label-md text-label-md text-on-primary shadow-md">
                  <Sparkles className="size-4" />
                  برگزیدهٔ سردبیر
                </span>
              </div>
              <div className="lg:col-span-5">
                {featured.tag ? (
                  <span className="mb-3 inline-block rounded-full bg-secondary-fixed px-3 py-1 text-[12px] font-bold text-secondary">{featured.tag}</span>
                ) : null}
                <h2 className="font-headline-md text-headline-md mb-4 font-black leading-snug text-on-surface group-hover:text-primary">
                  {featured.title}
                </h2>
                <p className="mb-6 line-clamp-3 font-body-md text-body-md leading-8 text-on-surface-variant">{featured.excerpt}</p>
                <div className="flex flex-wrap items-center gap-4 text-[12px] text-on-surface-variant">
                  <span className="flex items-center gap-1.5">
                    <CalendarDays className="size-4" />
                    {featured.publishedAt ? formatJalali(featured.publishedAt) : "—"}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MessageCircle className="size-4" />
                    {toFaDigits(featured.commentCount)} دیدگاه
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="size-4" />
                    {toFaDigits((featured as { readMinutes?: number }).readMinutes ?? 0)} دقیقه مطالعه
                  </span>
                </div>
                <span className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3 text-sm font-bold text-on-primary shadow-lg shadow-primary/25 transition-transform group-hover:scale-105">
                  مطالعهٔ مقاله
                  <ArrowLeft className="size-4" />
                </span>
              </div>
            </div>
          </Link>
        </section>
      ) : null}

      {/* 4. Articles grid + sidebar */}
      <section className="container-page mb-section-gap">
        <div className="grid items-start gap-gutter lg:grid-cols-12">
          <div ref={containerRef} className="lg:col-span-8">
            {blogQuery.isLoading ? (
              <div className="grid gap-6 sm:grid-cols-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="skeleton h-80 rounded-xl" />
                ))}
              </div>
            ) : gridPosts.length === 0 ? (
              <div className="card-soft rounded-xl p-12 text-center text-sm text-on-surface-variant">
                مقاله‌ای مطابق جستجوی شما پیدا نشد.
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2">
                {gridPosts.map((post) => (
                  <BlogCard key={post.slug} post={post} />
                ))}
              </div>
            )}

            <Pagination
              page={page}
              pageCount={pageCount}
              onChange={(next) => {
                setPage(next);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="mt-12"
            />
          </div>

          <aside className="space-y-6 lg:col-span-4">
            <BlogSidebar
              recent={blogQuery.data?.recent ?? []}
              tags={tags}
              search={searchText}
              onSearchChange={setSearchText}
              onSearchSubmit={() => {
                setAppliedSearch(searchText);
                setPage(1);
              }}
              {...(tag === undefined ? {} : { activeTag: tag })}
              onTagSelect={(next) => {
                setTag(next);
                setPage(1);
              }}
            />
          </aside>
        </div>
      </section>
    </StoreShell>
  );
}
