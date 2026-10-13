"use server";

import mongoose from "mongoose";
import { revalidatePath, revalidateTag } from "next/cache";
import { getSession } from "@/lib/auth/auth";
import { isAdminUser } from "@/lib/auth/roles";
import connectDB from "@/lib/db";
import { getAdminProviders } from "@/lib/catalog/providers";

type ProviderFormState = { error?: string | null; success?: boolean };

function text(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function tags(value: string) {
  return [...new Set(value.split(",").map((tag) => tag.trim()).filter(Boolean))].slice(0, 20);
}

async function requireAdmin() {
  const session = await getSession();
  return session?.user && isAdminUser(session.user);
}

export async function loadAdminProviders() {
  if (!(await requireAdmin())) {
    return { providers: [], error: "شما اجازه مدیریت نمایندگان را ندارید." };
  }

  try {
    return { providers: await getAdminProviders(), error: null };
  } catch (error) {
    return {
      providers: [],
      error: error instanceof Error ? error.message : "دریافت نمایندگان ناموفق بود.",
    };
  }
}

function providerFilter(id: string) {
  return mongoose.Types.ObjectId.isValid(id) ? { _id: new mongoose.Types.ObjectId(id) } : { id };
}

export async function saveProvider(
  _state: ProviderFormState,
  formData: FormData,
): Promise<ProviderFormState> {
  if (!(await requireAdmin())) {
    return { error: "شما اجازه مدیریت نمایندگان را ندارید." };
  }

  try {
    await connectDB();
    const db = mongoose.connection.db;
    if (!db) return { error: "اتصال به پایگاه داده برقرار نشد." };

    const providerId = text(formData, "providerId");
    const username = text(formData, "username");
    const providerTags = tags(text(formData, "tags"));
    const followersRaw = text(formData, "followers");
    const followers = followersRaw === "" ? 0 : Number(followersRaw);

    if (!username) return { error: "نام کاربری الزامی است." };
    if (!Number.isSafeInteger(followers) || followers < 0) {
      return { error: "تعداد دنبال‌کننده باید یک عدد صحیح نامنفی باشد." };
    }

    const payload = {
      username,
      tags: providerTags,
      notes: text(formData, "notes"),
      city: text(formData, "city"),
      followers,
      originalUrl: text(formData, "originalUrl"),
      avatar: text(formData, "avatar"),
      starred: formData.get("starred") === "on",
      status: text(formData, "status") || "none",
      updatedAt: new Date(),
    };

    if (providerId) {
      if (!mongoose.Types.ObjectId.isValid(providerId) && !providerId) {
        return { error: "نماینده انتخاب‌شده معتبر نیست." };
      }
      const result = await db.collection("providers").updateOne(providerFilter(providerId), { $set: payload });
      if (!result.matchedCount) return { error: "نماینده انتخاب‌شده پیدا نشد." };
    } else {
      await db.collection("providers").insertOne({ ...payload, createdAt: new Date() });
    }

    revalidatePath("/providers");
    revalidatePath("/management");
    revalidateTag("providers", "max");
    return { success: true, error: null };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "ذخیره نماینده ناموفق بود." };
  }
}

export async function deleteProvider(providerId: string) {
  if (!(await requireAdmin())) {
    return { error: "شما اجازه مدیریت نمایندگان را ندارید." };
  }
  if (!providerId || (!mongoose.Types.ObjectId.isValid(providerId) && providerId.length > 100)) {
    return { error: "نماینده انتخاب‌شده معتبر نیست." };
  }

  try {
    await connectDB();
    const db = mongoose.connection.db;
    if (!db) return { error: "اتصال به پایگاه داده برقرار نشد." };
    const result = await db.collection("providers").deleteOne(providerFilter(providerId));
    if (!result.deletedCount) return { error: "نماینده انتخاب‌شده پیدا نشد." };
    revalidatePath("/providers");
    revalidatePath("/management");
    revalidateTag("providers", "max");
    return { error: null };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "حذف نماینده ناموفق بود." };
  }
}
