import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";

import { SiteLayout } from "@/components/site/SiteLayout";
import { PageHeader } from "@/components/site/PageHeader";
import { postQuery } from "@/lib/api/catalog";
import { toFaDigits } from "@/lib/format";

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ context, params }) => {
    const post = await context.queryClient.ensureQueryData(postQuery(params.slug));
    if (!post) throw notFound();
    return { title: post.title, excerpt: post.excerpt };
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "مطلب یافت نشد | جهان کودک" }, { name: "robots", content: "noindex" }],
      };
    }
    const title = `${loaderData.title} | مجله جهان کودک`;
    const url = `https://baby-world-essentials.lovable.app/blog/${params.slug}`;
    return {
      meta: [
        { title },
        { name: "description", content: loaderData.excerpt },
        { property: "og:title", content: title },
        { property: "og:description", content: loaderData.excerpt },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  component: PostPage,
  errorComponent: ({ error }) => (
    <div role="alert" className="container-page py-20 text-center text-sm">
      {error.message}
    </div>
  ),
  notFoundComponent: () => (
    <SiteLayout>
      <PageHeader title="این مطلب پیدا نشد" crumbs={[{ label: "مجله", to: "/blog" }]} />
    </SiteLayout>
  ),
});

function PostPage() {
  const { slug } = Route.useParams();
  const { data: post } = useSuspenseQuery(postQuery(slug));
  if (!post) return null;

  return (
    <SiteLayout>
      <PageHeader
        title={post.title}
        crumbs={[{ label: "مجله", to: "/blog" }, { label: post.title }]}
      />
      <article className="container-page max-w-3xl py-8">
        <p className="text-xs text-muted-foreground">
          {post.author} — {post.date} — {toFaDigits(post.readMinutes)} دقیقه مطالعه
        </p>
        <div className="mt-5 flex flex-col gap-4">
          {post.body.map((p) => (
            <p key={p.slice(0, 24)} className="text-[15px] leading-8 text-foreground/85">
              {p}
            </p>
          ))}
        </div>
        <Link
          to="/blog"
          className="mt-8 inline-block rounded-full bg-secondary px-5 py-2 text-xs font-medium text-primary"
        >
          بازگشت به مجله
        </Link>
      </article>
    </SiteLayout>
  );
}
