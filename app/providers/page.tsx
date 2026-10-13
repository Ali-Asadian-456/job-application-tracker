import Image from "next/image";
import Link from "next/link";
import mongoose from "mongoose";
import { ArrowLeft, Box, Check, Sparkles, Star } from "lucide-react";
import { cacheLife, cacheTag } from "next/cache";
import connectDB from "@/lib/db";

export const instant = false;

const PAGE_SIZE = 12;

const benefits = [
  ["دیده شو", "خدماتت را جلوی چشم کسانی قرار بده که به آن نیاز دارند."],
  ["اعتماد بساز", "نمونه‌کارها و تخصصت را در یک صفحه‌ی حرفه‌ای معرفی کن."],
  ["رشد کن", "مشتری‌های جدید پیدا کن و ارتباط‌های ارزشمند بساز."],
];

function normalizeProvider(raw: Record<string, unknown>) {
  const tags = Array.isArray(raw.tags) ? raw.tags.filter(Boolean).map(String) : [];
  const username = typeof raw.username === "string" && raw.username ? raw.username : typeof raw.id === "string" ? raw.id : "provider";
  const followersValue = raw.followers;
  const followers = Number(typeof followersValue === "string" ? followersValue.replace(/[^\d]/g, "") : followersValue ?? 0);

  return {
    id: String(raw._id?.toString?.() ?? raw.id ?? username),
    name: username,
    category: tags[0] || "خدمات تخصصی",
    tags,
    description: typeof raw.notes === "string" && raw.notes ? raw.notes : tags.join(" • ") || "ارائه‌کننده خدمات با تجربه و تخصص بالا.",
    initials: username.slice(0, 2).toUpperCase(),
    avatar: typeof raw.avatar === "string" ? raw.avatar : "",
    city: typeof raw.city === "string" && raw.city ? raw.city : "موقعیت نامشخص",
    followers,
    url: typeof raw.originalUrl === "string" ? raw.originalUrl : "/providers",
    starred: Boolean(raw.starred),
    status: typeof raw.status === "string" ? raw.status : "none",
    color: ["bg-[#e6e1ff]", "bg-[#ffeddf]", "bg-[#dcf2fa]", "bg-[#def5e8]", "bg-[#f0e3ff]"][Math.abs(username.length) % 5],
  };
}

export const metadata = {
  title: "ارائه‌دهندگان خدمات | تری‌دیوم",
  description: "ارائه‌دهندگان خدمات خلاق و متخصص را در تری‌دیوم پیدا کنید.",
};

async function getProvidersPage(pageParam?: string, selectedTag?: string) {
  "use cache";

  cacheLife("hours");
  cacheTag("providers");

  await connectDB();

  const db = mongoose.connection.db;
  if (!db) {
    return { items: [], total: 0, page: 1, totalPages: 1, availableTags: [] };
  }

  const page = Math.max(1, Number(pageParam) || 1);
  const collection = db.collection("providers");
  const availableTags = (await collection.distinct("tags"))
    .filter((tag): tag is string => typeof tag === "string" && Boolean(tag.trim()))
    .map((tag) => tag.trim())
    .sort((a, b) => a.localeCompare(b, "fa"));
  const filter = selectedTag ? { tags: selectedTag } : {};
  const total = await collection.countDocuments(filter);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  const docs = await collection
    .find(filter)
    .sort({ starred: -1, followers: -1, username: 1 })
    .skip((safePage - 1) * PAGE_SIZE)
    .limit(PAGE_SIZE)
    .toArray();

  return {
    items: docs.map((doc) => normalizeProvider(doc as Record<string, unknown>)),
    total,
    page: safePage,
    totalPages,
    availableTags,
  };
}

