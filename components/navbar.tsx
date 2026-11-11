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
import { Box } from "lucide-react";

export default function Navbar() {
  const { data: session } = useSession();
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <header
      dir="rtl"
      className="fixed inset-x-0 top-3 z-50 px-3 pt-[env(safe-area-inset-top)]"
    >
      <nav
        aria-label="منوی اصلی"
        className="mx-auto flex h-[60px] max-w-6xl items-center justify-between rounded-full border border-white/10 bg-black/80 py-0 pe-5 ps-3.5 shadow-[0_10px_40px_-20px_rgba(0,0,0,0.7)] backdrop-blur-xl"
      >
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-1.5 rounded-full text-[20px]  font-black text-white outline-none focus-visible:ring-2 focus-visible:ring-[#5a3cf5]"
        >
          <Box className="h-5 w-5 text-white" />
          
          تری‌دیم
        </Link>

        {/* Links */}
        <div className="flex items-center gap-1.5 text-[15px] font-medium">
          <Link
            href="/#catalog"
            className="rounded-full px-3.5 py-1.5 text-slate-300 outline-none transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-[#5a3cf5]  hover:border-[#5a3cf5] "
          >
            محصولات
          </Link>

          <Link
            href="/providers"
            className=" rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-white outline-none transition-colors hover:border-[#5a3cf5] hover:text-[#5a3cf5] focus-visible:ring-2 focus-visible:ring-[#5a3cf5] inline-block"
          >
            ارائه‌دهندگان خدمات
          </Link>

          {session?.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                nativeButton={false}
                render={
                  <div
                    role="button"
                    tabIndex={0}
                    aria-label="حساب کاربری"
                    className="ms-1 cursor-pointer rounded-full outline-none ring-offset-2 transition-shadow hover:ring-2 hover:ring-[#5a3cf5]/40 focus-visible:ring-2 focus-visible:ring-[#5a3cf5] ring-offset-black"
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
              className="rounded-full bg-white px-5 py-2 font-bold text-black outline-none transition-colors hover:bg-[#5a3cf5] hover:text-white focus-visible:ring-2 focus-visible:ring-[#5a3cf5] focus-visible:ring-offset-2"
            >
              ورود / ثبت‌نام
            </button>
          )}
        </div>
      </nav>

      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
    </header>
  );
}