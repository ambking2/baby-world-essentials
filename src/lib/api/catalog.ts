import { queryOptions } from "@tanstack/react-query";

import { categories, products } from "@/data/catalog";
import type { Category, Product, ProductTag } from "@/types/catalog";

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
