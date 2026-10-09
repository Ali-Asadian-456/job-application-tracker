"use client";
import { useRouter } from "next/navigation";
import { DropdownMenuItem } from "./ui/dropdown-menu";
import { signOut } from "@/lib/auth/auth-client";

export default function SignOutBtn() {
  const router = useRouter();

  return (
    <DropdownMenuItem
      onClick={async () => {
        const result = await signOut();
        if (result.data) {
          router.push("/");
        } else {
          alert("Error signing out");
        }
      }}
    >
      Log out
    </DropdownMenuItem>
  );
}
