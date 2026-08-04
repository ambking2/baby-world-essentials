import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarDays, Eye, Send, Share2, UserRound } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { BlogSidebar } from "@/components/store/BlogSidebar";
import { Breadcrumb } from "@/components/store/Breadcrumb";
import { StoreShell } from "@/components/store/StoreShell";
import { formatJalali, timeAgo, toFaDigits } from "@/lib/format";
import { getBlogPost, submitBlogComment } from "@/server/functions/blog";

export const Route = createFileRoute("/blog/$slug")({
  component: BlogPostPage,
});

type CommentNode = {
  id: number;
  name: string;
  body: string;
  createdAt: string;
  replies: Array<CommentNode>;
};

const inputClass =
  "w-full rounded-xl border border-border bg-background px-3 py-2.5 text-xs outline-none transition-colors focus:border-brand";

function CommentBranch({
  comments,
  depth,
  onReply,
}: {
  comments: Array<CommentNode>;
  depth: number;
  onReply: (comment: CommentNode) => void;
}) {
  return (
    <div className={depth === 0 ? "space-y-3" : "mt-3 space-y-3 border-s border-border ps-4"}>
      {comments.map((comment) => (
        <div key={comment.id}>
          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="grid size-8 place-items-center rounded-full bg-brand-soft text-brand">
                  <UserRound className="size-4" aria-hidden />
                </span>
                <div>
                  <p className="text-[11px] font-extrabold text-foreground">{comment.name}</p>
                  <p className="text-[10px] text-muted-foreground">{timeAgo(comment.createdAt)}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onReply(comment)}
                className="text-[10px] font-bold text-brand hover:underline"
              >
                پاسخ
              </button>
            </div>
            <p className="mt-2 whitespace-pre-line text-[11px] leading-6 text-muted-foreground">{comment.body}</p>
          </div>

          {comment.replies.length > 0 ? (
            <CommentBranch comments={comment.replies} depth={depth + 1} onReply={onReply} />
          ) : null}
        </div>
      ))}
    </div>
  );
}

