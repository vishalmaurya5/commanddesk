import { createHash, randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorize } from "@/lib/saas/authorize";
import { apiError } from "@/lib/saas/api-error";
import { PERMISSIONS } from "@/lib/saas/permissions";

export async function GET() {
  try {
    const { companyId } = await authorize(PERMISSIONS.API_KEYS_MANAGE);
    const keys = await prisma.apiKey.findMany({
      where: { companyId },
      select: {
        id: true,
        name: true,
        keyPrefix: true,
        scopes: true,
        lastUsedAt: true,
        expiresAt: true,
        revokedAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ keys });
  } catch (error) {
    return apiError(error, "Unable to load API keys");
  }
}

export async function POST(request: Request) {
  try {
    const { companyId, userId } = await authorize(PERMISSIONS.API_KEYS_MANAGE);
    const body = (await request.json()) as {
      name?: string;
      scopes?: string[];
      expiresAt?: string;
    };
    if (!body.name?.trim()) {
      return NextResponse.json({ error: "Key name is required" }, { status: 400 });
    }

    const secret = `cd_live_${randomBytes(32).toString("base64url")}`;
    const keyHash = createHash("sha256").update(secret).digest("hex");
    const key = await prisma.apiKey.create({
      data: {
        companyId,
        createdById: userId,
        name: body.name.trim(),
        keyPrefix: secret.slice(0, 16),
        keyHash,
        scopes: body.scopes ?? [],
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
      },
      select: {
        id: true,
        name: true,
        keyPrefix: true,
        scopes: true,
        expiresAt: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ key, secret }, { status: 201 });
  } catch (error) {
    return apiError(error, "Unable to create API key");
  }
}

export async function DELETE(request: Request) {
  try {
    const { companyId } = await authorize(PERMISSIONS.API_KEYS_MANAGE);
    const id = new URL(request.url).searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Key id is required" }, { status: 400 });

    const result = await prisma.apiKey.updateMany({
      where: { id, companyId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    if (!result.count) return NextResponse.json({ error: "Key not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiError(error, "Unable to revoke API key");
  }
}
