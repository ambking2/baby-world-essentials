import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { ImagePlus, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { formatJalali, slugify, toFaDigits } from "@/lib/format";
import { getAdminPosts, removeAdminPost, saveAdminPost } from "@/@/lib/admin.functions";
import { uploadAdminImage } from "@/server/functions/upload";

export const Route = createFileRoute("/admin/posts")({
  component: AdminPosts,
});

const field =
  "w-full rounded-xl border border-border bg-background px-3 py-2.5 text-xs outline-none transition-colors focus:border-brand";
const label = "mb-1 block text-[11px] font-bold text-foreground";

type FormState = {
  id: number | null;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  cover: string;
  tag: string;
  author: string;
  status: "published" | "draft";
};

const emptyForm: FormState = {
  id: null,
  slug: "",
  title: "",
  excerpt: "",
  body: "",
  cover: "",
  tag: "",
  author: "",
  status: "published",
};

function readFileAsBase64(file: File): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolvePromise, rejectPromise) => {
    const reader = new FileReader();
    reader.onerror = () => rejectPromise(new Error("خواندن فایل انجام نشد."));
    reader.onload = () => {
      const result = String(reader.result ?? "");
      const commaIndex = result.indexOf(",");
      resolvePromise({ base64: commaIndex >= 0 ? result.slice(commaIndex + 1) : result, mimeType: file.type });
    };
    reader.readAsDataURL(file);
  });
}