function BlogPostPage() {
  const { slug } = Route.useParams();
  const queryClient = useQueryClient();

  const postQuery = useQuery({ queryKey: ["blog-post", slug], queryFn: () => getBlogPost({ data: { slug } }) });

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [body, setBody] = useState("");
  const [replyTo, setReplyTo] = useState<{ id: number; name: string } | null>(null);

  const post = postQuery.data?.post ?? null;

  const sendComment = useMutation({
    mutationFn: () =>
      submitBlogComment({
        data: {
          postId: post?.id ?? 0,
          name,
          body,
          ...(replyTo === null ? {} : { parentId: replyTo.id }),
          ...(email.trim().length > 0 ? { email: email.trim() } : {}),
        },
      }),
    onSuccess: (result) => {
      toast.success(result.message);
      setBody("");
      setReplyTo(null);
      void queryClient.invalidateQueries({ queryKey: ["blog-post", slug] });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "ثبت دیدگاه انجام نشد."),
  });

  const share = () => {
    const url = window.location.href;
    void navigator.clipboard.writeText(url);
    toast.success("لینک مقاله کپی شد.");
  };

  if (postQuery.isLoading) {
    return (
      <StoreShell>
        <div className="container-page py-8">
          <div className="skeleton h-96 rounded-3xl" />
        </div>
      </StoreShell>
    );
  }

  if (!post) {
    return (
      <StoreShell>
        <div className="container-page py-20 text-center">
          <h1 className="text-lg font-extrabold">این مقاله پیدا نشد</h1>
          <Link to="/blog" className="mt-4 inline-flex rounded-full bg-brand px-5 py-2.5 text-xs font-bold text-primary-foreground">
            بازگشت به مجله
          </Link>
        </div>
      </StoreShell>
    );
  }

  const paragraphs = post.body.split("\n").filter((line) => line.trim().length > 0);

  return (
    <StoreShell>
      <div className="container-page py-6">
        <Breadcrumb items={[{ title: "مجلهٔ جهان کودک", href: "/blog" }, { title: post.title }]} />

        <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
          <article className="space-y-5">
            <div className="overflow-hidden rounded-3xl border border-border bg-card">
              <img src={post.cover ?? "/images/hero-nursery.jpg"} alt={post.title} className="h-72 w-full object-cover" />
              <div className="space-y-3 p-6">
                {post.tag ? (
                  <span className="inline-flex rounded-full bg-brand-soft px-3 py-1 text-[10px] font-bold text-brand">{post.tag}</span>
                ) : null}
                <h1 className="text-xl font-extrabold leading-8 text-foreground">{post.title}</h1>

                <div className="flex flex-wrap items-center gap-4 text-[11px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <UserRound className="size-3" aria-hidden />
                    {post.author}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <CalendarDays className="size-3" aria-hidden />
                    {post.publishedAt ? formatJalali(post.publishedAt) : "—"}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Eye className="size-3" aria-hidden />
                    {toFaDigits(post.viewCount)} بازدید
                  </span>
                  <button type="button" onClick={share} className="inline-flex items-center gap-1 font-bold text-brand hover:underline">
                    <Share2 className="size-3" aria-hidden />
                    اشتراک‌گذاری
                  </button>
                </div>

                <div className="space-y-3 pt-2">
                  {paragraphs.map((line, index) =>
                    line.startsWith("## ") ? (
                      <h2 key={index} className="pt-2 text-sm font-extrabold text-foreground">
                        {line.replace("## ", "")}
                      </h2>
                    ) : (
                      <p key={index} className="text-xs leading-7 text-muted-foreground">
                        {line}
                      </p>
                    ),
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 text-[11px]">
              {postQuery.data?.previous ? (
                <Link
                  to="/blog/$slug"
                  params={{ slug: postQuery.data.previous.slug }}
                  className="flex-1 rounded-2xl border border-border bg-card p-3 font-bold transition-colors hover:border-brand hover:text-brand"
                >
                  مقالهٔ قبلی: {postQuery.data.previous.title}
                </Link>
              ) : null}
              {postQuery.data?.next ? (
                <Link
                  to="/blog/$slug"
                  params={{ slug: postQuery.data.next.slug }}
                  className="flex-1 rounded-2xl border border-border bg-card p-3 text-end font-bold transition-colors hover:border-brand hover:text-brand"
                >
                  مقالهٔ بعدی: {postQuery.data.next.title}
                </Link>
              ) : null}
            </div>

            <section className="space-y-3">
              <h2 className="text-sm font-extrabold text-foreground">
                دیدگاه‌ها ({toFaDigits(post.commentCount)})
              </h2>
              {post.comments.length === 0 ? (
                <p className="rounded-2xl border border-border bg-card p-6 text-center text-[11px] text-muted-foreground">
                  اولین دیدگاه را شما بنویسید.
                </p>
              ) : (
                <CommentBranch
                  comments={post.comments}
                  depth={0}
                  onReply={(comment) => {
                    setReplyTo({ id: comment.id, name: comment.name });
                    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
                  }}
                />
              )}
            </section>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                sendComment.mutate();
              }}
              className="space-y-3 rounded-3xl border border-border bg-card p-5"
            >
              <h2 className="text-sm font-extrabold text-foreground">
                {replyTo ? `پاسخ به ${replyTo.name}` : "دیدگاه شما"}
              </h2>
              {replyTo ? (
                <button type="button" onClick={() => setReplyTo(null)} className="text-[10px] text-muted-foreground hover:text-sale">
                  لغو پاسخ و ثبت دیدگاه مستقل
                </button>
              ) : null}

              <div className="grid gap-3 sm:grid-cols-2">
                <input required value={name} onChange={(event) => setName(event.target.value)} placeholder="نام شما" className={inputClass} />
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="ایمیل (اختیاری و منتشر نمی‌شود)"
                  dir="ltr"
                  className={inputClass}
                />
              </div>
              <textarea
                required
                value={body}
                onChange={(event) => setBody(event.target.value)}
                rows={4}
                placeholder="متن دیدگاه…"
                className={inputClass}
              />
              <button
                type="submit"
                disabled={sendComment.isPending}
                className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-xs font-bold text-primary-foreground disabled:opacity-60"
              >
                <Send className="size-4" aria-hidden />
                {sendComment.isPending ? "در حال ارسال…" : "ثبت دیدگاه"}
              </button>
            </form>
          </article>

          <BlogSidebar recent={postQuery.data?.recent ?? []} tags={postQuery.data?.tags ?? []} />
        </div>
      </div>
    </StoreShell>
  );
}
