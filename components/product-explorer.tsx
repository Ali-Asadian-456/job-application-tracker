"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Search, Star } from "lucide-react";
import { CatalogProduct, formatProductPrice } from "@/lib/catalog/shared";

interface ProductExplorerProps { products: CatalogProduct[]; }
const SORT_OPTIONS = [
  { id: "featured", label: "منتخب " },
  { id: "price-asc", label: "ارزان‌ترین" },
  { id: "price-desc", label: "گران‌ترین" },
  { id: "rating", label: "محبوب‌ترین" },
] as const;
const artColors = ["lavender", "peach", "blue", "mint", "yellow", "lilac"];
const categoryLabels: Record<string, string> = {
  All: "همه",
  Audio: "صوتی",
  Lifestyle: "سبک زندگی",
  Travel: "سفر",
  Wellness: "سلامت",
  Workspace: "میز و کار",
};

export default function ProductExplorer({ products }: ProductExplorerProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("همه");
  const [sort, setSort] = useState<(typeof SORT_OPTIONS)[number]["id"]>("featured");
  const categories = useMemo(() => ["همه", ...new Set(products.map((p) => p.category))], [products]);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...products].filter((p) => (category === "همه" || p.category === category) && (!q || [p.title, p.description, p.category, ...p.badges].join(" ").toLowerCase().includes(q))).sort((a, b) => sort === "price-asc" ? a.priceCents - b.priceCents : sort === "price-desc" ? b.priceCents - a.priceCents : sort === "rating" ? b.rating - a.rating : Number(b.isFeatured) - Number(a.isFeatured) || b.reviewCount - a.reviewCount);
  }, [category, products, query, sort]);

  return (
    <section className="reference-section catalog-section" id="catalog">
      <div className="reference-section-head">
        <div><span className="reference-eyebrow">از کجا شروع کنم؟</span><h2>بر اساس چیزی که می‌خواهی، نه چیزی که نمی‌شناسی.</h2></div>
        <div className="catalog-tools">
          <label><Search /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="جست‌وجو..." /></label>
          <select className="border border-gray-300 bg-none" aria-label="مرتب‌سازی محصولات" value={sort} onChange={(e) => setSort(e.target.value as (typeof SORT_OPTIONS)[number]["id"])}>{SORT_OPTIONS.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}</select>
        </div>
      </div>
      <div className="category-row catalog-categories">
        {categories.map((item) => <button key={item} type="button" className={category === item ? "reference-chip active" : "reference-chip"} onClick={() => setCategory(item)}>{categoryLabels[item] ?? item}</button>)}
      </div>
      <div className="catalog-subheading">
        {/* <span className="reference-eyebrow">منتخب برای شروع</span> */}
        <h3>چیزهایی که ارزش دیدن دارند</h3>
      </div>
      <div className="reference-product-grid" >
        {filtered.map((product, index) => (
          <article key={product._id} className="reference-product-card">
            <div className={`reference-product-art ${artColors[index % artColors.length]} ${index % 3 === 0 ? "ring-art" : ""}`}>
              <Image
                src={product.imageUrl}
                alt={product.title}
                fill
                sizes="(max-width: 560px) 100vw, (max-width: 800px) 50vw, 33vw"
                className="reference-product-image"
              />
            </div>
            <div className="reference-product-body">
              <div className="product-meta"><span>محصول منتخب</span><em><Star /> {product.rating.toFixed(1)}</em></div>
              <h3>{product.title}</h3>
              <p>{product.description}</p>
              <div className="flex flex-col justify-center items-center gap-4"><strong>{formatProductPrice(product.priceCents)}</strong><Link className="border w-full text-center p-3 bg-gray-100 rounded-2xl" href={`/product/${product.slug}`}>دیدن جزئیات</Link></div>
            </div>
          </article>
        ))}
      </div>
      {!filtered.length && <div className="empty-reference">چیزی با این مشخصات پیدا نشد.</div>}
    </section>
  );
}
