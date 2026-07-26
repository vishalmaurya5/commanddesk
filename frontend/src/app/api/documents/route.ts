import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const folder = searchParams.get("folder") || undefined;
    const where: any = { uploader: { companyId: (session.user as any).companyId } };
    if (folder) where.folder = folder;
    const documents = await prisma.document.findMany({
      where,
      include: { uploader: { select: { id: true, firstName: true, lastName: true } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(documents);
  } catch (error) {
    console.error("Error fetching documents:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json();
    const document = await prisma.document.create({
      data: {
        ...body,
        uploaderId: (session.user as any).id,
      },
    });
    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    console.error("Error creating document:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
