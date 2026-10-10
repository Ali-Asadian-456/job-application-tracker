"use server";

import mongoose from "mongoose";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/auth";
import { isAdminUser } from "@/lib/auth/roles";
import connectDB from "@/lib/db";
import { Product } from "@/lib/models";
import {
  isValidHttpsImageUrl,
  slugify,
} from "@/lib/catalog/products";

type ProductFormState = {
  error?: string | null;
  success?: boolean;
};

function parseCommaList(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return [];
  }

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 8);
}

function parseHighlights(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return [];
  }

  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 6);
}

function readTextValue(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function toPositiveInteger(value: FormDataEntryValue | null, field: string) {
  const raw = typeof value === "string" ? value.trim() : "";
  if (!raw) {
    return null;
  }

  if (!/^\d+$/.test(raw)) {
    throw new Error(`${field} must be a non-negative whole number.`);
  }

  const parsed = Number(raw);
  if (!Number.isSafeInteger(parsed)) {
    throw new Error(`${field} is too large.`);
  }

  return parsed;
}

async function requireAdmin() {
  const session = await getSession();
  if (!session?.user || !isAdminUser(session.user)) {
    return null;
  }

  return session;
}

async function buildUniqueSlug(baseSlug: string, productId?: string) {
  const normalizedBase = baseSlug || "product";
  let candidate = normalizedBase;
  let counter = 2;

  while (true) {
    const existing = await Product.findOne({
      slug: candidate,
      ...(productId ? { _id: { $ne: new mongoose.Types.ObjectId(productId) } } : {}),
    })
      .select("_id")
      .lean();

    if (!existing) {
      return candidate;
    }

    candidate = `${normalizedBase}-${counter}`;
    counter += 1;
  }
}

export async function saveProduct(
  _state: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  const session = await requireAdmin();
  if (!session) {
    return { error: "You do not have permission to manage products." };
  }

  try {
    await connectDB();

    const productId = readTextValue(formData, "productId");
    const title = readTextValue(formData, "title");
    const slugValue = readTextValue(formData, "slug");
    const category = readTextValue(formData, "category");
    const description = readTextValue(formData, "description");
    const imageUrl = readTextValue(formData, "imageUrl");

    if (!title || !slugValue || !category || !description || !imageUrl) {
      return { error: "Title, slug, category, description, and image URL are required." };
    }

    if (!isValidHttpsImageUrl(imageUrl)) {
      return { error: "Image URL must be a valid HTTPS URL." };
    }

    const priceCents = toPositiveInteger(formData.get("priceCents"), "Price");
    if (priceCents === null) {
      return { error: "Price is required." };
    }

    const compareAtPriceCents = toPositiveInteger(
      formData.get("compareAtPriceCents"),
      "Compare-at price",
    );
    const ratingValue = readTextValue(formData, "rating");
    const ratingRaw = /^\d+(?:\.\d+)?$/.test(ratingValue)
      ? Number(ratingValue)
      : Number.NaN;
    const reviewCount = toPositiveInteger(formData.get("reviewCount"), "Review count");

    if (!Number.isFinite(ratingRaw) || ratingRaw < 0 || ratingRaw > 5) {
      return { error: "Rating must be a number between 0 and 5." };
    }

    if (reviewCount === null) {
      return { error: "Review count is required." };
    }

    const badges = parseCommaList(formData.get("badges"));
    const highlights = parseHighlights(formData.get("highlights"));
    const isFeatured = formData.get("isFeatured") === "on";
    const isActive = formData.get("isActive") !== null;

    const baseSlug = slugify(slugValue);
    if (!baseSlug) {
      return { error: "Slug must contain English letters or numbers." };
    }
    if (productId && !mongoose.Types.ObjectId.isValid(productId)) {
      return { error: "The selected product is invalid." };
    }

    const slug = await buildUniqueSlug(baseSlug, productId || undefined);
    const productPayload = {
      title,
      slug,
      description,
      category,
      priceCents,
      compareAtPriceCents: compareAtPriceCents ?? undefined,
      imageUrl,
      badges,
      highlights,
      rating: ratingRaw,
      reviewCount,
      isFeatured,
      isActive,
    };

    if (productId) {
      const updated = await Product.findOneAndUpdate(
        { _id: productId },
        { $set: productPayload },
        { new: true },
      ).lean();

      if (!updated) {
        return { error: "The selected product could not be found." };
      }
    } else {
      await Product.create(productPayload);
    }

    revalidatePath("/");
    revalidatePath("/dashboard");

    return { success: true, error: null };
  } catch (error) {
    const message =
      error instanceof Error && error.message
        ? error.message
        : "Could not save the product. Please try again.";

    return { error: message };
  }
}

export async function deleteProduct(productId: string) {
  const session = await requireAdmin();
  if (!session) {
    return { error: "You do not have permission to manage products." };
  }

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return { error: "The selected product is invalid." };
  }

  await connectDB();
  const deleted = await Product.findByIdAndDelete(productId).lean();
  if (!deleted) {
    return { error: "The selected product could not be found." };
  }

  revalidatePath("/");
  revalidatePath("/dashboard");
  return { error: null };
}
