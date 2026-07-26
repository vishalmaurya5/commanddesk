import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorize } from "@/lib/saas/authorize";
import { apiError } from "@/lib/saas/api-error";
import { PERMISSIONS } from "@/lib/saas/permissions";
import { createClient } from "@/utils/supabase/server";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { companyId } = await authorize(PERMISSIONS.DOCUMENTS_MANAGE);
    const { id } = await params;
    const document = await prisma.document.findFirst({ where: { id, uploader: { companyId } } });
    if (!document) return NextResponse.json({ error: "Document not found" }, { status: 404 });
    const marker = "/storage/v1/object/public/documents/";
    const path = document.fileUrl.includes(marker) ? decodeURIComponent(document.fileUrl.split(marker)[1]) : null;
    if (path) {
      const supabase = await createClient();
      const removed = await supabase.storage.from("documents").remove([path]);
      if (removed.error) throw removed.error;
    }
    await prisma.document.delete({ where: { id } });
    return NextResponse.json({ message: "Document deleted" });
  } catch (error) { return apiError(error, "Unable to delete document"); }
}
