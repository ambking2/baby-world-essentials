import { cloudflareEnv, envVar, nowIso } from "./db";

/**
 * ذخیره‌سازی تصاویر (تصویر محصول، دسته، مقاله و رسید پرداخت).
 *
 * برای اجرای رایگان روی Cloudflare، اگر R2 در دسترس نباشد فایل‌ها داخل D1
 * ذخیره می‌شوند و از مسیر /uploads/* توسط خود Worker سرو خواهند شد.
 * در اجرای محلی (بدون binding) همان روش قدیمی روی دیسک انجام می‌شود تا تجربه‌ی
 * توسعه عوض نشود.
 */

const MAX_BYTES = 1_800_000;

const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

let d1UploadsReady = false;

export class UploadError extends Error {
  readonly statusCode: number;
  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = "UploadError";
    this.statusCode = statusCode;
  }
}

/** base64 را بدون Buffer به بایت تبدیل می‌کند (Buffer در ورکر نیست). */
function decodeBase64(value: string): Uint8Array {
  const clean = value.includes(",") ? (value.split(",").pop() ?? "") : value;
  let binary: string;
  try {
    binary = atob(clean.replace(/\s+/g, ""));
  } catch {
    throw new UploadError("محتوای تصویر معتبر نیست.");
  }
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

function randomSuffix(): string {
  const bytes = new Uint8Array(4);
  crypto.getRandomValues(bytes);
  let out = "";
  for (const byte of bytes) out += byte.toString(16).padStart(2, "0");
  return out;
}

function asArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
}

function fromDbBlob(value: unknown): Uint8Array | null {
  if (value instanceof Uint8Array) return value;
  if (value instanceof ArrayBuffer) return new Uint8Array(value);
  if (Array.isArray(value)) {
    return Uint8Array.from(value.filter((item): item is number => typeof item === "number"));
  }
  return null;
}

async function ensureD1UploadsTable(): Promise<void> {
  if (d1UploadsReady) return;
  const env = await cloudflareEnv();
  if (!env?.DB) return;
  await env.DB.exec(`
    CREATE TABLE IF NOT EXISTS uploads (
      key TEXT PRIMARY KEY,
      mime_type TEXT NOT NULL,
      content BLOB NOT NULL,
      created_at TEXT NOT NULL
    );
  `);
  d1UploadsReady = true;
}

/** نشانی عمومی یک فایل ذخیره‌شده. */
async function publicUrl(key: string): Promise<string> {
  const base = await envVar("UPLOADS_PUBLIC_URL");
  if (base) return `${base.replace(/\/+$/, "")}/${key}`;
  return `/uploads/${key}`;
}

/**
 * تصویر را ذخیره می‌کند و نشانی قابل نمایش را برمی‌گرداند.
 */
export async function saveImage(
  base64: string,
  mimeType: string,
  prefix: string,
): Promise<string> {
  const extension = EXTENSIONS[mimeType];
  if (!extension) throw new UploadError("فقط تصویر JPG، PNG، WEBP یا GIF قابل بارگزاری است.");

  const bytes = decodeBase64(base64);
  if (bytes.byteLength === 0) throw new UploadError("فایل دریافتی خالی است.");
  if (bytes.byteLength > MAX_BYTES) {
    throw new UploadError("در نسخهٔ رایگان کلودفلر، حجم تصویر نباید بیشتر از ۱.۸ مگابایت باشد.");
  }

  const key = `${prefix}-${Date.now()}-${randomSuffix()}.${extension}`;
  const env = await cloudflareEnv();

  if (env?.UPLOADS) {
    await env.UPLOADS.put(key, bytes as unknown as ArrayBufferView, {
      httpMetadata: { contentType: mimeType, cacheControl: "public, max-age=31536000, immutable" },
    });
    return publicUrl(key);
  }

  if (env?.DB) {
    await ensureD1UploadsTable();
    await env.DB.prepare(
      "INSERT OR REPLACE INTO uploads (key, mime_type, content, created_at) VALUES (?, ?, ?, ?)",
    )
      .bind(key, mimeType, asArrayBuffer(bytes), nowIso())
      .run();
    return publicUrl(key);
  }

  // اجرای محلی: نوشتن روی دیسک در public/uploads
  const [{ mkdir, writeFile }, { resolve }] = await Promise.all([
    import("node:fs/promises"),
    import("node:path"),
  ]);
  const directory = resolve(process.cwd(), "public/uploads");
  await mkdir(directory, { recursive: true });
  await writeFile(resolve(directory, key), bytes);
  return `/uploads/${key}`;
}

/**
 * یک فایل ذخیره‌شده را می‌خواند و پاسخ HTTP می‌سازد.
 *
 * وقتی binding وجود نداشته باشد null برمی‌گرداند تا فایل استاتیک معمولی سرو شود.
 */
export async function uploadResponse(key: string): Promise<Response | null> {
  const env = await cloudflareEnv();

  if (env?.UPLOADS) {
    const object = await env.UPLOADS.get(key);
    if (!object) return null;

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set("etag", object.httpEtag);
    if (!headers.has("cache-control")) {
      headers.set("cache-control", "public, max-age=31536000, immutable");
    }
    return new Response(object.body as unknown as BodyInit, { headers });
  }

  if (env?.DB) {
    await ensureD1UploadsTable();
    const row = await env.DB.prepare("SELECT mime_type, content FROM uploads WHERE key = ?")
      .bind(key)
      .first<{ mime_type?: unknown; content?: unknown }>();
    const body = fromDbBlob(row?.content);
    if (!row || !body) return null;
    return new Response(body, {
      headers: {
        "content-type": typeof row.mime_type === "string" ? row.mime_type : "application/octet-stream",
        "cache-control": "public, max-age=31536000, immutable",
      },
    });
  }

  return null;
}

/** حذف یک تصویر بر اساس نشانی ذخیره‌شده. */
export async function deleteImage(url: string): Promise<void> {
  const key = url.split("/").pop();
  if (!key) return;
  const env = await cloudflareEnv();
  if (env?.UPLOADS) {
    await env.UPLOADS.delete(key);
    return;
  }
  if (env?.DB) {
    await ensureD1UploadsTable();
    await env.DB.prepare("DELETE FROM uploads WHERE key = ?").bind(key).run();
  }
}
