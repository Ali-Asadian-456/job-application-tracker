"use client";
import { useRouter } from "next/navigation";
import { DropdownMenuItem } from "./ui/dropdown-menu";
import { signOut } from "@/lib/auth/auth-client";
import { router } from "better-auth/api";

export default function SignOutBtn() {
  const router=useRouter();
  return(
  <DropdownMenuItem onClick={async () => {
    const result=await signOut();
    if (result.data){
      router.push("/sign-in")
    }
    else{alert("Error Signing out")}
  
  
  }
   
   
   }>
    Log Out
  </DropdownMenuItem>
  )
}
