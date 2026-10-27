"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { signIn, signUp } from "@/lib/auth/auth-client";

type AuthTab = "sign-in" | "sign-up";

export default function AuthDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [tab, setTab] = useState<AuthTab>("sign-in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  function resetForm() {
    setName("");
    setEmail("");
    setPassword("");
    setError("");
    setLoading(false);
  }

  function switchTab(newTab: AuthTab) {
    resetForm();
    setTab(newTab);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (tab === "sign-in") {
        const result = await signIn.email({ email, password });
        if (result.error) {
          setError(result.error.message ?? "ورود ناموفق بود");
        } else {
          onOpenChange(false);
          resetForm();
          router.push("/");
        }
      } else {
        const result = await signUp.email({ name, email, password });
        if (result.error) {
          setError(result.error.message ?? "ثبت‌نام ناموفق بود");
        } else {
          onOpenChange(false);
          resetForm();
          router.push("/");
        }
      }
    } catch {
      setError("خطای غیرمنتظره‌ای رخ داد");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(val: boolean) => {
        onOpenChange(val);
        if (!val) resetForm();
      }}
    >
      <DialogContent className="max-w-[420px] p-0 overflow-hidden">
        {/* Header */}
        <div className="auth-dialog-header">
          <DialogTitle className="text-xl font-black text-white">
            مدیریت حساب کاربری
          </DialogTitle>
          <DialogDescription className="mt-1 text-sm text-white/70">
            ورود یا ثبت‌نام با ایمیل
          </DialogDescription>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 px-6 pt-5" style={{ fontFamily: "var(--font-persian), Vazirmatn, sans-serif" }}>
          <button
            type="button"
            className={`auth-tab ${tab === "sign-up" ? "auth-tab-active" : ""}`}
            onClick={() => switchTab("sign-up")}
          >
            عضویت جدید
          </button>
          <button
            type="button"
            className={`auth-tab ${tab === "sign-in" ? "auth-tab-active" : ""}`}
            onClick={() => switchTab("sign-in")}
          >
            ورود به حساب
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 pb-6 pt-4" style={{ fontFamily: "var(--font-persian), Vazirmatn, sans-serif" }}>
          {error && (
            <div className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-4">
            {tab === "sign-up" && (
              <div className="grid gap-2">
                <Label htmlFor="auth-name" className="text-right text-sm text-muted-foreground">
                  نام کاربری مورد نظر
                </Label>
                <Input
                  id="auth-name"
                  type="text"
                  placeholder="نام کاربری دلخواه"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="text-right"
                />
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="auth-email" className="text-right text-sm text-muted-foreground">
                آدرس ایمیل
              </Label>
              <Input
                id="auth-email"
                type="email"
                placeholder="name@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="text-right"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="auth-password" className="text-right text-sm text-muted-foreground">
                کلمه عبور {tab === "sign-up" && "(حداقل ۸ کاراکتر)"}
              </Label>
              <Input
                id="auth-password"
                type="password"
                placeholder={tab === "sign-up" ? "کلمه عبور (حداقل ۸ کاراکتر)" : "کلمه عبور"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={tab === "sign-up" ? 8 : undefined}
                className="text-right"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="mt-6 w-full h-12 text-base font-bold"
            style={{ fontFamily: "var(--font-persian), Vazirmatn, sans-serif" }}
          >
            {loading
              ? "لطفاً صبر کنید..."
              : tab === "sign-in"
                ? "ورود به حساب"
                : "ثبت نام و ایجاد حساب جدید"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
