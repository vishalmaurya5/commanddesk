import { NextResponse } from "next/server";
import { LeadService } from "@/lib/services/lead-service";
import { authorize } from "@/lib/saas/authorize";
import { apiError } from "@/lib/saas/api-error";
import { PERMISSIONS } from "@/lib/saas/permissions";

export async function GET(request: Request) {
  try {
    const { companyId } = await authorize(PERMISSIONS.CRM_VIEW);
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || undefined;
    const leads = await LeadService.getAll(companyId, status);
    return NextResponse.json(leads);
  } catch (error) {
    return apiError(error, "Unable to load leads");
  }
}

export async function POST(request: Request) {
  try {
    const { companyId } = await authorize(PERMISSIONS.CRM_MANAGE);
    const body = (await request.json()) as { name?: string; email?: string; phone?: string; budget?: number; source?: string };
    if (!body.name?.trim()) return NextResponse.json({ error: "Lead name is required" }, { status: 400 });
    const lead = await LeadService.create({
      ...body,
      name: body.name.trim(),
      companyId,
    });
    return NextResponse.json(lead, { status: 201 });
  } catch (error) {
    return apiError(error, "Unable to create lead");
  }
}
