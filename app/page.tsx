import Link from "next/link";
import { Box, Check, ChevronLeft } from "lucide-react";
import { getPublicProducts } from "@/lib/catalog/products";
import ProductExplorer from "@/components/product-explorer";
import { getSession } from "@/lib/auth/auth";
import { isAdminUser } from "@/lib/auth/roles";

export const instant = false;

function HeroStage() {
  return (
    <div className="hero-stage" aria-label="نمونه محصولات">
      <div className="stage-orbit stage-orbit-one" />
      <div className="stage-orbit stage-orbit-two" />
      <div className="stage-card stage-card-a">
        <span className="stage-mock stage-mock-lamp" />
        <small>چراغ لوگویی</small>
      </div>
      <div className="stage-card stage-card-b">
        <span className="stage-mock stage-mock-vase" />
        <small>گلدان پارامتریک</small>
      </div>
      <div className="stage-card stage-card-c">
        <span className="stage-mock stage-mock-dock" />
        <small>داک کنترلر</small>
      </div>
    </div>
  );
}

export default async function Home() {
  const [products, session] = await Promise.all([getPublicProducts(), getSession()]);
  const adminHref = session?.user && isAdminUser(session.user) ? "/management" : "#catalog";

  return (
    <main dir="rtl" className="tridium-page">
      <section className="hero-shell">
        <div className="hero-copy">
          <span className="reference-eyebrow">نسخه آزمایشی تری‌دیوم</span>
          <h1 className="reference-h1">
            چیزهایی که نمی‌دانستی
            <br />
            <span>می‌شود پیدا کرد.</span>
          </h1>
          <p className="reference-lede">
            محصولاتی را ببین، ذخیره کن و وقتی خواستی بهترین انتخاب را پیدا کن.
            لازم نیست از قبل بدانی دقیقا دنبال چه چیزی هستی.
          </p>
          <form action="#catalog" className="hero-search">
            <input name="q" placeholder="مثلاً: برای میز کار، هدیه یا خانه..." />
            <button type="submit">پیدا کن</button>
          </form>
          <div className="trust-row">
            <span><Check /> انتخاب‌شده و کاربردی</span>
            <span><Check /> بدون هزینه برای شروع</span>
            <span><Check /> قابل کشف و مقایسه</span>
          </div>
        </div>
        <HeroStage />
      </section>

      <section className="signal-strip">
        <div className="signal-grid">
          {[
            ["ببین", "بدون اینکه از قبل بدانی چه می‌خواهی"],
            ["جست‌وجو کن", "با چند کلمه به انتخاب مناسب برس"],
            ["مقایسه کن", "قیمت، امتیاز و ویژگی‌ها را کنار هم ببین"],
            ["انتخاب کن", "محصول مناسب را به سادگی پیدا کن"],
          ].map(([title, text]) => (
            <div key={title}><strong>{title}</strong><span>{text}</span></div>
          ))}
        </div>
      </section>

      <ProductExplorer products={products} />

      <section className="reference-section reference-split" id="how">
        <div>
          <span className="reference-eyebrow">چطور کار می‌کند؟</span>
          <h2>تو نیاز را می‌گویی. ما جزئیات انتخاب را ساده می‌کنیم.</h2>
        </div>
        <ol className="reference-steps">
          {["یک چیز پیدا کن", "محصولات مشابه را ببین", "جزئیات و قیمت را مقایسه کن", "انتخاب مناسب را انجام بده"].map((item, index) => (
            <li key={item}><span>۰{index + 1}</span><div><strong>{item}</strong><p>بدون پیچیدگی، با اطلاعاتی که برای تصمیم‌گیری لازم داری.</p></div></li>
          ))}
        </ol>
      </section>

      <section className="maker-band">
        <div>
          <span className="reference-eyebrow light">یک محصول خوب داری؟</span>
          <h2>جای محصول خوب در فید شلوغ گم نیست.</h2>
          <p>محصولت را به ویترین تری‌دیوم اضافه کن تا بیشتر دیده شود.</p>
        </div>
        <Link href={adminHref} className="light-button">رفتن به محصولات <ChevronLeft /></Link>
      </section>

      <footer className="reference-footer">
        <Link href="/" className="footer-brand"><Box /> تری‌دیوم</Link>
        <span>محصولات خوب، ارزش دیده‌شدن دارند.</span>
        <span>© ۲۰۲۶ تری‌دیوم</span>
      </footer>
    </main>
  );
}
