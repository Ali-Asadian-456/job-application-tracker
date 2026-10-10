"use client";
import { Box, LayoutGrid } from "lucide-react";
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
import { useSession } from "@/lib/auth/auth-client";
import { isAdminUser } from "@/lib/auth/roles";
export default function Navbar() {
  const { data: session } = useSession();
  return (
    <nav dir="rtl" className="reference-topbar">
      <div className="reference-nav">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-semibold text-slate-950"
        >
          <Box className="h-5 w-5 text-current" />
          تری‌دیوم
        </Link>

        <div className="reference-navlinks  font-semibold">
          {session?.user ? (
            <>
              <Link href="/#catalog" className="reference-navlink ">
                محصولات
              </Link>
              <Link href="/#catalog" className="reference-navlink">
                دسته‌بندی‌ها
              </Link>
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
                      <Link href="/dashboard" className="flex items-center gap-1">
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
            <>
              <Link href="/sign-in" className="reference-navlink">
                ورود
              </Link>
              <Link href="/sign-up" className="reference-nav-button">
                ثبت‌نام
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
