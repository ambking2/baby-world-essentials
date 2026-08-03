import { queryOptions } from "@tanstack/react-query";

import { categories, products } from "@/data/catalog";
import type { Category, Product, ProductTag, ProductWithDetail } from "@/types/catalog";

/**
 * Data access layer.
 * Every function is async and returns plain DTOs, so swapping the local
 * catalog for a real backend only means changing the body of these functions
 * (e.g. `await fetch('/api/products?tag=offer')`).
 */

export async function fetchCategories(): Promise<Category[]> {
  return categories;
}

export type ProductQuery = {
  tag?: ProductTag;
  categorySlug?: string;
  limit?: number;
};

export async function fetchProducts(query: ProductQuery = {}): Promise<Product[]> {
  let result = products;
  if (query.tag) result = result.filter((p) => p.tags.includes(query.tag!));
  if (query.categorySlug) result = result.filter((p) => p.categorySlug === query.categorySlug);
  return typeof query.limit === "number" ? result.slice(0, query.limit) : result;
}

export const categoriesQuery = () =>
  queryOptions({ queryKey: ["categories"], queryFn: () => fetchCategories() });

export const productsQuery = (query: ProductQuery = {}) =>
  queryOptions({ queryKey: ["products", query], queryFn: () => fetchProducts(query) });

export async function fetchProduct(slug: string): Promise<ProductWithDetail | null> {
  const { productDetails } = await import("@/data/product-details");
  const product = products.find((p) => p.slug === slug);
  const detail = productDetails[slug];
  if (!product || !detail) return null;
  return { ...product, detail };
}

export async function fetchRelatedProducts(slug: string, limit = 5): Promise<Product[]> {
  const product = products.find((p) => p.slug === slug);
  if (!product) return [];
  const sameCategory = products.filter(
    (p) => p.categorySlug === product.categorySlug && p.slug !== slug,
  );
  const rest = products.filter(
    (p) => p.categorySlug !== product.categorySlug && p.slug !== slug,
  );
  return [...sameCategory, ...rest].slice(0, limit);
}

export const productQuery = (slug: string) =>
  queryOptions({ queryKey: ["product", slug], queryFn: () => fetchProduct(slug) });

export const relatedProductsQuery = (slug: string, limit = 5) =>
  queryOptions({
    queryKey: ["products", "related", slug, limit],
    queryFn: () => fetchRelatedProducts(slug, limit),
  });
