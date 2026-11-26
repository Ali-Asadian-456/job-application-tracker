"use client";
import { useState } from "react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import SignOutBtn from "./sign-out-btn";
import AuthDialog from "./auth-dialog";
import { useSession } from "@/lib/auth/auth-client";
import { isAdminUser } from "@/lib/auth/roles";
import { Box, Menu, X } from "lucide-react";

export default function Navbar() {
  const { data: session } = useSession();
  const [authOpen, setAuthOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header
      dir="rtl"
      className="fixed inset-x-0 top-3 z-50 px-3 pt-[env(safe-area-inset-top)]"
    >
      <nav
        aria-label="منوی اصلی"
        className="mx-auto flex flex-row-reverse h-16 max-w-6xl items-center justify-between rounded-full border border-[#323131] bg-[#323131]/95 px-4 shadow-[0_10px_40px_-24px_rgba(17,18,22,0.35)] backdrop-blur-xl sm:px-6"
      >
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 rounded-full text-xl font-black text-white outline-none focus-visible:ring-2 focus-visible:ring-[#6957ff]"
        >
          <Box className="h-5 w-5 text-[#6957ff]" />
          تری‌دیم
        </Link>

        <div className="hidden items-center gap-1.5 text-sm font-medium md:flex">
          <Link
            href="/#catalog"
            className="rounded-full px-4 py-2 text-zinc-300 outline-none transition-colors hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-[#6957ff]"
          >
            محصولات
          </Link>

          <Link
            href="/providers"
            className="rounded-full px-4 py-2 text-zinc-300 outline-none transition-colors hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-[#6957ff]"
          >
            ارائه‌دهندگان خدمات
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label={menuOpen ? "بستن منو" : "باز کردن منو"}
            aria-controls="mobile-navigation"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white outline-none transition-colors hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-[#6957ff] md:hidden"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          {session?.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                nativeButton={false}
                render={
                  <div
                    role="button"
                    tabIndex={0}
                    aria-label="حساب کاربری"
                    className="cursor-pointer rounded-full outline-none ring-offset-2 ring-offset-white transition-shadow hover:ring-2 hover:ring-[#6957ff]/40 focus-visible:ring-2 focus-visible:ring-[#6957ff]"
                  >
                    <Avatar>
                      {session.user.image ? (
                        <AvatarImage
                          src={session.user.image}
                          alt={session.user.name ?? "Account avatar"}
                        />
                      ) : null}
                      <AvatarFallback className="bg-[#5a3cf5] font-bold text-white">
                        {session.user.name?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                }
              />
              <DropdownMenuContent className="min-w-48 rounded-2xl">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>
                    <p className="font-medium text-slate-950">
                      {session.user.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {session.user.email}
                    </p>
                  </DropdownMenuLabel>

                  {isAdminUser(session.user) ? (
                    <DropdownMenuItem render={<Link href="/management" />}>
                      مدیریت
                    </DropdownMenuItem>
                  ) : null}

                  <SignOutBtn />
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <button
              onClick={() => setAuthOpen(true)}
              className="cursor-pointer rounded-full bg-white px-4 py-2.5 text-xs font-bold text-[#323131] outline-none transition-colors hover:bg-zinc-200 focus-visible:ring-2 focus-visible:ring-[#6957ff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#323131] sm:px-5 sm:text-sm"
            >
              ورود / ثبت‌نام
            </button>
          )}
        </div>
      </nav>

      <div
        id="mobile-navigation"
        className={`${menuOpen ? "flex" : "hidden"} mx-auto mt-2 max-w-6xl flex-col gap-1 rounded-2xl border border-[#323131] bg-[#323131]/95 p-2 shadow-[0_12px_36px_-20px_rgba(17,18,22,0.4)] backdrop-blur-xl md:hidden`}
      >
        <Link
          href="/#catalog"
          onClick={() => setMenuOpen(false)}
          className="rounded-xl px-4 py-3 text-sm font-medium text-zinc-300 outline-none transition-colors hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-[#6957ff]"
        >
          محصولات
        </Link>
        <Link
          href="/providers"
          onClick={() => setMenuOpen(false)}
          className="rounded-xl px-4 py-3 text-sm font-medium text-zinc-300 outline-none transition-colors hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-[#6957ff]"
        >
          ارائه‌دهندگان خدمات
        </Link>
      </div>

      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
    </header>
  );
}
