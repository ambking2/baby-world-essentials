import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import {
  addComment,
  adjacentPosts,
  blogTags,
  incrementPostView,
  listPosts,
  postBySlug,
  recentPosts,
} from "../repo/blog";

/** فهرست مقالات به همراه دادهٔ سایدبار. */
export const getBlogIndex = createServerFn({ method: "GET" })
  .validator((data: unknown) =>
    z
      .object({
        page: z.number().int().positive().optional(),
        perPage: z.number().int().positive().max(24).optional(),
        tag: z.string().max(60).optional(),
        q: z.string().max(120).optional(),
      })
      .parse(data ?? {}),
  )
  .handler(async ({ data }) => {
    const filters: { page?: number; perPage?: number; tag?: string; q?: string } = {};
    if (data.page !== undefined) filters.page = data.page;
    if (data.perPage !== undefined) filters.perPage = data.perPage;
    if (data.tag !== undefined) filters.tag = data.tag;
    if (data.q !== undefined) filters.q = data.q;

    return {
      posts: listPosts(filters),
      recent: recentPosts(5),
      tags: blogTags(),
    };
  });

/** یک مقاله با نظرات تودرتو و مقالهٔ قبل/بعد. */
export const getBlogPost = createServerFn({ method: "GET" })
  .validator((data: unknown) => z.object({ slug: z.string().min(1).max(160) }).parse(data))
  .handler(async ({ data }) => {
    const post = postBySlug(data.slug);
    if (!post) return { post: null, previous: null, next: null, recent: recentPosts(5), tags: blogTags() };

    incrementPostView(post.id);
    const around = adjacentPosts(post);

    return {
      post,
      previous: around.previous,
      next: around.next,
      recent: recentPosts(5),
      tags: blogTags(),
    };
  });

/** ثبت دیدگاه زیر مقاله (پاسخ به دیدگاه دیگر هم پشتیبانی می‌شود). */
export const submitBlogComment = createServerFn({ method: "POST" })
  .validator((data: unknown) =>
    z
      .object({
        postId: z.number().int().positive(),
        parentId: z.number().int().positive().nullable().optional(),
        name: z.string().min(2, "نام را وارد کنید.").max(60),
        email: z.string().email("ایمیل معتبر وارد کنید.").max(160).optional(),
        body: z.string().min(3, "متن دیدگاه کوتاه است.").max(2000),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    addComment({
      postId: data.postId,
      parentId: data.parentId ?? null,
      name: data.name.trim(),
      email: data.email ?? null,
      body: data.body.trim(),
    });
    return { ok: true, message: "دیدگاه شما ثبت شد و پس از تأیید منتشر می‌شود." };
  });
