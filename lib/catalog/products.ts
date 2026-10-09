import connectDB from "@/lib/db";
import { CatalogState, Product } from "@/lib/models";
import type { CatalogProduct } from "@/lib/catalog/shared";

export type { CatalogProduct } from "@/lib/catalog/shared";

const DEFAULT_PRODUCTS: Omit<CatalogProduct, "_id">[] = [
  {
    title: "Astra Desk Lamp",
    slug: "astra-desk-lamp",
    description:
      "A sculptural desk lamp with soft ambient light and a clean aluminum frame for modern workspaces.",
    category: "Workspace",
    priceCents: 12900,
    compareAtPriceCents: 15900,
    imageUrl:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
    badges: ["Editor's pick", "New arrival"],
    highlights: ["Dimmable glow", "USB-C power", "Matte finish"],
    rating: 4.9,
    reviewCount: 248,
    isFeatured: true,
    isActive: true,
  },
  {
    title: "Northline Headphones",
    slug: "northline-headphones",
    description:
      "Over-ear headphones tuned for focus, with rich low-end audio and all-day comfort.",
    category: "Audio",
    priceCents: 22900,
    compareAtPriceCents: 25900,
    imageUrl:
      "https://images.unsplash.com/photo-1518441902117-f0a26d7a22a8?auto=format&fit=crop&w=1200&q=80",
    badges: ["Best seller", "Noise canceling"],
    highlights: ["40-hour battery", "Fold-flat travel case", "Spatial audio"],
    rating: 4.8,
    reviewCount: 614,
    isFeatured: true,
    isActive: true,
  },
  {
    title: "Canvas Weekender",
    slug: "canvas-weekender",
    description:
      "A premium carry-all with smart compartments for quick trips, daily essentials, and tech gear.",
    category: "Travel",
    priceCents: 18900,
    compareAtPriceCents: 21900,
    imageUrl:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80",
    badges: ["Traveler favorite", "Limited drop"],
    highlights: ["Water-resistant shell", "Laptop sleeve", "Reinforced straps"],
    rating: 4.7,
    reviewCount: 173,
    isFeatured: false,
    isActive: true,
  },
  {
    title: "Bloom Coffee Set",
    slug: "bloom-coffee-set",
    description:
      "Minimalist pour-over essentials designed to make a quiet ritual feel elevated every morning.",
    category: "Lifestyle",
    priceCents: 7400,
    compareAtPriceCents: 8900,
    imageUrl:
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80",
    badges: ["Giftable", "Staff pick"],
    highlights: ["Ceramic dripper", "Reusable filter", "Gift-ready packaging"],
    rating: 4.8,
    reviewCount: 121,
    isFeatured: false,
    isActive: true,
  },
  {
    title: "Orbit Smart Bottle",
    slug: "orbit-smart-bottle",
    description:
      "A hydration companion that tracks intake, reminds you to sip, and keeps water chilled longer.",
    category: "Wellness",
    priceCents: 5900,
    compareAtPriceCents: 7900,
    imageUrl:
      "https://images.unsplash.com/photo-1526401485004-2fda9f6a8d7f?auto=format&fit=crop&w=1200&q=80",
    badges: ["Smart tech", "Daily essential"],
    highlights: ["App-connected", "Leak-proof cap", "Insulated body"],
    rating: 4.6,
    reviewCount: 94,
    isFeatured: false,
    isActive: true,
  },
  {
    title: "Lumen Wearable Speaker",
    slug: "lumen-wearable-speaker",
    description:
      "A lightweight wearable audio piece for immersive sound while you move through the city.",
    category: "Audio",
    priceCents: 14900,
    compareAtPriceCents: 17900,
    imageUrl:
      "https://images.unsplash.com/photo-1498038432885-c6f3f1e8a9d7?auto=format&fit=crop&w=1200&q=80",
    badges: ["Trending", "Compact"],
    highlights: ["Directional audio", "Water resistant", "Fast charge"],
    rating: 4.5,
    reviewCount: 86,
    isFeatured: false,
    isActive: true,
  },
];

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

async function ensureSeedProducts() {
  await connectDB();
  const state = await CatalogState.findOneAndUpdate(
    { key: "default-products-v1" },
    { $setOnInsert: { key: "default-products-v1" } },
    { upsert: true, new: false },
  ).lean();

  if (state) {
    return;
  }

  await Product.insertMany(DEFAULT_PRODUCTS);
}

export async function getPublicProducts() {
  await ensureSeedProducts();
  const products = (await Product.find({ isActive: true })
    .sort({ isFeatured: -1, createdAt: -1 })
    .lean()) as unknown as Array<Parameters<typeof normalizeProduct>[0]>;

  return products.map(normalizeProduct);
}

export async function getAdminProducts() {
  await ensureSeedProducts();
  const products = (await Product.find()
    .sort({ isFeatured: -1, createdAt: -1 })
    .lean()) as unknown as Array<Parameters<typeof normalizeProduct>[0]>;

  return products.map(normalizeProduct);
}

export async function ensureProductSeed() {
  await ensureSeedProducts();
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

export { DEFAULT_PRODUCTS };
