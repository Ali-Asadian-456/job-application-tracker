import mongoose from "mongoose";
import { cacheLife, cacheTag } from "next/cache";
import connectDB from "@/lib/db";

export interface AdminProvider {
  _id: string;
  username: string;
  tags: string[];
  notes: string;
  city: string;
  followers: number;
  originalUrl: string;
  avatar: string;
  starred: boolean;
  status: string;
}

export async function getAdminProviders(): Promise<AdminProvider[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("providers");
  await connectDB();
  const db = mongoose.connection.db;
  if (!db) return [];
  const docs = await db.collection("providers").find({}).sort({ starred: -1, followers: -1, username: 1 }).toArray();
  return docs.map((doc) => ({
    _id: String(doc._id ?? doc.id),
    username: typeof doc.username === "string" ? doc.username : String(doc.id ?? "provider"),
    tags: Array.isArray(doc.tags) ? doc.tags.filter(Boolean).map(String) : [],
    notes: typeof doc.notes === "string" ? doc.notes : "",
    city: typeof doc.city === "string" ? doc.city : "",
    followers: Number(doc.followers ?? 0) || 0,
    originalUrl: typeof doc.originalUrl === "string" ? doc.originalUrl : "",
    avatar: typeof doc.avatar === "string" ? doc.avatar : "",
    starred: Boolean(doc.starred),
    status: typeof doc.status === "string" ? doc.status : "none",
  }));
}
