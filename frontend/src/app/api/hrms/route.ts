import { NextResponse } from "next/server";
import { HrmsService } from "@/lib/services/hrms-service";
import { authorize } from "@/lib/saas/authorize";
import { apiError } from "@/lib/saas/api-error";
import { PERMISSIONS } from "@/lib/saas/permissions";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { companyId } = await authorize(PERMISSIONS.HRMS_VIEW);
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    if (type === "policies") {
      const policies = await HrmsService.getPolicies(companyId);
      return NextResponse.json(policies);
    }
    if (type === "documents") {
      const employeeId = searchParams.get("employeeId") || undefined;
      const documents = await HrmsService.getDocuments(companyId, employeeId);
      return NextResponse.json(documents);
    }
    if (type === "trainings") {
      const trainings = await HrmsService.getTrainings(companyId);
      return NextResponse.json(trainings);
    }
    if (type === "assets") {
      const assets = await HrmsService.getAssets(companyId);
      return NextResponse.json(assets);
    }
    if (type === "dashboard") {
      const dashboard = await HrmsService.getDashboard(companyId);
      return NextResponse.json(dashboard);
    }
    const hrms = await HrmsService.getAll(companyId);
    return NextResponse.json(hrms);
  } catch (error) {
    return apiError(error, "Unable to load HRMS data");
  }
}

export async function POST(request: Request) {
  try {
    const { companyId, userId } = await authorize(PERMISSIONS.HRMS_MANAGE);
    const body = await request.json();
    if (!body?.data?.name && body.type !== "asset" && body.type !== "training") {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    let result;

    switch (body.type) {
      case "policy":
        result = await HrmsService.createPolicy({ ...body.data, companyId, uploaderId: userId });
        break;
      case "document":
        result = await HrmsService.createDocument({ ...body.data, companyId, uploaderId: userId });
        break;
      case "training":
        result = await HrmsService.createTraining({ ...body.data, companyId, uploaderId: userId });
        break;
      case "asset":
        if (!body.data?.name?.trim() || !body.data?.type?.trim() || !body.data?.userId) return NextResponse.json({ error: "Asset name, category and employee are required" }, { status: 400 });
        const employee = await prisma.user.findFirst({ where: { id: body.data.userId, companyId, isActive: true }, select: { id: true } });
        if (!employee) return NextResponse.json({ error: "Employee not found" }, { status: 404 });
        result = await HrmsService.createAsset({ ...body.data, companyId });
        break;
      default:
        result = await HrmsService.create({ ...body, companyId });
    }
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return apiError(error, "Unable to create HRMS record");
  }
}

export async function PATCH(request: Request) {
  try {
    const { companyId } = await authorize(PERMISSIONS.HRMS_MANAGE);
    const body = await request.json();
    if (!body.id || !["policy", "document", "training", "asset"].includes(body.type)) return NextResponse.json({ error: "Record id and type are required" }, { status: 400 });
    if (body.type === "asset") {
      const owned = await prisma.asset.findFirst({ where: { id: body.id, user: { companyId } }, select: { id: true } });
      if (!owned) return NextResponse.json({ error: "Asset not found" }, { status: 404 });
      if (body.data?.userId) {
        const employee = await prisma.user.findFirst({ where: { id: body.data.userId, companyId, isActive: true }, select: { id: true } });
        if (!employee) return NextResponse.json({ error: "Employee not found" }, { status: 404 });
      }
      return NextResponse.json(await prisma.asset.update({ where: { id: body.id }, data: { name: body.data?.name?.trim(), type: body.data?.type?.trim(), serialNumber: body.data?.serialNumber || null, model: body.data?.model || null, brand: body.data?.brand || null, value: body.data?.value === "" ? null : body.data?.value === undefined ? undefined : Number(body.data.value), status: body.data?.status, userId: body.data?.userId } }));
    }
    const folder = body.type === "policy" ? "POLICY" : body.type === "training" ? "TRAINING" : undefined;
    const owned = await prisma.document.findFirst({ where: { id: body.id, uploader: { companyId }, ...(folder ? { folder } : {}) }, select: { id: true } });
    if (!owned) return NextResponse.json({ error: "HR record not found" }, { status: 404 });
    return NextResponse.json(await prisma.document.update({ where: { id: body.id }, data: { name: body.data?.name?.trim(), description: body.data?.description ?? undefined, fileUrl: body.data?.fileUrl ?? undefined, fileType: body.data?.fileType ?? undefined } }));
  } catch (error) { return apiError(error, "Unable to update HRMS record"); }
}

export async function DELETE(request: Request) {
  try {
    const { companyId } = await authorize(PERMISSIONS.HRMS_MANAGE);
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    const type = url.searchParams.get("type");
    if (!id || !type) return NextResponse.json({ error: "Record id and type are required" }, { status: 400 });
    if (type === "asset") {
      const result = await prisma.asset.deleteMany({ where: { id, user: { companyId } } });
      if (!result.count) return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    } else {
      const folder = type === "policy" ? "POLICY" : type === "training" ? "TRAINING" : undefined;
      const result = await prisma.document.deleteMany({ where: { id, uploader: { companyId }, ...(folder ? { folder } : {}) } });
      if (!result.count) return NextResponse.json({ error: "HR record not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "HRMS record deleted" });
  } catch (error) { return apiError(error, "Unable to delete HRMS record"); }
}
