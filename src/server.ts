import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import { ensureSchema } from "./server/db";
import { uploadResponse } from "./server/uploads";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;
let schemaReadyPromise: Promise<void> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

async function ensureAppSchema(): Promise<void> {
  if (!schemaReadyPromise) {
    schemaReadyPromise = ensureSchema();
  }
  await schemaReadyPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

/**
 * تصاویر بارگزاری‌شده روی Cloudflare داخل D1/R2 هستند، نه در پوشه‌ی public.
 * پس درخواست‌های /uploads/* را پیش از رسیدن به روتر اپ، مستقیم پاسخ می‌دهیم.
 */
async function serveUpload(request: Request): Promise<Response | null> {
  if (request.method !== "GET" && request.method !== "HEAD") return null;

  const { pathname } = new URL(request.url);
  if (!pathname.startsWith("/uploads/")) return null;

  const key = decodeURIComponent(pathname.slice("/uploads/".length));
  // از خروج از مسیر جلوگیری می‌کند.
  if (key.length === 0 || key.includes("..") || key.includes("/")) return null;

  try {
    return await uploadResponse(key);
  } catch (error) {
    console.error(error);
    return null;
  }
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const upload = await serveUpload(request);
      if (upload) return upload;

      await ensureAppSchema();

      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
