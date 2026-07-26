import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorize } from "@/lib/saas/authorize";
import { apiError } from "@/lib/saas/api-error";
import { PERMISSIONS } from "@/lib/saas/permissions";
import { createClient } from "@/utils/supabase/server";

const MAX_AVATAR_BYTES = 100 * 1024;

export async function POST(request: Request) {
  try {
    const { userId, session } = await authorize(PERMISSIONS.SETTINGS_SELF);
    const formData = await request.formData();
    const file = formData.get("avatar");

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: "Select a JPG image" }, { status: 400 });
    }

    const fileName = file.name.toLowerCase();
    const hasAllowedExtension =
      fileName.endsWith(".jpg") || fileName.endsWith(".jpeg");
    if (!hasAllowedExtension || file.type !== "image/jpeg") {
      return NextResponse.json(
        { error: "Only .jpg and .jpeg images are allowed" },
        { status: 400 },
      );
    }
    if (file.size > MAX_AVATAR_BYTES) {
      return NextResponse.json(
        { error: "Profile image must be 100 KB or smaller" },
        { status: 400 },
      );
    }

    const objectPath =
      `${session.user.authUserId}/${Date.now()}-${randomUUID()}.jpg`;
    const supabase = await createClient();
    const upload = await supabase.storage
      .from("avatars")
      .upload(objectPath, await file.arrayBuffer(), {
        contentType: "image/jpeg",
        cacheControl: "3600",
        upsert: false,
      });

    if (upload.error) throw upload.error;

    const { data } = supabase.storage.from("avatars").getPublicUrl(objectPath);
    await prisma.user.update({
      where: { id: userId },
      data: { avatarUrl: data.publicUrl },
    });

    return NextResponse.json({ avatarUrl: data.publicUrl });
  } catch (error) {
    return apiError(error, "Unable to upload profile image");
  }
}
