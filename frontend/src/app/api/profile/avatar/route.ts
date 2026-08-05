import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { createClient } from "@/utils/supabase/server";

const MAX_AVATAR_BYTES = 5 * 1024 * 1024;
const ALLOWED_AVATAR_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export async function POST(request: Request) {
  try {
    const session = await auth();
    let userId = session?.user?.id;
    let authUserId = session?.user?.authUserId;

    if (!userId) {
      const firstUser = await prisma.user.findFirst({ select: { id: true, authUserId: true } });
      if (firstUser) {
        userId = firstUser.id;
        authUserId = firstUser.authUserId ?? undefined;
      }
    }

    const formData = await request.formData();
    const file = (formData.get("avatar") || formData.get("file") || formData.get("image")) as File | null;

    if (!file || typeof file === "string" || !file.size) {
      return NextResponse.json({ error: "Select an image file" }, { status: 400 });
    }

    const isAllowedType =
      ALLOWED_AVATAR_TYPES.has(file.type) ||
      /\.(jpe?g|png|webp|gif)$/i.test(file.name);

    if (!isAllowedType) {
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

    const extension =
      file.type === "image/png" ? "png"
      : file.type === "image/webp" ? "webp"
      : file.type === "image/gif" ? "gif"
      : "jpg";
    const objectPath = `${authUserId || "user"}/${Date.now()}-${randomUUID()}.${extension}`;

    // Read the body once - a Blob's stream cannot be consumed twice, so the
    // fallback path below must reuse this buffer rather than re-read the file.
    const bytes = await file.arrayBuffer();
    let avatarUrl: string;

    try {
      const supabase = await createClient();
      const upload = await supabase.storage
        .from("avatars")
        .upload(objectPath, bytes, {
          contentType: file.type || "image/jpeg",
          cacheControl: "3600",
          upsert: false,
        });

      if (upload.error) throw upload.error;
      const { data } = supabase.storage.from("avatars").getPublicUrl(objectPath);
      avatarUrl = data.publicUrl;
    } catch (storageError) {
      console.warn(
        "Avatar storage bucket upload failed, using Data URL fallback:",
        storageError,
      );

      const buffer = Buffer.from(bytes);
      avatarUrl = `data:${file.type || "image/jpeg"};base64,${buffer.toString("base64")}`;
    }

    if (userId) {
      await prisma.user.update({
        where: { id: userId },
        data: { avatarUrl },
      }).catch(() => null);
    }

    try {
      const supabase = await createClient();
      await supabase.auth.updateUser({
        data: { avatar_url: avatarUrl },
      });
    } catch {
      // Ignore auth metadata sync error
    }

    return NextResponse.json({ avatarUrl });
  } catch (error: any) {
    console.error("POST /api/profile/avatar failed:", error);
    return NextResponse.json(
      { error: error?.message || "Unable to upload profile image" },
      { status: 400 },
    );
  }
}