function AdminPosts() {
  const queryClient = useQueryClient();
  const postsQuery = useQuery({ queryKey: ["admin-posts"], queryFn: () => getAdminPosts() });
  const [form, setForm] = useState<FormState>(emptyForm);

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin-posts"] });
    void queryClient.invalidateQueries({ queryKey: ["blog"] });
  };

  const upload = useMutation({
    mutationFn: async (file: File) => {
      const payload = await readFileAsBase64(file);
      return uploadAdminImage({ data: { base64: payload.base64, mimeType: payload.mimeType, purpose: "blog" } });
    },
    onSuccess: (result) => {
      setForm((current) => ({ ...current, cover: result.url }));
      toast.success(result.message);
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "بارگزاری تصویر انجام نشد."),
  });

  const save = useMutation({
    mutationFn: () =>
      saveAdminPost({
        data: {
          ...(form.id === null ? {} : { id: form.id }),
          slug: form.slug.trim().length > 0 ? form.slug.trim() : slugify(form.title),
          title: form.title.trim(),
          excerpt: form.excerpt.trim().length > 0 ? form.excerpt.trim() : null,
          body: form.body,
          cover: form.cover.trim().length > 0 ? form.cover.trim() : null,
          tag: form.tag.trim().length > 0 ? form.tag.trim() : null,
          author: form.author.trim().length > 0 ? form.author.trim() : null,
          status: form.status,
        },
      }),
    onSuccess: (result) => {
      toast.success(result.message);
      setForm(emptyForm);
      refresh();
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "ذخیرهٔ مقاله انجام نشد."),
  });

  const remove = useMutation({
    mutationFn: (id: number) => removeAdminPost({ data: { id } }),
    onSuccess: (result) => {
      toast.success(result.message);
      refresh();
    },
  });

  const posts = postsQuery.data?.posts ?? [];

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
      <section className="space-y-3 rounded-3xl border border-border bg-card p-5">
        <div className="flex items-center justify-between">
          <h1 className="text-sm font-extrabold text-foreground">مقاله‌های مجله</h1>
          <button
            type="button"
            onClick={() => setForm(emptyForm)}
            className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-[10px] font-bold hover:border-brand hover:text-brand"
          >
            <Plus className="size-3" aria-hidden />
            مقالهٔ جدید
          </button>
        </div>

        <div className="space-y-2">
          {posts.map((post) => (
            <div key={post.id} className="flex items-center gap-3 rounded-2xl border border-border p-3">
              <img src={post.cover ?? "/images/workshop.jpg"} alt={post.title} className="size-12 rounded-xl object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[11px] font-extrabold text-foreground">{post.title}</p>
                <p className="text-[10px] text-muted-foreground">
                  {post.status === "published" ? "منتشرشده" : "پیش‌نویس"} · {post.publishedAt ? formatJalali(post.publishedAt) : "—"} ·{" "}
                  {toFaDigits(post.viewCount)} بازدید · {toFaDigits(post.commentCount)} دیدگاه
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setForm({
                    id: post.id,
                    slug: post.slug,
                    title: post.title,
                    excerpt: post.excerpt ?? "",
                    body: post.body,
                    cover: post.cover ?? "",
                    tag: post.tag ?? "",
                    author: post.author,
                    status: post.status === "draft" ? "draft" : "published",
                  })
                }
                className="rounded-lg border border-border px-3 py-1 text-[10px] font-bold hover:border-brand hover:text-brand"
              >
                ویرایش
              </button>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`مقالهٔ «${post.title}» حذف شود؟`)) remove.mutate(post.id);
                }}
                className="rounded-lg border border-border p-1.5 text-muted-foreground hover:border-sale hover:text-sale"
                aria-label="حذف مقاله"
              >
                <Trash2 className="size-3.5" aria-hidden />
              </button>
            </div>
          ))}
          {posts.length === 0 && !postsQuery.isLoading ? (
            <p className="rounded-2xl border border-dashed border-border p-8 text-center text-[11px] text-muted-foreground">
              هنوز مقاله‌ای ثبت نشده است.
            </p>
          ) : null}
        </div>
      </section>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          save.mutate();
        }}
        className="h-fit space-y-3 rounded-3xl border border-border bg-card p-5"
      >
        <h2 className="text-sm font-extrabold text-foreground">{form.id === null ? "مقالهٔ جدید" : "ویرایش مقاله"}</h2>

        <div>
          <span className={label}>عنوان</span>
          <input required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} className={field} />
        </div>
        <div>
          <span className={label}>نامک (slug)</span>
          <input value={form.slug} onChange={(event) => setForm({ ...form, slug: event.target.value })} dir="ltr" className={field} />
        </div>
        <div>
          <span className={label}>خلاصه</span>
          <textarea value={form.excerpt} onChange={(event) => setForm({ ...form, excerpt: event.target.value })} rows={2} className={field} />
        </div>
        <div>
          <span className={label}>متن مقاله (هر خط یک پاراگراف؛ برای تیتر از ## استفاده کنید)</span>
          <textarea required value={form.body} onChange={(event) => setForm({ ...form, body: event.target.value })} rows={10} className={field} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className={label}>برچسب</span>
            <input value={form.tag} onChange={(event) => setForm({ ...form, tag: event.target.value })} className={field} />
          </div>
          <div>
            <span className={label}>نویسنده</span>
            <input value={form.author} onChange={(event) => setForm({ ...form, author: event.target.value })} className={field} />
          </div>
        </div>
        <div>
          <span className={label}>وضعیت</span>
          <select
            value={form.status}
            onChange={(event) => setForm({ ...form, status: event.target.value === "draft" ? "draft" : "published" })}
            className={field}
          >
            <option value="published">منتشرشده</option>
            <option value="draft">پیش‌نویس</option>
          </select>
        </div>

        <div className="space-y-2">
          <span className={label}>تصویر کاور</span>
          {form.cover.length > 0 ? <img src={form.cover} alt="کاور مقاله" className="h-28 w-full rounded-xl object-cover" /> : null}
          <label className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-border py-2 text-[11px] font-bold hover:border-brand hover:text-brand">
            <ImagePlus className="size-4" aria-hidden />
            {upload.isPending ? "در حال بارگزاری…" : "بارگزاری تصویر"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) upload.mutate(file);
                event.target.value = "";
              }}
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={save.isPending}
          className="w-full rounded-full bg-brand px-4 py-2.5 text-[11px] font-bold text-primary-foreground disabled:opacity-60"
        >
          {save.isPending ? "در حال ذخیره…" : "ذخیرهٔ مقاله"}
        </button>
      </form>
    </div>
  );
}
