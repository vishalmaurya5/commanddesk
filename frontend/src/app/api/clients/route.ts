import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorize } from "@/lib/saas/authorize";
import { apiError } from "@/lib/saas/api-error";
import { PERMISSIONS } from "@/lib/saas/permissions";

export async function GET(request: Request) {
  try {
    const { companyId } = await authorize(PERMISSIONS.CRM_VIEW);
    const includeInactive = new URL(request.url).searchParams.get("includeInactive") === "true";
    const clients = await prisma.client.findMany({ where: { companyId, ...(includeInactive ? {} : { isActive: true }) }, include: { _count: { select: { leads: true, invoices: true } } }, orderBy: [{ isActive: "desc" }, { name: "asc" }] });
    return NextResponse.json(clients);
  } catch (error) { return apiError(error, "Unable to load clients"); }
}

export async function POST(request: Request) {
  try {
    const { companyId } = await authorize(PERMISSIONS.CRM_MANAGE);
    const body = await request.json();
    if (!body.name?.trim()) return NextResponse.json({ error: "Client name is required" }, { status: 400 });
    if (body.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) return NextResponse.json({ error: "Enter a valid email" }, { status: 400 });
    const client = await prisma.client.create({ data: { companyId, name: body.name.trim(), email: body.email?.trim() || null, phone: body.phone?.trim() || null, companyName: body.companyName?.trim() || null, website: body.website?.trim() || null, address: body.address?.trim() || null, city: body.city?.trim() || null, state: body.state?.trim() || null, country: body.country?.trim() || null, pincode: body.pincode?.trim() || null, gst: body.gst?.trim() || null, notes: body.notes?.trim() || null } });
    return NextResponse.json(client, { status: 201 });
  } catch (error) { return apiError(error, "Unable to create client"); }
}
