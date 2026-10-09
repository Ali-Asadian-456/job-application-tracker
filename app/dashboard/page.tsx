import { getSession } from "@/lib/auth/auth";
import { getAdminProducts } from "@/lib/catalog/products";
import { redirect } from "next/navigation";
import ProductManager from "@/components/admin/product-manager";
import { isAdminUser } from "@/lib/auth/roles";

export default async function Dashboard() {
  const session = await getSession();
  if (!session?.user || !isAdminUser(session.user)) {
    redirect("/");
  }

  const products = await getAdminProducts();

  return (
    <div dir="rtl" className="min-h-screen bg-[#f8f7f3]">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8 flex flex-col gap-3">
          <p className="text-sm font-medium tracking-[0.3em] text-primary">
            پنل مدیریت
          </p>
          <h1 className="text-3xl font-semibold text-slate-950">
            مدیریت کاتالوگ محصولات
          </h1>
          <p className="max-w-2xl text-slate-600">
            محصول اضافه کن، ویرایش کن، ویژه‌اش کن یا از ویترین عمومی خارجش کن.
          </p>
        </div>
        <ProductManager products={products} />
      </div>
    </div>
  );
}
