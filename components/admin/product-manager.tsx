"use client";

import { useActionState, useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2 } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  CatalogProduct,
  formatProductPrice,
  toProductFormValues,
} from "@/lib/catalog/shared";
import { deleteProduct, saveProduct } from "@/lib/actions/products";

interface ProductManagerProps {
  products: CatalogProduct[];
}

function ProductEditorDialog({
  open,
  onOpenChange,
  product,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: CatalogProduct | null;
}) {
  const router = useRouter();
  const [state, action, pending] = useActionState(saveProduct, {
    error: null,
    success: false,
  });
  const initialValues = useMemo(() => toProductFormValues(product ?? undefined), [product]);

  useEffect(() => {
    if (state.success) {
      router.refresh();
      onOpenChange(false);
    }
  }, [onOpenChange, router, state.success]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{product ? "ویرایش محصول" : "افزودن محصول"}</DialogTitle>
          <DialogDescription>
            جزئیات، تصویر و اطلاعات کشف‌پذیری محصول را برای کاتالوگ عمومی مدیریت کن.
          </DialogDescription>
        </DialogHeader>

        <form key={product?._id ?? "new"} action={action} className="space-y-5">
          {product ? <input type="hidden" name="productId" value={product._id} /> : null}

          {state.error ? (
            <p role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {state.error}
            </p>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="title">عنوان</Label>
              <Input id="title" name="title" defaultValue={initialValues.title} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">دسته‌بندی</Label>
              <Input id="category" name="category" defaultValue={initialValues.category} required />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="priceCents">قیمت (سنت)</Label>
              <Input
                id="priceCents"
                name="priceCents"
                type="number"
                min="0"
                step="1"
                defaultValue={initialValues.priceCents}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="compareAtPriceCents">قیمت قبلی (سنت)</Label>
              <Input
                id="compareAtPriceCents"
                name="compareAtPriceCents"
                type="number"
                min="0"
                step="1"
                defaultValue={initialValues.compareAtPriceCents}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="imageUrl">آدرس تصویر</Label>
            <Input
              id="imageUrl"
              name="imageUrl"
              type="url"
              defaultValue={initialValues.imageUrl}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">توضیحات</Label>
            <Textarea
              id="description"
              name="description"
              rows={4}
              defaultValue={initialValues.description}
              required
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="badges">برچسب‌ها</Label>
              <Input
                id="badges"
                name="badges"
                placeholder="انتخاب ویژه، تازه‌وارد"
                defaultValue={initialValues.badges}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="highlights">ویژگی‌ها</Label>
              <Textarea
                id="highlights"
                name="highlights"
                rows={4}
                placeholder="شارژ سریع، مقاوم در برابر آب"
                defaultValue={initialValues.highlights}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="rating">امتیاز</Label>
              <Input
                id="rating"
                name="rating"
                type="number"
                min="0"
                max="5"
                step="0.1"
                defaultValue={initialValues.rating}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="reviewCount">تعداد بازخورد</Label>
              <Input
                id="reviewCount"
                name="reviewCount"
                type="number"
                min="0"
                step="1"
                defaultValue={initialValues.reviewCount}
                required
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                name="isFeatured"
                defaultChecked={initialValues.isFeatured}
                className="h-4 w-4 rounded border-slate-300"
              />
              ویژه
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                name="isActive"
                defaultChecked={initialValues.isActive}
                className="h-4 w-4 rounded border-slate-300"
              />
              فعال
            </label>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              لغو
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "در حال ذخیره..." : "ذخیره محصول"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DeleteProductButton({
  productId,
  title,
}: {
  productId: string;
  title: string;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="destructive"
        disabled={pending}
        onClick={() => {
          if (!window.confirm(`حذف «${title}»؟`)) {
            return;
          }

          setError(null);
          startTransition(() => {
            void deleteProduct(productId).then((result) => {
              if (result.error) {
                setError(result.error);
              }
            });
          });
        }}
      >
        <Trash2 className="mr-2 h-4 w-4" />
        {pending ? "در حال حذف..." : "حذف"}
      </Button>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}

export default function ProductManager({ products }: ProductManagerProps) {
  const [open, setOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<CatalogProduct | null>(null);

  const stats = useMemo(
    () => ({
      total: products.length,
      featured: products.filter((product) => product.isFeatured).length,
      categories: new Set(products.map((product) => product.category)).size,
      active: products.filter((product) => product.isActive).length,
    }),
    [products],
  );

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "محصولات", value: stats.total },
          { label: "ویژه", value: stats.featured },
          { label: "دسته‌ها", value: stats.categories },
          { label: "فعال", value: stats.active },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <p className="text-sm text-slate-500">{stat.label}</p>
            <p className="mt-2 text-3xl font-semibold text-slate-950">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">نمای کلی کاتالوگ</h2>
            <p className="text-sm text-slate-600">
              محصولاتی را مدیریت کن که در صفحه اصلی نمایش داده می‌شوند.
            </p>
          </div>
          <Button
            onClick={() => {
              setSelectedProduct(null);
              setOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            افزودن محصول
          </Button>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          {products.map((product) => (
            <article
              key={product._id}
              className="flex flex-col gap-4 rounded-3xl border border-slate-200 p-4 md:flex-row"
            >
              <Image
                src={product.imageUrl}
                alt={product.title}
                width={320}
                height={320}
                className="h-48 w-full rounded-2xl object-cover md:h-40 md:w-40"
              />

              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                    {product.category}
                  </span>
                  {product.isFeatured ? (
                    <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                      ویژه
                    </span>
                  ) : null}
                  {!product.isActive ? (
                    <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-700">
                      مخفی
                    </span>
                  ) : null}
                </div>

                <h3 className="mt-3 text-lg font-semibold text-slate-950">
                  {product.title}
                </h3>
                <p className="mt-2 line-clamp-3 text-sm text-slate-600">
                  {product.description}
                </p>
                <p className="mt-3 text-sm font-medium text-slate-950">
                  {formatProductPrice(product.priceCents)}
                </p>
              </div>

              <div className="flex flex-row gap-2 md:flex-col">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setSelectedProduct(product);
                    setOpen(true);
                  }}
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  ویرایش
                </Button>
                <DeleteProductButton productId={product._id} title={product.title} />
              </div>
            </article>
          ))}
        </div>
      </div>

      <ProductEditorDialog
        key={`${selectedProduct?._id ?? "new"}-${open ? "open" : "closed"}`}
        open={open}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen);
          if (!nextOpen) {
            setSelectedProduct(null);
          }
        }}
        product={selectedProduct}
      />
    </div>
  );
}
