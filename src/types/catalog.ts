export type Category = {
  slug: string;
  title: string;
  note: string;
  image: string;
};

export type ProductTag = "offer" | "new" | "best";

export type Product = {
  id: string;
  slug: string;
  title: string;
  brand: string;
  categorySlug: string;
  categoryTitle: string;
  price: number;
  oldPrice?: number;
  image: string;
  rating: number;
  reviewCount: number;
  stock: number;
  tags: ProductTag[];
  madeInWorkshop?: boolean;
};

export function discountPercent(product: Product): number {
  if (!product.oldPrice || product.oldPrice <= product.price) return 0;
  return Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100);
}
