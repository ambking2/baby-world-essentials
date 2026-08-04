import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
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
        <Breadcrumb items={[{ title: "مجلهٔ جهان کودک" }]} />

        <div className="mb-5 rounded-3xl border border-border bg-brand-soft/40 p-6">
          <h1 className="text-lg font-extrabold text-foreground">مجلهٔ جهان کودک</h1>
          <p className="mt-2 text-xs leading-6 text-muted-foreground">
            راهنمای خرید سیسمونی، مراقبت از نوزاد و تجربهٔ ۱۵ سال فروشگاه در ابهر — {toFaDigits(total)} مقاله.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
          <div ref={containerRef}>
            {blogQuery.isLoading ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="skeleton h-72 rounded-3xl" />
                ))}
              </div>
            ) : posts.length === 0 ? (
              <div className="rounded-3xl border border-border bg-card p-12 text-center text-xs text-muted-foreground">
                مقاله‌ای مطابق جستجوی شما پیدا نشد.
              </div>
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
