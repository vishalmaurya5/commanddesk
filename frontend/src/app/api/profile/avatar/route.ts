import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorize } from "@/lib/saas/authorize";
import { apiError } from "@/lib/saas/api-error";
import { PERMISSIONS } from "@/lib/saas/permissions";
import { createClient } from "@/utils/supabase/server";

const MAX_AVATAR_BYTES = 5 * 1024 * 1024;
const ALLOWED_AVATAR_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export async function POST(request: Request) {
  try {
    const { userId, session } = await authorize(PERMISSIONS.SETTINGS_SELF);
    const formData = await request.formData();
    const file = formData.get("avatar");

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: "Select an image file" }, { status: 400 });
    }

    if (!ALLOWED_AVATAR_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "Only JPG, PNG, WEBP, and GIF images are allowed" },
        { status: 400 },
      );
    }
    if (file.size > MAX_AVATAR_BYTES) {
      return NextResponse.json(
        { error: "Profile image must be 5 MB or smaller" },
        { status: 400 },
      );
    }

    const objectPath = `${session.user.authUserId}/${Date.now()}-${randomUUID()}.jpg`;
    let avatarUrl: string;
    try {
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
      avatarUrl = data.publicUrl;
    } catch {
      const buffer = Buffer.from(await file.arrayBuffer());
      avatarUrl = `data:${file.type};base64,${buffer.toString("base64")}`;
    }

    await prisma.user.update({
      where: { id: userId },
      data: { avatarUrl },
    });

    try {
      const supabase = await createClient();
      await supabase.auth.updateUser({
        data: { avatar_url: avatarUrl },
      });
    } catch {
      // Ignore auth metadata sync error
    }

    return NextResponse.json({ avatarUrl });
  } catch (error) {
    return apiError(error, "Unable to upload profile image");
  }
}
