"use client";
import { useState } from "react";
import { Box } from "lucide-react";
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

export default function Navbar() {
  const { data: session } = useSession();
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <nav dir="rtl" className="reference-topbar">
      <div className="reference-nav">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-semibold text-slate-950"
        >
          <Box className="h-5 w-5 text-[#6957ff]" />
          <h1 className="text-[#6957ff] text-shodow-black text-shadow-2xs">
          تری‌دیم

          </h1>
        </Link>

        <div className="reference-navlinks font-semibold">
          <Link href="/providers" className="reference-nav-button">
            ارائه‌دهندگان خدمات
          </Link>
          <Link href="/#catalog" className="reference-navlink">
            محصولات
          </Link>
          {session?.user ? (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger
                  nativeButton={false}
                  render={
                    <div className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring">
                      <Avatar>
                        {session.user.image ? (
                          <AvatarImage
                            src={session.user.image}
                            alt={session.user.name ?? "Account avatar"}
                          />
                        ) : null}
                        <AvatarFallback className="bg-primary text-white">
                          {session.user.name?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  }
                />
                <DropdownMenuContent>
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>
                      <div>
                        <p className="font-medium text-slate-950">
                          {session?.user?.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {session?.user?.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    {isAdminUser(session.user) ? (
                     <DropdownMenuItem>
                      <Link href="/management" className="flex items-center gap-1">
                        {/* <LayoutGrid className="h-4 w-4" /> */}
                        مدیریت
                      </Link>
                    </DropdownMenuItem>): null}
                     

                    <SignOutBtn />
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <button
              onClick={() => setAuthOpen(true)}
              className="reference-nav-button"
            >
              ورود / ثبت‌نام
            </button>
          )}
        </div>
      </div>

      {/* Auth Dialog */}
      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
    </nav>
  );
}
