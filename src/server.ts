import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import { seedIfEmpty } from "./server/seed";
import { uploadResponse } from "./server/uploads";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

type PlaceholderTheme = {
  title: string;
  subtitle: string;
  colorA: string;
  colorB: string;
  accent: string;
};

const imageThemes: Record<string, PlaceholderTheme> = {
  "cat-furniture.jpg": {
    title: "سرویس خواب نوزاد",
    subtitle: "جهان کودک",
    colorA: "#fde7d9",
    colorB: "#f7c9a8",
    accent: "#a85d2a",
  },
  "cat-dresser.jpg": {
    title: "دراور و کمد",
    subtitle: "جهان کودک",
    colorA: "#f3ecff",
    colorB: "#dcc9ff",
    accent: "#6f52b5",
  },
  "cat-clothing.jpg": {
    title: "لباس نوزاد",
    subtitle: "جهان کودک",
    colorA: "#ffe9f0",
    colorB: "#ffc8d8",
    accent: "#b84d74",
  },
  "cat-stroller.jpg": {
    title: "کالسکه و کریر",
    subtitle: "جهان کودک",
    colorA: "#e6f3ff",
    colorB: "#c1e1ff",
    accent: "#266ea8",
  },
  "cat-feeding.jpg": {
    title: "شیردهی و تغذیه",
    subtitle: "جهان کودک",
    colorA: "#fff5df",
    colorB: "#ffe3a6",
    accent: "#ac7a14",
  },
  "cat-toys.jpg": {
    title: "اسباب‌بازی",
    subtitle: "جهان کودک",
    colorA: "#e6fff3",
    colorB: "#c0f1da",
    accent: "#2d8a61",
  },
  "hero-nursery.jpg": {
    title: "اتاق کودک",
    subtitle: "جهان کودک",
    colorA: "#eef7ff",
    colorB: "#d6e8ff",
    accent: "#4a73b8",
  },
  "workshop.jpg": {
    title: "کارگاه تولید",
    subtitle: "جهان کودک",
    colorA: "#f6efe5",
    colorB: "#e6d5bf",
    accent: "#8b5a2b",
  },
};

let serverEntryPromise: Promise<ServerEntry> | undefined;
let bootstrapPromise: Promise<void> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

async function ensureAppReady(): Promise<void> {
  if (!bootstrapPromise) {
    bootstrapPromise = seedIfEmpty().then(() => undefined);
  }
  await bootstrapPromise;
}

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function fallbackTheme(name: string): PlaceholderTheme {
  return (
    imageThemes[name] ?? {
      title: "جهان کودک",
      subtitle: name.replace(/\.[^.]+$/, "").replaceAll("-", " "),
      colorA: "#f4f0ea",
      colorB: "#e3d7c8",
      accent: "#8b6b4a",
    }
  );
}

function renderPlaceholderImage(name: string): string {
  const theme = fallbackTheme(name);
  const title = escapeXml(theme.title);
  const subtitle = escapeXml(theme.subtitle);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1000" viewBox="0 0 1600 1000" role="img" aria-label="${title}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${theme.colorA}" />
      <stop offset="100%" stop-color="${theme.colorB}" />
    </linearGradient>
  </defs>
  <rect width="1600" height="1000" fill="url(#bg)" />
  <circle cx="1280" cy="220" r="110" fill="${theme.accent}" opacity="0.18" />
  <circle cx="310" cy="180" r="70" fill="${theme.accent}" opacity="0.12" />
  <rect x="180" y="220" rx="44" ry="44" width="1240" height="560" fill="#ffffff" opacity="0.56" />
  <text x="800" y="470" text-anchor="middle" font-size="92" font-weight="700" fill="${theme.accent}" font-family="Tahoma, Arial, sans-serif">${title}</text>
  <text x="800" y="560" text-anchor="middle" font-size="42" fill="${theme.accent}" opacity="0.88" font-family="Tahoma, Arial, sans-serif">${subtitle}</text>
  <text x="800" y="660" text-anchor="middle" font-size="30" fill="${theme.accent}" opacity="0.72" font-family="Tahoma, Arial, sans-serif">baby-world-essentials</text>
</svg>`;
}

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

async function serveUpload(request: Request): Promise<Response | null> {
  if (request.method !== "GET" && request.method !== "HEAD") return null;

  const { pathname } = new URL(request.url);
  if (!pathname.startsWith("/uploads/")) return null;

  const key = decodeURIComponent(pathname.slice("/uploads/".length));
  if (key.length === 0 || key.includes("..") || key.includes("/")) return null;

  try {
    return await uploadResponse(key);
  } catch (error) {
    console.error(error);
    return null;
  }
}

async function serveFallbackImage(request: Request): Promise<Response | null> {
  if (request.method !== "GET" && request.method !== "HEAD") return null;

  const { pathname } = new URL(request.url);
  if (!pathname.startsWith("/images/")) return null;

  const name = decodeURIComponent(pathname.slice("/images/".length));
  if (name.length === 0 || name.includes("..") || name.includes("/")) return null;

  const body = renderPlaceholderImage(name);
  return new Response(request.method === "HEAD" ? null : body, {
    headers: {
      "content-type": "image/svg+xml; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const upload = await serveUpload(request);
      if (upload) return upload;

      const image = await serveFallbackImage(request);
      if (image) return image;

      await ensureAppReady();

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
