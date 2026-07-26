import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorize } from "@/lib/saas/authorize";
import { apiError } from "@/lib/saas/api-error";
import { PERMISSIONS } from "@/lib/saas/permissions";

const editable = ["name","email","phone","companyName","website","address","city","state","country","pincode","gst","notes","isActive"] as const;
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { companyId } = await authorize(PERMISSIONS.CRM_VIEW);
    const client = await prisma.client.findFirst({ where: { id: (await params).id, companyId }, include: { leads: { orderBy: { createdAt: "desc" }, take: 20 }, invoices: { orderBy: { createdAt: "desc" }, take: 20 } } });
    if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });
    return NextResponse.json(client);
  } catch (error) { return apiError(error, "Unable to load client"); }
}
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { companyId } = await authorize(PERMISSIONS.CRM_MANAGE);
    const id = (await params).id;
    const owned = await prisma.client.findFirst({ where: { id, companyId }, select: { id: true } });
    if (!owned) return NextResponse.json({ error: "Client not found" }, { status: 404 });
    const body = await request.json();
    if (body.name !== undefined && !String(body.name).trim()) return NextResponse.json({ error: "Client name cannot be empty" }, { status: 400 });
    const data: Record<string, string | boolean | null> = {};
    for (const key of editable) if (body[key] !== undefined) data[key] = typeof body[key] === "string" ? body[key].trim() || null : Boolean(body[key]);
    return NextResponse.json(await prisma.client.update({ where: { id }, data }));
  } catch (error) { return apiError(error, "Unable to update client"); }
}
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { companyId } = await authorize(PERMISSIONS.CRM_MANAGE);
    const id = (await params).id;
    const result = await prisma.client.updateMany({ where: { id, companyId }, data: { isActive: false } });
    if (!result.count) return NextResponse.json({ error: "Client not found" }, { status: 404 });
    return NextResponse.json({ message: "Client deactivated" });
  } catch (error) { return apiError(error, "Unable to deactivate client"); }
}
