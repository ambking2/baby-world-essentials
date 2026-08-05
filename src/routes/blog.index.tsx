import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { BookOpenText, Sparkles } from "lucide-react";
import { useState } from "react";

import { BlogCard } from "@/components/store/BlogCard";
import { BlogSidebar } from "@/components/store/BlogSidebar";
import { Breadcrumb } from "@/components/store/Breadcrumb";
import { Pagination } from "@/components/store/Pagination";
import { StoreShell } from "@/components/store/StoreShell";
import { useReveal } from "@/hooks/use-reveal";
import { toFaDigits } from "@/lib/format";
import { getBlogIndex } from "@/server/functions/blog";

export const Route = createFileRoute("/blog/")({
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
  });

  const containerRef = useReveal<HTMLDivElement>();

  const posts = blogQuery.data?.posts.items ?? [];
  const total = blogQuery.data?.posts.total ?? 0;
  const pageCount = blogQuery.data?.posts.pageCount ?? 1;

  return (
    <StoreShell>
      <div className="container-page py-6">
        <div className="storybook-panel overflow-hidden p-6 md:p-8">
          <Breadcrumb items={[{ title: "مجلهٔ جهان کودک" }]} />
          <div className="mt-4 grid items-center gap-6 lg:grid-cols-[1fr_320px]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-[11px] font-extrabold text-brand shadow-soft">
                <Sparkles className="size-3.5" aria-hidden />
                مقاله، تجربه و راهنمای خرید
              </div>
              <h1 className="mt-4 text-2xl font-black text-foreground md:text-[2.2rem]">مجلهٔ جهان کودک</h1>
              <p className="mt-3 max-w-2xl text-sm leading-8 text-muted-foreground">
                راهنمای خرید سیسمونی، مراقبت از نوزاد و تجربهٔ واقعی فروشگاه در برخورد با خانواده‌ها — با {toFaDigits(total)} مقاله.
              </p>
            </div>
            <div className="rounded-[2rem] border border-white/70 bg-gradient-to-br from-[#ffe0cf] to-[#fff6ef] p-5 shadow-soft">
              <div className="flex items-center gap-3">
                <span className="grid size-12 place-items-center rounded-[1.2rem] bg-white text-brand shadow-soft">
                  <BookOpenText className="size-5" aria-hidden />
                </span>
                <div>
                  <p className="text-sm font-black text-foreground">مطالب کاربردی و قابل‌استفاده</p>
                  <p className="text-[11px] text-muted-foreground">نه فقط محتوا؛ راهنمای تصمیم‌گیری برای خرید</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_320px]">
          <div ref={containerRef}>
            {blogQuery.isLoading ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="skeleton h-72 rounded-3xl" />
                ))}
              </div>
            ) : posts.length === 0 ? (
              <div className="section-shell p-12 text-center text-xs text-muted-foreground">مقاله‌ای مطابق جستجوی شما پیدا نشد.</div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {posts.map((post) => (
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
            />
          </div>

          <BlogSidebar
            recent={blogQuery.data?.recent ?? []}
            tags={blogQuery.data?.tags ?? []}
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
        </div>
      </div>
    </StoreShell>
  );
}
