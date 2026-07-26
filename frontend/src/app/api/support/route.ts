import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorize } from "@/lib/saas/authorize";
import { apiError } from "@/lib/saas/api-error";
import { PERMISSIONS } from "@/lib/saas/permissions";

export async function GET() {
  try {
    const { companyId } = await authorize(PERMISSIONS.SUPPORT_VIEW);
    const tickets = await prisma.ticket.findMany({ where: { companyId }, include: { createdBy: { select: { firstName: true, lastName: true } }, assignedTo: { select: { firstName: true, lastName: true } }, _count: { select: { comments: true } } }, orderBy: { createdAt: "desc" } });
    return NextResponse.json({ tickets: tickets.map((item) => ({ ...item, subject: item.title, requester: `${item.createdBy.firstName} ${item.createdBy.lastName}`, assignee: item.assignedTo ? `${item.assignedTo.firstName} ${item.assignedTo.lastName}` : "Unassigned" })) });
  } catch (error) { return apiError(error, "Unable to load support tickets"); }
}

export async function POST(request: Request) {
  try {
    const { companyId, userId } = await authorize(PERMISSIONS.SUPPORT_MANAGE);
    const body = await request.json();
    if (!body.title?.trim() || !body.description?.trim()) return NextResponse.json({ error: "Title and description are required" }, { status: 400 });
    if (body.assignedToId) {
      const user = await prisma.user.findFirst({ where: { id: body.assignedToId, companyId, isActive: true }, select: { id: true } });
      if (!user) return NextResponse.json({ error: "Assignee not found" }, { status: 404 });
    }
    return NextResponse.json(await prisma.ticket.create({ data: { companyId, createdById: userId, title: body.title.trim(), description: body.description.trim(), category: body.category || null, priority: body.priority || "MEDIUM", assignedToId: body.assignedToId || null } }), { status: 201 });
  } catch (error) { return apiError(error, "Unable to create ticket"); }
}

export async function PATCH(request: Request) {
  try {
    const { companyId, userId } = await authorize(PERMISSIONS.SUPPORT_MANAGE);
    const body = await request.json();
    const ticket = await prisma.ticket.findFirst({ where: { id: body.id, companyId }, select: { id: true } });
    if (!ticket) return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    if (body.comment?.trim()) {
      return NextResponse.json(await prisma.ticketComment.create({ data: { ticketId: body.id, authorId: userId, content: body.comment.trim(), isInternal: Boolean(body.isInternal) } }));
    }
    if (body.status && !["OPEN","IN_PROGRESS","RESOLVED","CLOSED"].includes(body.status)) return NextResponse.json({ error: "Invalid ticket status" }, { status: 400 });
    return NextResponse.json(await prisma.ticket.update({ where: { id: body.id }, data: { status: body.status, priority: body.priority } }));
  } catch (error) { return apiError(error, "Unable to update ticket"); }
}
