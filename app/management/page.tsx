import { getSession } from "@/lib/auth/auth";
import { isAdminUser } from "@/lib/auth/roles";
import { redirect } from "next/navigation";
import ManagementSections from "@/components/admin/management-sections";

export const instant = false;

export default async function ManagementPage() {
  const session = await getSession();
  if (!session?.user || !isAdminUser(session.user)) redirect("/");

  return (
    <div dir="rtl" className="min-h-screen bg-[#f8f7f3]">
      <div className="mx-auto max-w-7xl space-y-14 px-6 py-10">
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium tracking-[0.3em] text-primary">پنل مدیریت</p>
          <h1 className="text-3xl font-semibold text-slate-950">مدیریت تری‌دیوم</h1>
          <p className="max-w-2xl text-slate-600">محصولات و نمایندگان خدمات را از یکجا مدیریت کن.</p>
        </div>
        <ManagementSections />
      </div>
    </div>
  );
}
