import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { TaskService } from "@/lib/services/task-service";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { content } = await request.json();
    const comment = await TaskService.addComment(
      (await params).id,
      (session.user as any).id,
      content
    );
    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error("Error adding comment:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
