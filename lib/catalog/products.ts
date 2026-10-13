import connectDB from "@/lib/db";
import { Product } from "@/lib/models";
import { cacheLife, cacheTag } from "next/cache";
import type { CatalogProduct } from "@/lib/catalog/shared";

export type { CatalogProduct } from "@/lib/catalog/shared";

function normalizeProduct(product: {
  _id: unknown;
  title: string;
  slug: string;
  description: string;
  category: string;
  priceCents: number;
  compareAtPriceCents?: number | null;
  imageUrl: string;
  badges?: string[];
  highlights?: string[];
  rating: number;
  reviewCount: number;
  isFeatured: boolean;
  isActive: boolean;
}): CatalogProduct {
  return {
    _id: String(product._id),
    title: product.title,
    slug: product.slug,
    description: product.description,
    category: product.category,
    priceCents: product.priceCents,
    compareAtPriceCents: product.compareAtPriceCents ?? null,
    imageUrl: product.imageUrl,
    badges: product.badges ?? [],
    highlights: product.highlights ?? [],
    rating: product.rating,
    reviewCount: product.reviewCount,
    isFeatured: product.isFeatured,
    isActive: product.isActive,
  };
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function getPublicProducts() {
  "use cache";

  cacheLife("hours");
  cacheTag("products");

  await connectDB();
  const products = (await Product.find({ isActive: true })
    .sort({ isFeatured: -1, createdAt: -1 })
    .lean()) as unknown as Array<Parameters<typeof normalizeProduct>[0]>;

  return products.map(normalizeProduct);
}

export async function getPublicProductBySlug(slug: string) {
  "use cache";

  cacheLife("hours");
  cacheTag("products");

  await connectDB();
  const product = (await Product.findOne({ slug, isActive: true }).lean()) as
    | Parameters<typeof normalizeProduct>[0]
    | null;

  return product ? normalizeProduct(product) : null;
}

export async function getAdminProducts() {
  "use cache";

  cacheLife("hours");
  cacheTag("products");

  await connectDB();
  const products = (await Product.find()
    .sort({ isFeatured: -1, createdAt: -1 })
    .lean()) as unknown as Array<Parameters<typeof normalizeProduct>[0]>;

  return products.map(normalizeProduct);
}

export function isValidHttpsImageUrl(value: string) {
  if (/^\/img\/[a-zA-Z0-9._-]+$/.test(value)) {
    return true;
  }

  try {
    const url = new URL(value);
    return url.protocol === "https:" && Boolean(url.hostname);
  } catch {
    return false;
  }
}
