import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { LeadService } from "@/lib/services/lead-service";
import { authorize } from "@/lib/saas/authorize";
import { apiError } from "@/lib/saas/api-error";
import { PERMISSIONS } from "@/lib/saas/permissions";

const STATUSES = new Set(["NEW", "CONTACTED", "QUALIFIED", "PROPOSAL", "NEGOTIATION", "WON", "LOST"]);

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(
  _request: Request,
  { params }: Params
) {
  try {
    const { companyId } = await authorize(PERMISSIONS.CRM_VIEW);
    const { id } = await params;
    const owned = await prisma.lead.findFirst({ where: { id, companyId }, select: { id: true } });
    if (!owned) return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    const lead = await LeadService.getById(id);
    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }
    return NextResponse.json(lead);
  } catch (error) {
    return apiError(error, "Unable to load lead");
  }
}

export async function PATCH(
  request: Request,
  { params }: Params
) {
  try {
    const { companyId } = await authorize(PERMISSIONS.CRM_MANAGE);
    const { id } = await params;
    const owned = await prisma.lead.findFirst({ where: { id, companyId }, select: { id: true } });
    if (!owned) return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    const body = await request.json();
    if (body.status && !STATUSES.has(body.status)) return NextResponse.json({ error: "Invalid lead status" }, { status: 400 });
    if (body.action === "convert") {
      const client = await LeadService.convertToClient(id, body.clientData);
      return NextResponse.json(client);
    }
    const { action: _action, clientData: _clientData, companyId: _companyId, ...updates } = body;
    const lead = await LeadService.update(id, updates);
    return NextResponse.json(lead);
  } catch (error) {
    return apiError(error, "Unable to update lead");
  }
}

export async function DELETE(
  _request: Request,
  { params }: Params
) {
  try {
    const { companyId } = await authorize(PERMISSIONS.CRM_MANAGE);
    const { id } = await params;
    const owned = await prisma.lead.findFirst({ where: { id, companyId }, select: { id: true } });
    if (!owned) return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    await LeadService.delete(id);
    return NextResponse.json({ message: "Lead deleted successfully" });
  } catch (error) {
    return apiError(error, "Unable to delete lead");
  }
}
