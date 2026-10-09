import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/auth";
import { isAdminUser } from "@/lib/auth/roles";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MIME_EXTENSIONS: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.user || !isAdminUser(session.user)) {
    return NextResponse.json({ error: "دسترسی مجاز نیست." }, { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "فایلی انتخاب نشده است." }, { status: 400 });
  }

  const extension = MIME_EXTENSIONS[file.type];
  if (!extension) {
    return NextResponse.json(
      { error: "فرمت مجاز: JPG، PNG، WEBP یا GIF." },
      { status: 400 },
    );
  }

  if (file.size === 0 || file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "حجم تصویر باید کمتر از ۵ مگابایت باشد." },
      { status: 400 },
    );
  }

  const filename = `${randomUUID()}${extension}`;
  const directory = path.join(process.cwd(), "public", "img");
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, filename), Buffer.from(await file.arrayBuffer()));

  return NextResponse.json({ url: `/img/${filename}` });
}
