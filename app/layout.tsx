import type { Metadata } from "next";
import { Geist, Geist_Mono, Figtree, Vazirmatn } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import Navbar from "@/components/navbar";

const figtree = Figtree({ subsets: ["latin"], variable: "--font-sans" });
const vazirmatn = Vazirmatn({ subsets: ["arabic"], variable: "--font-persian" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "تری‌دیم",
  description: "چیزهایی که میشود ساخت",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fa"
      className={cn(
        "h-full",
        "antialiased",
        geistSans.variable,
        geistMono.variable,
        "font-sans",
        figtree.variable,
        vazirmatn.variable,
      )}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
