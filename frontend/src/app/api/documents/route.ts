import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorize } from "@/lib/saas/authorize";
import { apiError } from "@/lib/saas/api-error";
import { PERMISSIONS } from "@/lib/saas/permissions";
import { createClient } from "@/utils/supabase/server";

const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED = new Set(["application/pdf", "image/jpeg", "image/png", "text/plain", "text/csv", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"]);

export async function GET(request: Request) {
  try {
    const { companyId } = await authorize(PERMISSIONS.DOCUMENTS_VIEW);
    const folder = new URL(request.url).searchParams.get("folder") || undefined;
    const documents = await prisma.document.findMany({ where: { uploader: { companyId }, ...(folder ? { folder } : {}) }, include: { uploader: { select: { id: true, firstName: true, lastName: true } } }, orderBy: { createdAt: "desc" } });
    return NextResponse.json(documents);
  } catch (error) { return apiError(error, "Unable to load documents"); }
}

export async function POST(request: Request) {
  try {
    const { userId, session } = await authorize(PERMISSIONS.DOCUMENTS_MANAGE);
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File) || file.size === 0) return NextResponse.json({ error: "Select a file" }, { status: 400 });
    if (file.size > MAX_BYTES) return NextResponse.json({ error: "File must be 10 MB or smaller" }, { status: 400 });
    if (!ALLOWED.has(file.type)) return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
    const extension = file.name.includes(".") ? file.name.split(".").pop()!.replace(/[^a-zA-Z0-9]/g, "") : "bin";
    const path = `${session.user.authUserId}/${Date.now()}-${randomUUID()}.${extension}`;
    let finalFileUrl: string;
    try {
      const supabase = await createClient();
      const upload = await supabase.storage.from("documents").upload(path, await file.arrayBuffer(), { contentType: file.type, upsert: false });
      if (upload.error) throw upload.error;
      const { data } = supabase.storage.from("documents").getPublicUrl(path);
      finalFileUrl = data.publicUrl;
    } catch {
      const buffer = Buffer.from(await file.arrayBuffer());
      finalFileUrl = `data:${file.type};base64,${buffer.toString("base64")}`;
    }

    const document = await prisma.document.create({
      data: {
        name: String(form.get("name") || file.name).trim(),
        description: String(form.get("description") || "") || null,
        folder: String(form.get("folder") || "General"),
        isPublic: form.get("isPublic") === "true",
        fileUrl: finalFileUrl,
        fileType: file.type,
        fileSize: file.size,
        uploaderId: userId,
      },
    });
    return NextResponse.json(document, { status: 201 });
  } catch (error) { return apiError(error, "Unable to upload document"); }
}
