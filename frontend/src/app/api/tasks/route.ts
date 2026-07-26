import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { TaskService } from "@/lib/services/task-service";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId") || undefined;
    const tasks = await TaskService.getAll(
      (session.user as any).companyId,
      projectId
    );
    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
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
    const task = await TaskService.create(body);
    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
