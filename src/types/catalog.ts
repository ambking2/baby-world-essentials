export type Category = {
  slug: string;
  title: string;
  note: string;
  image: string;
};

export type ProductTag = "offer" | "new" | "best" | "featured";

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

export type ProductSpec = { label: string; value: string };

export type ProductReview = {
  id: string;
  author: string;
  city: string;
  rating: number;
  date: string;
  body: string;
  verified: boolean;
};

export type ProductFaq = { q: string; a: string };

export type ProductDetail = {
  sku: string;
  gallery: string[];
  description: string[];
  specs: ProductSpec[];
  highlights: string[];
  faqs: ProductFaq[];
  reviews: ProductReview[];
};

export type ProductWithDetail = Product & { detail: ProductDetail };

export type AgeGroup = {
  slug: string;
  label: string;
  note: string;
  /** Tailwind background class used for the age bubble. */
  color: string;
};

export type Brand = { slug: string; title: string; note: string };

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  cover?: string;
  author: string;
  readMinutes: number;
  body: string[];
};
