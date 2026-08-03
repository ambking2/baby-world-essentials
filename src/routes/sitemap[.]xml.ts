import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

import {
  fetchAgeGroups,
  fetchBrands,
  fetchCategories,
  fetchPosts,
  fetchProducts,
} from "@/lib/api/catalog";

const BASE_URL = "https://baby-world-essentials.lovable.app";

interface SitemapEntry {
  path: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries: SitemapEntry[] = [
          { path: "/", changefreq: "weekly", priority: "1.0" },
          { path: "/shop", changefreq: "weekly", priority: "0.9" },
          { path: "/categories", changefreq: "monthly", priority: "0.9" },
          { path: "/offers", changefreq: "weekly", priority: "0.9" },
          { path: "/blog", changefreq: "monthly", priority: "0.7" },
          { path: "/brands", changefreq: "monthly", priority: "0.6" },
          { path: "/about", changefreq: "monthly", priority: "0.6" },
          { path: "/contact", changefreq: "monthly", priority: "0.6" },
        ];

        const [categories, ageGroups, posts, products, brands] = await Promise.all([
          fetchCategories(),
          fetchAgeGroups(),
          fetchPosts(),
          fetchProducts(),
          fetchBrands(),
        ]);

        for (const category of categories) {
          entries.push({
            path: `/category/${category.slug}`,
            changefreq: "weekly",
            priority: "0.7",
          });
        }

        for (const age of ageGroups) {
          entries.push({
            path: `/age/${age.slug}`,
            changefreq: "monthly",
            priority: "0.6",
          });
        }

        for (const post of posts) {
          entries.push({
            path: `/blog/${post.slug}`,
            changefreq: "monthly",
            priority: "0.7",
          });
        }

        for (const product of products) {
          entries.push({
            path: `/product/${product.slug}`,
            changefreq: "weekly",
            priority: "0.8",
          });
        }

        for (const brand of brands) {
          entries.push({
            path: `/shop?brand=${brand.slug}`,
            changefreq: "monthly",
            priority: "0.5",
          });
        }

        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
