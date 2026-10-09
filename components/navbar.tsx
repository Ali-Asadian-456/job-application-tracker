"use client";
import { Briefcase } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import SignOutBtn from "./sign-out-btn";
import { useSession } from "@/lib/auth/auth-client";
export default function Navbar() {
  const { data: session } = useSession();
  return (
    <nav className="border-b  border-gray-200 bg-white">
      <div className="container flex mx-auto  h-16 items-center px-4 justify-between">
        <Link
          href="/"
          className="flex gap-2 items-center text-xl font-semibold text-primary "
        >
          <Briefcase />
          Job Tracker
        </Link>

        <div className="flex gap-2 items-center ">
          {session?.user ? (
            <>
              <Link
                href="/dashboard"
                className={buttonVariants({
                  variant: "ghost",
                  className: "text-gray-700 hover:text-black",
                })}
              >
                dashboard
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger
                  nativeButton={false}
                  render={
                    <div className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring">
                      <Avatar>
                        <AvatarImage
                          src="https://github.com/evilrabbit.png"
                          alt="@evilrabbit"
                        />
                        <AvatarFallback className="bg-primary text-white">
                          {session.user.name?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  }
                />
                <DropdownMenuContent >
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>
                      <div>
                        <p>{session?.user?.name}</p>
                        <p>{session?.user?.email}</p>
                      </div>
                    </DropdownMenuLabel>

                    <SignOutBtn />
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link
                href="/sign-in"
                className={buttonVariants({
                  variant: "ghost",
                  className: "text-gray-700 hover:text-black",
                })}
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className={buttonVariants({
                  className: "hover:bg-primary/90",
                })}
              >
                Start For Free
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
