/**
 * تعریف‌های حداقلی برای bindingهای Cloudflare.
 *
 * به‌جای نصب @cloudflare/workers-types این فایل را دستی نگه می‌داریم تا هیچ
 * پکیج تازه‌ای به package.json اضافه نشود (نصب روی Lovable با --frozen-lockfile
 * انجام می‌شود و هر دپندنسی جدید بیلد را می‌شکند).
 */

export type D1Value = string | number | null | ArrayBuffer;

export interface D1Meta {
  changes: number;
  last_row_id: number;
  rows_read?: number;
  rows_written?: number;
}

export interface D1Result<T = Record<string, unknown>> {
  success: boolean;
  results: Array<T>;
  meta: D1Meta;
}

export interface D1PreparedStatement {
  bind(...values: Array<D1Value>): D1PreparedStatement;
  all<T = Record<string, unknown>>(): Promise<D1Result<T>>;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  run<T = Record<string, unknown>>(): Promise<D1Result<T>>;
}

export interface D1Database {
  prepare(query: string): D1PreparedStatement;
  batch<T = Record<string, unknown>>(
    statements: Array<D1PreparedStatement>,
  ): Promise<Array<D1Result<T>>>;
  exec(query: string): Promise<{ count: number; duration: number }>;
}

export interface R2HttpMetadata {
  contentType?: string;
  cacheControl?: string;
}

export interface R2Object {
  key: string;
  size: number;
  etag: string;
  httpEtag: string;
  uploaded: Date;
  httpMetadata?: R2HttpMetadata;
  writeHttpMetadata(headers: Headers): void;
}

export interface R2ObjectBody extends R2Object {
  body: ReadableStream;
  arrayBuffer(): Promise<ArrayBuffer>;
}

export interface R2Bucket {
  get(key: string): Promise<R2ObjectBody | null>;
  put(
    key: string,
    value: ArrayBuffer | ArrayBufferView | ReadableStream | string | null,
    options?: { httpMetadata?: R2HttpMetadata },
  ): Promise<R2Object | null>;
  delete(key: string | Array<string>): Promise<void>;
  head(key: string): Promise<R2Object | null>;
}

/** bindingها و متغیرهای محیطی ورکر. */
export interface CloudflareEnv {
  DB?: D1Database;
  UPLOADS?: R2Bucket;
  SITE_URL?: string;
  UPLOADS_PUBLIC_URL?: string;
  AUTH_SECRET?: string;
  MAIL_API_KEY?: string;
  MAIL_FROM?: string;
  [key: string]: unknown;
}

/**
 * ماژول مجازی ورکر. فقط داخل رانتایم Cloudflare وجود دارد، پس همه‌جا با
 * import داینامیک و داخل try/catch مصرف می‌شود.
 */
declare module "cloudflare:workers" {
  export const env: CloudflareEnv;
}