export default async function ProvidersPage({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string; tag?: string }> | { page?: string; tag?: string };
}) {
  const resolvedParams = await Promise.resolve(searchParams ?? {});
  const currentPage = Number(resolvedParams.page) || 1;
  const selectedTag = typeof resolvedParams.tag === "string" ? resolvedParams.tag.trim() : "";
  const { items, total, page, totalPages, availableTags } = await getProvidersPage(
    String(currentPage),
    selectedTag,
  );

  return (
    <main dir="rtl" className="tridium-page">
      <section className="reference-section grid min-h-[460px] grid-cols-1 items-center gap-12 py-16 md:grid-cols-[1.1fr_.9fr] md:py-24">
        <div className="max-w-xl">
          <span className="reference-eyebrow">
            <Sparkles className="ml-1 h-3.5 w-3.5 text-[#6957ff]" />
            شبکه‌ی متخصصان تری‌دیوم
          </span>
          <h1 className="reference-h1 mt-6">
            برای هر ایده،
            <br />
            <span>یک متخصص هست.</span>
          </h1>
          <p className="reference-lede">
            از طراحی تا ساخت و اجرا، ارائه‌دهندگان خدمات خلاق را پیدا کن و
            پروژه‌ات را با خیال راحت به آدم‌های درست بسپار.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="#providers" className="light-button bg-[#111216] text-white">
              دیدن ارائه‌دهندگان
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <Link href="/sign-up" className="reference-nav-button px-5 py-3">
              معرفی خدمات من
            </Link>
          </div>
        </div>

        <div className="relative mx-auto flex aspect-square w-full max-w-[410px] items-center justify-center overflow-hidden rounded-[28px] bg-[#6957ff] shadow-[0_25px_70px_rgba(31,24,100,.22)]">
          <div className="absolute h-64 w-64 rounded-full border border-white/20" />
          <div className="absolute h-80 w-80 rounded-full border border-white/10" />
          <div className="relative z-10 w-[72%] rotate-[-4deg] rounded-2xl border-4 border-white/80 bg-white p-5 shadow-2xl">
            <div className="mb-8 flex items-center justify-between">
              <span className="rounded-full bg-[#baff00] px-3 py-1 text-[10px] font-bold">
                متخصص منتخب
              </span>
              <Check className="h-5 w-5 text-[#6957ff]" />
            </div>
            <div className="mb-3 h-24 rounded-xl bg-[#e6e1ff]" />
            <strong className="text-sm">پروژه‌ات را به متخصص بسپار</strong>
            <p className="mt-2 text-xs leading-7 text-[#858188]">
              ارتباط مستقیم، نمونه‌کارهای واقعی و انتخابی مطمئن.
            </p>
          </div>
        </div>
      </section>

      <section className="signal-strip">
        <div className="signal-grid">
          {benefits.map(([title, text]) => (
            <div key={title}>
              <strong>{title}</strong>
              <span>{text}</span>
            </div>
          ))}
        </div>
      </section>

      <section id="providers" className="reference-section py-20">
        <div className="reference-section-head">
          <div>
            <span className="reference-eyebrow">پیشنهادهای این هفته</span>
            <h2>آدم‌های پشت ایده‌های خوب</h2>
          </div>

          <form action="/providers" className="mt-8 flex flex-wrap items-end gap-3">
            <label className="grid gap-2 text-sm text-[#66626a]">
              فیلتر بر اساس تگ
              <select
                name="tag"
                defaultValue={selectedTag}
                className="min-w-52 rounded-full border border-[#d8d4ce] bg-white px-4 py-2.5 text-sm text-[#111216] outline-none focus:border-[#6957ff]"
              >
                <option value="">همه تگ‌ها</option>
                {availableTags.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
            </label>
            <button type="submit" className="light-button bg-[#111216] text-white">
              اعمال فیلتر
            </button>
            {selectedTag ? (
              <Link href="/providers" className="reference-nav-button">
                حذف فیلتر
              </Link>
            ) : null}
          </form>
          <p className="max-w-xs text-xs leading-7 text-[#858188]">
            {total > 0 ? `${total.toLocaleString("fa-IR")} ارائه‌دهنده در مجموعه ثبت شده‌اند.` : "با متخصصانی آشنا شو که برای ساختن چیزهای متفاوت آماده‌اند."}
          </p>
        </div>

        {items.length > 0 ? (
          <>
            <div className="reference-product-grid mt-10">
              {items.map((provider) => (
                <article key={provider.id} className="reference-product-card">
                  <div className={`reference-product-art ${provider.color}`}>
                    {provider.avatar ? (
                      <Image
                        src={provider.avatar}
                        alt={provider.name}
                        width={120}
                        height={120}
                        unoptimized
                        className="h-full w-full rounded-[18px] object-cover"
                      />
                    ) : (
                      <span className="flex items-center justify-center !border-0 !bg-[#111216] !text-3xl !text-white !shadow-none">
                        {provider.initials}
                      </span>
                    )}
                  </div>
                  <div className="reference-product-body">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] text-[#6957ff]">{provider.category}</span>
                      {provider.starred ? <Star className="h-3.5 w-3.5 fill-[#6957ff] text-[#6957ff]" /> : null}
                    </div>
                    <h3>{provider.name}</h3>
                    <p>{provider.description}</p>
                    <div className="mt-3 flex items-center justify-between gap-2 text-[10px] text-[#858188]">
                      <span>{provider.city}</span>
                      <span>{provider.followers.toLocaleString("fa-IR")} دنبال‌کننده</span>
                    </div>
                    <Link
                      href={provider.url.startsWith("http") ? provider.url : "/sign-up"}
                      target={provider.url.startsWith("http") ? "_blank" : undefined}
                      rel={provider.url.startsWith("http") ? "noreferrer" : undefined}
                      className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[#111216]"
                    >
                      شروع همکاری
                      <ArrowLeft className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>

            {totalPages > 1 ? (
              <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
                <Link
                  href={page > 1
                    ? `/providers?page=${page - 1}${selectedTag ? `&tag=${encodeURIComponent(selectedTag)}` : ""}`
                    : selectedTag
                      ? `/providers?tag=${encodeURIComponent(selectedTag)}`
                      : "/providers"}
                  className={`rounded-full border px-3 py-2 text-xs ${page === 1 ? "pointer-events-none opacity-40" : "border-[#d8d4ce] bg-white text-[#111216]"}`}
                >
                  قبلی
                </Link>

                {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
                  <Link
                    key={pageNumber}
                    href={`/providers?page=${pageNumber}${selectedTag ? `&tag=${encodeURIComponent(selectedTag)}` : ""}`}
                    className={`rounded-full px-3 py-2 text-xs ${pageNumber === page ? "bg-[#111216] text-white" : "border border-[#d8d4ce] bg-white text-[#111216]"}`}
                  >
                    {pageNumber}
                  </Link>
                ))}

                <Link
                  href={`${page < totalPages ? `/providers?page=${page + 1}` : `/providers?page=${totalPages}`}${selectedTag ? `&tag=${encodeURIComponent(selectedTag)}` : ""}`}
                  className={`rounded-full border px-3 py-2 text-xs ${page === totalPages ? "pointer-events-none opacity-40" : "border-[#d8d4ce] bg-white text-[#111216]"}`}
                >
                  بعدی
                </Link>
              </div>
            ) : null}
          </>
        ) : (
          <div className="mt-10 rounded-[24px] border border-dashed border-[#d8d4ce] bg-white/70 p-10 text-center text-sm text-[#66626a]">
            در حال حاضر داده‌ای برای ارائه‌دهندگان ثبت نشده است.
          </div>
        )}
      </section>

      <section className="maker-band">
        <div>
          <span className="reference-eyebrow light">ارائه‌دهنده‌ی خدمات هستی؟</span>
          <h2>جای تخصصت اینجاست.</h2>
          <p>یک صفحه برای معرفی خدماتت بساز و فرصت‌های تازه پیدا کن.</p>
        </div>
        <Link href="/sign-up" className="light-button">
          ثبت‌نام ارائه‌دهنده
          <ArrowLeft />
        </Link>
      </section>

      <footer className="reference-footer">
        <Link href="/" className="footer-brand">
          <Box /> تری‌دیوم
        </Link>
        <span>آدم‌های خوب، ایده‌های خوب را می‌سازند.</span>
        <span>© ۲۰۲۶ تری‌دیوم</span>
      </footer>
    </main>
  );
}
