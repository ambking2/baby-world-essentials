import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Check, Trash2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { formatJalaliTime, toFaDigits } from "@/lib/format";
import {
  getAdminComments,
  removeAdminComment,
  setAdminCommentStatus,
  setAdminReviewStatus,
} from "@/lib/admin.functions";

export const Route = createFileRoute("/admin/comments")({
  component: AdminComments,
});

type StatusFilter = "pending" | "approved" | "rejected" | "";

const STATUS_LABELS: Record<string, string> = {
  pending: "در انتطار تأیید",
  approved: "تأیید‌شده",
  rejected: "ردشده",
};

function AdminComments() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<StatusFilter>("pending");

  const dataQuery = useQuery({
    queryKey: ["admin-comments", status],
    queryFn: () => getAdminComments({ data: status === "" ? {} : { status } }),
  });

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin-comments"] });
    void queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
    void queryClient.invalidateQueries({ queryKey: ["blog-post"] });
  };

  const setComment = useMutation({
    mutationFn: (input: { id: number; status: "pending" | "approved" | "rejected" }) =>
      setAdminCommentStatus({ data: input }),
    onSuccess: (result) => {
      toast.success(result.message);
      refresh();
    },
  });

  const deleteComment = useMutation({
    mutationFn: (id: number) => removeAdminComment({ data: { id } }),
    onSuccess: (result) => {
      toast.success(result.message);
      refresh();
    },
  });

  const setReview = useMutation({
    mutationFn: (input: { id: number; status: "pending" | "approved" | "rejected" }) =>
      setAdminReviewStatus({ data: input }),
    onSuccess: (result) => {
      toast.success(result.message);
      refresh();
      void queryClient.invalidateQueries({ queryKey: ["product"] });
    },
  });

  const comments = dataQuery.data?.comments ?? [];
  const reviews = dataQuery.data?.reviews ?? [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 rounded-3xl border border-border bg-card p-4">
        <span className="text-[11px] font-bold text-foreground">فیلتر وضعیت:</span>
        {(["pending", "approved", "rejected", ""] as Array<StatusFilter>).map((value) => (
          <button
            key={value === "" ? "all" : value}
            type="button"
            onClick={() => setStatus(value)}
            className={`rounded-full border px-3 py-1.5 text-[10px] font-bold transition-colors ${
              status === value ? "border-brand bg-brand text-primary-foreground" : "border-border text-muted-foreground hover:border-brand hover:text-brand"
            }`}
          >
            {value === "" ? "همه" : STATUS_LABELS[value]}
          </button>
        ))}
      </div>

      <section className="space-y-3 rounded-3xl border border-border bg-card p-5">
        <h1 className="text-sm font-extrabold text-foreground">دیدگاه‌های مجله ({toFaDigits(comments.length)})</h1>

        {comments.map((comment) => (
          <div key={comment.id} className="space-y-2 rounded-2xl border border-border p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-[11px] font-extrabold text-foreground">
                {comment.name}
                {comment.email ? <span className="ms-2 text-[10px] font-normal text-muted-foreground" dir="ltr">{comment.email}</span> : null}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {comment.postTitle} · {formatJalaliTime(comment.createdAt)} · {STATUS_LABELS[comment.status] ?? comment.status}
              </p>
            </div>
            <p className="whitespace-pre-line text-[11px] leading-6 text-muted-foreground">{comment.body}</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setComment.mutate({ id: comment.id, status: "approved" })}
                className="inline-flex items-center gap-1 rounded-full bg-brand px-3 py-1.5 text-[10px] font-bold text-primary-foreground"
              >
                <Check className="size-3" aria-hidden />
                تأیید
              </button>
              <button
                type="button"
                onClick={() => setComment.mutate({ id: comment.id, status: "rejected" })}
                className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-[10px] font-bold hover:border-sale hover:text-sale"
              >
                <X className="size-3" aria-hidden />
                رد
              </button>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm("این دیدگاه حذف شود؟")) deleteComment.mutate(comment.id);
                }}
                className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-[10px] font-bold text-muted-foreground hover:border-sale hover:text-sale"
              >
                <Trash2 className="size-3" aria-hidden />
                حذف
              </button>
            </div>
          </div>
        ))}
        {comments.length === 0 && !dataQuery.isLoading ? (
          <p className="rounded-2xl border border-dashed border-border p-6 text-center text-[11px] text-muted-foreground">
            دیدگاهی در این وضعیت وجود ندارد.
          </p>
        ) : null}
      </section>

      <section className="space-y-3 rounded-3xl border border-border bg-card p-5">
        <h2 className="text-sm font-extrabold text-foreground">نقد و امتیاز محصولات ({toFaDigits(reviews.length)})</h2>

        {reviews.map((review) => (
          <div key={review.id} className="space-y-2 rounded-2xl border border-border p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-[11px] font-extrabold text-foreground">
                {review.name} · امتیاز {toFaDigits(review.rating)} از ۵
              </p>
              <p className="text-[10px] text-muted-foreground">
                {review.productTitle} · {formatJalaliTime(review.createdAt)} · {STATUS_LABELS[review.status] ?? review.status}
              </p>
            </div>
            <p className="whitespace-pre-line text-[11px] leading-6 text-muted-foreground">{review.body}</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setReview.mutate({ id: review.id, status: "approved" })}
                className="inline-flex items-center gap-1 rounded-full bg-brand px-3 py-1.5 text-[10px] font-bold text-primary-foreground"
              >
                <Check className="size-3" aria-hidden />
                تأیید و اعمال در میانگین
              </button>
              <button
                type="button"
                onClick={() => setReview.mutate({ id: review.id, status: "rejected" })}
                className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-[10px] font-bold hover:border-sale hover:text-sale"
              >
                <X className="size-3" aria-hidden />
                رد
              </button>
            </div>
          </div>
        ))}
        {reviews.length === 0 && !dataQuery.isLoading ? (
          <p className="rounded-2xl border border-dashed border-border p-6 text-center text-[11px] text-muted-foreground">
            نقدی در این وضعیت وجود ندارد.
          </p>
        ) : null}
      </section>
    </div>
  );
}
