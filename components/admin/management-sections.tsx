"use client";

import { useState, useTransition } from "react";
import { ChevronDown, Package, Users } from "lucide-react";
import ProductManager from "@/components/admin/product-manager";
import ProviderManager from "@/components/admin/provider-manager";
import { loadAdminProducts } from "@/lib/actions/products";
import { loadAdminProviders } from "@/lib/actions/providers";
import type { CatalogProduct } from "@/lib/catalog/shared";
import type { AdminProvider } from "@/lib/catalog/providers";

function Section({
  title,
  icon: Icon,
  children,
  onOpen,
}: {
  title: string;
  icon: typeof Package;
  children: React.ReactNode;
  onOpen: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <section className={`group rounded-2xl border border-slate-200 bg-white/70 p-4 shadow-sm transition-colors ${open ? "border-slate-300 bg-white" : ""}`}>
      <button
        type="button"
        className="w-full cursor-pointer text-right text-lg font-semibold text-slate-950"
        onClick={() => {
          const nextOpen = !open;
          setOpen(nextOpen);
          if (nextOpen) onOpen();
        }}
        aria-expanded={open}
      >
        <span className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Icon className="h-5 w-5" />
            </span>
            <span>{title}</span>
          </span>
          <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
        </span>
      </button>
      {open ? <div className="mt-5 border-t border-slate-100 pt-5">{children}</div> : null}
    </section>
  );
}

export default function ManagementSections() {
  const [products, setProducts] = useState<CatalogProduct[] | null>(null);
  const [providers, setProviders] = useState<AdminProvider[] | null>(null);
  const [productError, setProductError] = useState<string | null>(null);
  const [providerError, setProviderError] = useState<string | null>(null);
  const [loadingProducts, loadProducts] = useTransition();
  const [loadingProviders, loadProviders] = useTransition();

  const productContent = loadingProducts ? (
    <p className="text-sm text-slate-500">در حال دریافت محصولات...</p>
  ) : products ? (
    <ProductManager products={products} />
  ) : (
    <p className="text-sm text-slate-500">برای دریافت محصولات، این بخش را باز کنید.</p>
  );
  const providerContent = loadingProviders ? (
    <p className="text-sm text-slate-500">در حال دریافت نمایندگان...</p>
  ) : providers ? (
    <ProviderManager providers={providers} />
  ) : (
    <p className="text-sm text-slate-500">برای دریافت نمایندگان، این بخش را باز کنید.</p>
  );

  return (
    <>
      <Section
        title="کاتالوگ محصولات"
        icon={Package}
        onOpen={() => {
          if (products || loadingProducts) return;
          setProductError(null);
          loadProducts(() => {
            void loadAdminProducts().then((result) => {
              if (result.error) setProductError(result.error);
              else setProducts(result.products);
            });
          });
        }}
      >
        {productError ? <p role="alert" className="text-sm text-red-600">{productError}</p> : productContent}
      </Section>
      <Section
        title="نمایندگان خدمات"
        icon={Users}
        onOpen={() => {
          if (providers || loadingProviders) return;
          setProviderError(null);
          loadProviders(() => {
            void loadAdminProviders().then((result) => {
              if (result.error) setProviderError(result.error);
              else setProviders(result.providers);
            });
          });
        }}
      >
        {providerError ? <p role="alert" className="text-sm text-red-600">{providerError}</p> : providerContent}
      </Section>
    </>
  );
}
