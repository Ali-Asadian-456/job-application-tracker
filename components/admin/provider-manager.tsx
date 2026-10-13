"use client";

import { useActionState, useEffect, useMemo, useState, useTransition } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { deleteProvider, saveProvider } from "@/lib/actions/providers";
import type { AdminProvider } from "@/lib/catalog/providers";

function ProviderDialog({ open, onOpenChange, provider }: { open: boolean; onOpenChange: (open: boolean) => void; provider: AdminProvider | null }) {
  const router = useRouter();
  const [state, action, pending] = useActionState(saveProvider, { error: null, success: false });
  const [avatarUrl, setAvatarUrl] = useState(provider?.avatar ?? "");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  useEffect(() => {
    if (state.success) {
      router.refresh();
      onOpenChange(false);
    }
  }, [onOpenChange, router, state.success]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{provider ? "ویرایش نماینده" : "افزودن نماینده"}</DialogTitle>
          <DialogDescription>اطلاعات نماینده و تگ‌های قابل استفاده در فیلتر عمومی را مدیریت کن.</DialogDescription>
        </DialogHeader>
        <form key={provider?._id ?? "new"} action={action} className="space-y-4">
          {provider ? <input type="hidden" name="providerId" value={provider._id} /> : null}
          {state.error ? <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{state.error}</p> : null}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2"><Label htmlFor="username">نام کاربری</Label><Input id="username" name="username" required defaultValue={provider?.username} /></div>
            <div className="grid gap-2"><Label htmlFor="city">شهر</Label><Input id="city" name="city" defaultValue={provider?.city} /></div>
          </div>
          <div className="grid gap-2"><Label htmlFor="tags">تگ‌ها</Label><Input id="tags" name="tags" placeholder="فیگور, کلکسیونی" defaultValue={provider?.tags.join(", ")} /></div>
          <div className="grid gap-2"><Label htmlFor="notes">توضیحات</Label><Textarea id="notes" name="notes" rows={3} defaultValue={provider?.notes} /></div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2"><Label htmlFor="followers">دنبال‌کننده</Label><Input id="followers" name="followers" type="number" min="0" step="1" defaultValue={provider?.followers ?? 0} /></div>
            <div className="grid gap-2"><Label htmlFor="status">وضعیت</Label><Input id="status" name="status" defaultValue={provider?.status} /></div>
          </div>
          <div className="grid gap-2"><Label htmlFor="originalUrl">لینک نماینده</Label><Input id="originalUrl" name="originalUrl" type="url" defaultValue={provider?.originalUrl} /></div>
          <div className="grid gap-2">
            <Label htmlFor="avatar">تصویر نماینده</Label>
            <input type="hidden" name="avatar" value={avatarUrl} />
            <div className="flex items-center gap-4">
              <div className="min-w-0 flex-1">
                <Input
                  id="avatar"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  disabled={uploading}
                  onChange={async (event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    setUploadError(null);
                    setUploading(true);
                    try {
                      const uploadData = new FormData();
                      uploadData.append("file", file);
                      const response = await fetch("/api/uploads", {
                        method: "POST",
                        body: uploadData,
                      });
                      const result = (await response.json()) as { url?: string; error?: string };
                      if (!response.ok || !result.url) {
                        throw new Error(result.error ?? "آپلود تصویر ناموفق بود.");
                      }
                      setAvatarUrl(result.url);
                    } catch (error) {
                      setUploadError(error instanceof Error ? error.message : "آپلود تصویر ناموفق بود.");
                    } finally {
                      setUploading(false);
                    }
                  }}
                />
                <p className="mt-2 text-xs text-slate-500">
                  {uploading ? "در حال آپلود..." : "فرمت‌های JPG، PNG، WEBP یا GIF؛ حداکثر ۵ مگابایت"}
                </p>
              </div>
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt="پیش‌نمایش تصویر نماینده"
                    width={64}
                    height={64}
                    unoptimized
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="px-2 text-center text-[10px] text-slate-400">بدون تصویر</span>
                )}
              </div>
            </div>
            {uploadError ? <p role="alert" className="text-xs text-red-600">{uploadError}</p> : null}
          </div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="starred" defaultChecked={provider?.starred} /> نماینده منتخب</label>
          <DialogFooter><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>لغو</Button><Button type="submit" disabled={pending || uploading}>{pending ? "در حال ذخیره..." : "ذخیره نماینده"}</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DeleteProviderButton({ provider }: { provider: AdminProvider }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  return <div>{<Button type="button" variant="destructive" disabled={pending} onClick={() => {
    if (!window.confirm(`حذف «${provider.username}»؟`)) return;
    setError(null);
    startTransition(() => { void deleteProvider(provider._id).then((result) => { if (result.error) setError(result.error); }); });
  }}><Trash2 className="mr-2 h-4 w-4" />{pending ? "در حال حذف..." : "حذف"}</Button>}{error ? <p className="mt-2 text-xs text-red-600">{error}</p> : null}</div>;
}

