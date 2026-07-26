import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { LeaveService } from "@/lib/services/leave-service";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || undefined;
    const userId = searchParams.get("userId");

    if (userId) {
      const leaves = await LeaveService.getByUser(userId);
      return NextResponse.json(leaves);
    }
    const leaves = await LeaveService.getAll((session.user as any).companyId, status);
    return NextResponse.json(leaves);
  } catch (error) {
    console.error("Error fetching leaves:", error);
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
    const leave = await LeaveService.create({
      ...body,
      userId: (session.user as any).id,
    });
    return NextResponse.json(leave, { status: 201 });
  } catch (error) {
    console.error("Error creating leave:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
