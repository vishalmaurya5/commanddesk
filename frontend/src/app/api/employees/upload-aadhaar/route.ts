import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = (formData.get("aadhaarCard") || formData.get("file")) as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // 1. Strict File Type Validation (JPG / JPEG only)
    const allowedTypes = new Set(["image/jpeg", "image/jpg"]);
    const fileName = file.name.toLowerCase();
    const isJpgExt = fileName.endsWith(".jpg") || fileName.endsWith(".jpeg");

    if (!allowedTypes.has(file.type) && !isJpgExt) {
      return NextResponse.json(
        { error: "Only JPG/JPEG image files (.jpg, .jpeg) are accepted for Aadhaar card uploads." },
        { status: 400 }
      );
    }

    // 2. Strict File Size Validation (<= 150 KB)
    const maxSizeBytes = 150 * 1024; // 150 KB = 153,600 bytes
    if (file.size > maxSizeBytes) {
      const actualKb = (file.size / 1024).toFixed(1);
      return NextResponse.json(
        { error: `File size exceeds the 150 KB limit. Your file is ${actualKb} KB. Please upload a smaller JPG image.` },
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