export default function ProviderManager({ providers }: { providers: AdminProvider[] }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<AdminProvider | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 16;
  const filteredProviders = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return query
      ? providers.filter((provider) => provider.username.toLocaleLowerCase().includes(query))
      : providers;
  }, [providers, search]);
  const totalPages = Math.max(1, Math.ceil(filteredProviders.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const visibleProviders = filteredProviders.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return <div className="space-y-6">
    <div className="grid gap-4 md:grid-cols-3">
      {[["نمایندگان", providers.length], ["تگ‌ها", new Set(providers.flatMap((provider) => provider.tags)).size], ["منتخب", providers.filter((provider) => provider.starred).length]].map(([label, value]) => <div key={String(label)} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-3xl font-semibold text-slate-950">{value}</p></div>)}
    </div>
    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between"><div><h2 className="text-xl font-semibold text-slate-950">نمایندگان خدمات</h2><p className="text-sm text-slate-600">نمایندگان و تگ‌های صفحه عمومی را مدیریت کن.</p></div><Button onClick={() => { setSelected(null); setOpen(true); }}><Plus className="mr-2 h-4 w-4" />افزودن نماینده</Button></div>
      <div className="mb-6">
        <label htmlFor="provider-search" className="mb-2 block text-sm font-medium text-slate-700">جست‌وجو بر اساس نام پیج</label>
        <Input
          id="provider-search"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          placeholder="مثلاً: figure_store"
          className="max-w-md"
        />
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        {visibleProviders.map((provider) => <article key={provider._id} className="rounded-3xl border border-slate-200 p-5"><div className="flex flex-wrap gap-2">{provider.tags.map((tag) => <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">{tag}</span>)}{provider.starred ? <span className="rounded-full bg-amber-50 px-3 py-1 text-xs text-amber-700">منتخب</span> : null}</div><h3 className="mt-3 text-lg font-semibold text-slate-950">{provider.username}</h3><p className="mt-2 line-clamp-2 text-sm text-slate-600">{provider.notes || "بدون توضیحات"}</p><p className="mt-3 text-xs text-slate-500">{provider.city || "بدون شهر"} · {provider.followers.toLocaleString("fa-IR")} دنبال‌کننده</p><div className="mt-4 flex gap-2"><Button type="button" variant="outline" onClick={() => { setSelected(provider); setOpen(true); }}><Pencil className="mr-2 h-4 w-4" />ویرایش</Button><DeleteProviderButton provider={provider} /></div></article>)}
      </div>
      {visibleProviders.length === 0 ? <p className="py-8 text-center text-sm text-slate-500">نماینده‌ای با این نام پیدا نشد.</p> : null}
      {totalPages > 1 ? (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <Button type="button" variant="outline" disabled={currentPage === 1} onClick={() => setPage((current) => current - 1)}>قبلی</Button>
          {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
            <Button key={pageNumber} type="button" variant={pageNumber === currentPage ? "default" : "outline"} onClick={() => setPage(pageNumber)}>{pageNumber}</Button>
          ))}
          <Button type="button" variant="outline" disabled={currentPage === totalPages} onClick={() => setPage((current) => current + 1)}>بعدی</Button>
        </div>
      ) : null}
    </div>
    <ProviderDialog key={`${selected?._id ?? "new"}-${open}`} open={open} onOpenChange={(next) => { setOpen(next); if (!next) setSelected(null); }} provider={selected} />
  </div>;
}
