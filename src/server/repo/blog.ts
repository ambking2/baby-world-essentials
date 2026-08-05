import { all, count, nowIso, one, run } from "../db";

export type BlogCard = {
  id: number;
  slug: string;
  title: string;
  excerpt: string | null;
  cover: string | null;
  tag: string | null;
  author: string;
  publishedAt: string | null;
  viewCount: number;
  commentCount: number;
};

export type BlogComment = {
  id: number;
  name: string;
  body: string;
  createdAt: string;
  replies: Array<BlogComment>;
};

export type BlogPost = BlogCard & {
  body: string;
  comments: Array<BlogComment>;
};

type PostRow = {
  id: number;
  slug: string;
  title: string;
  excerpt: string | null;
  body: string;
  cover: string | null;
  tag: string | null;
  author: string;
  status: string;
  published_at: string | null;
  view_count: number;
  comment_count?: number;
};

const COMMENT_COUNT_SQL = `(
  SELECT COUNT(*) FROM blog_comments bc
  WHERE bc.post_id = b.id AND bc.status = 'approved'
) AS comment_count`;

function mapCard(row: PostRow): BlogCard {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    cover: row.cover,
    tag: row.tag,
    author: row.author,
    publishedAt: row.published_at,
    viewCount: Number(row.view_count),
    commentCount: Number(row.comment_count ?? 0),
  };
}

/* ------------------------------------------------------------------ */
/* فهرست مقالات                                                     */
/* ------------------------------------------------------------------ */

export async function listPosts(
  filters: { page?: number; perPage?: number; tag?: string; q?: string } = {},
): Promise<{
  items: Array<BlogCard>;
  total: number;
  page: number;
  pageCount: number;
}> {
  const perPage = Math.min(Math.max(filters.perPage ?? 9, 1), 24);
  const page = Math.max(filters.page ?? 1, 1);
  const clauses = ["b.status = 'published'"];
  const params: Array<string | number> = [];

  if (filters.tag && filters.tag.trim().length > 0) {
    clauses.push("b.tag = ?");
    params.push(filters.tag.trim());
  }
  if (filters.q && filters.q.trim().length > 0) {
    clauses.push("(b.title LIKE ? OR b.excerpt LIKE ? OR b.body LIKE ?)");
    const like = `%${filters.q.trim()}%`;
    params.push(like, like, like);
  }

  const where = clauses.join(" AND ");
  const total = await count(`SELECT COUNT(*) AS c FROM blog_posts b WHERE ${where}`, ...params);
  const rows = await all<PostRow>(
    `SELECT b.*, ${COMMENT_COUNT_SQL} FROM blog_posts b WHERE ${where}
     ORDER BY datetime(b.published_at) DESC, b.id DESC LIMIT ? OFFSET ?`,
    ...params,
    perPage,
    (page - 1) * perPage,
  );

  return {
    items: rows.map(mapCard),
    total,
    page,
    pageCount: Math.max(Math.ceil(total / perPage), 1),
  };
}

/** برای سایدبار «آخرین مطالب». */
export async function recentPosts(limit = 5): Promise<Array<BlogCard>> {
  const rows = await all<PostRow>(
    `SELECT b.*, ${COMMENT_COUNT_SQL} FROM blog_posts b WHERE b.status = 'published'
     ORDER BY datetime(b.published_at) DESC, b.id DESC LIMIT ?`,
    limit,
  );
  return rows.map(mapCard);
}

/** برای سایدبار «برچسب‌ها» و «دسته‌ها». */
export async function blogTags(): Promise<Array<{ tag: string; postCount: number }>> {
  const rows = await all<{ tag: string; c: number }>(
    `SELECT tag, COUNT(*) AS c FROM blog_posts
     WHERE status = 'published' AND tag IS NOT NULL AND tag <> ''
     GROUP BY tag ORDER BY c DESC, tag ASC`,
  );
  return rows.map((row) => ({ tag: row.tag, postCount: Number(row.c) }));
}

/* ------------------------------------------------------------------ */
/* یک مقاله با نطرات تودرتو                                     */
/* ------------------------------------------------------------------ */

type CommentRow = {
  id: number;
  parent_id: number | null;
  name: string;
  body: string;
  created_at: string;
};

function buildTree(rows: Array<CommentRow>): Array<BlogComment> {
  const byId = new Map<number, BlogComment>();
  const roots: Array<BlogComment> = [];

  for (const row of rows) {
    byId.set(row.id, {
      id: row.id,
      name: row.name,
      body: row.body,
      createdAt: row.created_at,
      replies: [],
    });
  }
  for (const row of rows) {
    const node = byId.get(row.id);
    if (!node) continue;
    const parent = row.parent_id === null ? undefined : byId.get(row.parent_id);
    if (parent) parent.replies.push(node);
    else roots.push(node);
  }
  return roots;
}

export async function postBySlug(slug: string): Promise<BlogPost | null> {
  const row = await one<PostRow>(
    `SELECT b.*, ${COMMENT_COUNT_SQL} FROM blog_posts b WHERE b.slug = ? AND b.status = 'published'`,
    slug,
  );
  if (!row) return null;

  const comments = buildTree(
    await all<CommentRow>(
      `SELECT id, parent_id, name, body, created_at FROM blog_comments
       WHERE post_id = ? AND status = 'approved' ORDER BY id ASC`,
      row.id,
    ),
  );

  return { ...mapCard(row), body: row.body, comments };
}

