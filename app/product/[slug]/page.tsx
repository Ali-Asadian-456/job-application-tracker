import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";
import { notFound } from "next/navigation";
import { formatProductPrice, type CatalogProduct } from "@/lib/catalog/shared";
import { getPublicProductBySlug } from "@/lib/catalog/products";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

async function loadProduct(params: ProductPageProps["params"]) {
  const { slug } = await params;
  return getPublicProductBySlug(slug);
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = await loadProduct(params);
  return product
    ? { title: product.title, description: product.description }
    : { title: "محصول پیدا نشد" };
}

function ProductDetails({ product }: { product: CatalogProduct }) {
  return (
    <main dir="rtl" className="min-h-screen bg-[#f8f7f3] px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-950">
          <ArrowRight className="h-4 w-4" />
          بازگشت به محصولات
        </Link>
        <article className="grid overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm lg:grid-cols-2">
          <div className="relative min-h-[24rem] bg-slate-100 lg:min-h-[38rem]">
            <Image
              src={product.imageUrl}
              alt={product.title}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <div className="flex flex-col justify-center p-8 md:p-12">
            <span className="mb-4 text-sm font-medium text-slate-500">{product.category}</span>
            <div className="mb-3 flex items-center gap-2 text-amber-600">
              <Star className="h-5 w-5 fill-current" />
              <span>{product.rating.toFixed(1)} ({product.reviewCount} بازخورد)</span>
            </div>
            <h1 className="text-4xl font-semibold text-slate-950">{product.title}</h1>
            <p className="mt-6 leading-8 text-slate-600">{product.description}</p>
            <strong className="mt-8 text-3xl text-slate-950">{formatProductPrice(product.priceCents)}</strong>
            {product.highlights.length ? (
              <ul className="mt-8 grid gap-3 text-slate-700 sm:grid-cols-2">
                {product.highlights.map((highlight) => <li key={highlight}>• {highlight}</li>)}
              </ul>
            ) : null}
            {product.badges.length ? (
              <div className="mt-8 flex flex-wrap gap-2">
                {product.badges.map((badge) => <span key={badge} className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">{badge}</span>)}
              </div>
            ) : null}
          </div>
        </article>
      </div>
    </main>
  );
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await loadProduct(params);
  if (!product) notFound();
  return <ProductDetails product={product} />;
}
