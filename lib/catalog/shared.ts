export interface CatalogProduct {
  _id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  priceCents: number;
  compareAtPriceCents?: number | null;
  imageUrl: string;
  badges: string[];
  highlights: string[];
  rating: number;
  reviewCount: number;
  isFeatured: boolean;
  isActive: boolean;
}

export function formatProductPrice(priceCents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(priceCents / 100);
}

export function toProductFormValues(product?: CatalogProduct) {
  return {
    title: product?.title ?? "",
    category: product?.category ?? "",
    description: product?.description ?? "",
    priceCents: product ? String(product.priceCents) : "",
    compareAtPriceCents:
      product?.compareAtPriceCents != null
        ? String(product.compareAtPriceCents)
        : "",
    imageUrl: product?.imageUrl ?? "",
    badges: product?.badges?.join(", ") ?? "",
    highlights: product?.highlights?.join("\n") ?? "",
    rating: product ? String(product.rating) : "4.8",
    reviewCount: product ? String(product.reviewCount) : "0",
    isFeatured: product?.isFeatured ?? false,
    isActive: product?.isActive ?? true,
  };
}