/** مقاله‌ی قبلی و بعدی — برای پایین صفحه‌ی مقاله. */
export async function adjacentPosts(post: BlogCard): Promise<{
  previous: { slug: string; title: string } | null;
  next: { slug: string; title: string } | null;
}> {
  const [previousRow, nextRow] = await Promise.all([
    one<{ slug: string; title: string }>(
      `SELECT slug, title FROM blog_posts
       WHERE status = 'published' AND datetime(COALESCE(published_at, '1970-01-01')) < datetime(COALESCE(?, '1970-01-01'))
       ORDER BY datetime(published_at) DESC LIMIT 1`,
      post.publishedAt,
    ),
    one<{ slug: string; title: string }>(
      `SELECT slug, title FROM blog_posts
       WHERE status = 'published' AND datetime(COALESCE(published_at, '1970-01-01')) > datetime(COALESCE(?, '1970-01-01'))
       ORDER BY datetime(published_at) ASC LIMIT 1`,
      post.publishedAt,
    ),
  ]);

  return { previous: previousRow ?? null, next: nextRow ?? null };
}

export async function incrementPostView(postId: number): Promise<void> {
  await run("UPDATE blog_posts SET view_count = view_count + 1 WHERE id = ?", postId);
}

/** نطر جدید در انتطار تأیید مدیر قرار می‌گیرد. */
export async function addComment(input: {
  postId: number;
  parentId?: number | null;
  name: string;
  email?: string | null;
  body: string;
}): Promise<void> {
  await run(
    `INSERT INTO blog_comments (post_id, parent_id, name, email, body, status, created_at)
     VALUES (?, ?, ?, ?, ?, 'pending', ?)`,
    input.postId,
    input.parentId ?? null,
    input.name,
    input.email ?? null,
    input.body,
    nowIso(),
  );
}

/* ------------------------------------------------------------------ */
/* پنل مدیریت                                                        */
/* ------------------------------------------------------------------ */

export type AdminPost = BlogCard & { status: string; body: string };

export async function adminListPosts(): Promise<Array<AdminPost>> {
  const rows = await all<PostRow>(
    `SELECT b.*, ${COMMENT_COUNT_SQL} FROM blog_posts b ORDER BY b.id DESC`,
  );
  return rows.map((row) => ({
    ...mapCard(row),
    status: row.status,
    body: row.body,
  }));
}

export async function adminSavePost(input: {
  id?: number | null;
  slug: string;
  title: string;
  excerpt?: string | null;
  body: string;
  cover?: string | null;
  tag?: string | null;
  author?: string | null;
  status?: "published" | "draft";
  publishedAt?: string | null;
}): Promise<number> {
  const status = input.status ?? "published";
  const publishedAt = input.publishedAt ?? (status === "published" ? nowIso() : null);

  if (input.id) {
    await run(
      `UPDATE blog_posts SET slug = ?, title = ?, excerpt = ?, body = ?, cover = ?, tag = ?,
         author = COALESCE(?, author), status = ?, published_at = ? WHERE id = ?`,
      input.slug,
      input.title,
      input.excerpt ?? null,
      input.body,
      input.cover ?? null,
      input.tag ?? null,
      input.author ?? null,
      status,
      publishedAt,
      input.id,
    );
    return input.id;
  }

  const result = await run(
    `INSERT INTO blog_posts (slug, title, excerpt, body, cover, tag, author, status, published_at)
     VALUES (?, ?, ?, ?, ?, ?, COALESCE(?, 'جهان کودک'), ?, ?)`,
    input.slug,
    input.title,
    input.excerpt ?? null,
    input.body,
    input.cover ?? null,
    input.tag ?? null,
    input.author ?? null,
    status,
    publishedAt,
  );
  return result.lastInsertRowid;
}

export async function adminDeletePost(id: number): Promise<void> {
  await run("DELETE FROM blog_posts WHERE id = ?", id);
}

export type AdminComment = {
  id: number;
  postId: number;
  postTitle: string;
  postSlug: string;
  name: string;
  email: string | null;
  body: string;
  status: string;
  createdAt: string;
};

type AdminCommentRow = {
  id: number;
  post_id: number;
  post_title: string;
  post_slug: string;
  name: string;
  email: string | null;
  body: string;
  status: string;
  created_at: string;
};

const ADMIN_COMMENT_SELECT = `SELECT bc.id, bc.post_id, b.title AS post_title, b.slug AS post_slug,
    bc.name, bc.email, bc.body, bc.status, bc.created_at
  FROM blog_comments bc JOIN blog_posts b ON b.id = bc.post_id`;

export async function adminListComments(
  status?: "pending" | "approved" | "rejected",
): Promise<Array<AdminComment>> {
  const rows = status
    ? await all<AdminCommentRow>(
        `${ADMIN_COMMENT_SELECT} WHERE bc.status = ? ORDER BY bc.id DESC`,
        status,
      )
    : await all<AdminCommentRow>(`${ADMIN_COMMENT_SELECT} ORDER BY bc.id DESC`);

  return rows.map((row) => ({
    id: row.id,
    postId: row.post_id,
    postTitle: row.post_title,
    postSlug: row.post_slug,
    name: row.name,
    email: row.email,
    body: row.body,
    status: row.status,
    createdAt: row.created_at,
  }));
}

export async function adminSetCommentStatus(
  id: number,
  status: "pending" | "approved" | "rejected",
): Promise<void> {
  await run("UPDATE blog_comments SET status = ? WHERE id = ?", status, id);
}

export async function adminDeleteComment(id: number): Promise<void> {
  await run("DELETE FROM blog_comments WHERE id = ?", id);
}
