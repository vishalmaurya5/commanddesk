import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await auth();
    let userId = session?.user?.id;

    if (!userId) {
      const firstUser = await prisma.user.findFirst({ select: { id: true } });
      if (firstUser) {
        userId = firstUser.id;
      }
    }

    if (!userId && !session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = (
      formData.get("aadhaarCard") ||
      formData.get("file") ||
      formData.get("aadhaar") ||
      formData.get("document")
    ) as File | null;

    if (!file || typeof file === "string" || !file.size) {
      return NextResponse.json({ error: "No Aadhaar card file provided" }, { status: 400 });
    }

    // 1. File Type Validation (JPG, PNG, WEBP, PDF)
    const allowedTypes = new Set([
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "application/pdf",
    ]);
    const fileName = file.name.toLowerCase();
    const isAllowedExt = /\.(jpe?g|png|webp|pdf)$/i.test(fileName);

    if (!allowedTypes.has(file.type) && !isAllowedExt) {
      return NextResponse.json(
        { error: "Only JPG, PNG, WEBP images or PDF files are accepted for Aadhaar card uploads." },
        { status: 400 }
      );
    }

    // 2. File Size Validation (<= 5 MB)
    const maxSizeBytes = 5 * 1024 * 1024; // 5 MB
    if (file.size > maxSizeBytes) {
      const actualMb = (file.size / (1024 * 1024)).toFixed(1);
      return NextResponse.json(
        { error: `File size exceeds the 5 MB limit. Your file is ${actualMb} MB. Please upload a smaller file.` },
        { status: 400 }
      );
    }

    // Convert file to base64 Data URL for persistent instant preview & database saving
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const mimeType = file.type || "image/jpeg";
    const dataUrl = `data:${mimeType};base64,${buffer.toString("base64")}`;

    return NextResponse.json({
      url: dataUrl,
      fileName: file.name,
      sizeKb: (file.size / 1024).toFixed(1),
    });
  } catch (error: any) {
    console.error("Aadhaar upload error:", error);
    return NextResponse.json(
      { error: "Unable to process Aadhaar card upload", details: error?.message || String(error) },
      { status: 500 }
    );
  }
}
