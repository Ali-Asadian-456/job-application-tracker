import { NextRequest, NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2 } from "@/lib/r2";

export async function POST(req: NextRequest) {
  try {
    const { filename, contentType } = await req.json();

    if (!filename || !contentType) {
      return NextResponse.json({ error: "اطلاعات فایل ناقص است" }, { status: 400 });
    }

    // ساخت نام یکتا — فقط پسوند فایل حفظ می‌شود تا URL همیشه ASCII باشد
    const extension = filename.includes(".") ? filename.slice(filename.lastIndexOf(".")) : "";
    const uniqueFileName = `${Date.now()}-${crypto.randomUUID()}${extension}`;

    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: uniqueFileName,
      ContentType: contentType,
    });

    // تولید لینک آپلود مستقیم با اعتبار ۶۰ ثانیه
    const signedUrl = await getSignedUrl(r2, command, { expiresIn: 60 });

    // لینک نهایی فایل برای نمایش در سایت یا ذخیره در دیتابیس
    const publicFileUrl = `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${uniqueFileName}`;

    return NextResponse.json({ signedUrl, publicFileUrl }, { status: 200 });
  } catch (error) {
    console.error("R2 Presign Error:", error);
    return NextResponse.json({ error: "خطا در ساخت لینک آپلود" }, { status: 500 });
  }
}