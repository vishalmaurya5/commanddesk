import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { HrmsService } from "@/lib/services/hrms-service";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const companyId = (session.user as any).companyId;

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
    console.error("Error fetching HRMS data:", error);
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
    const companyId = (session.user as any).companyId;
    let result;

    switch (body.type) {
      case "policy":
        result = await HrmsService.createPolicy({ ...body.data, companyId });
        break;
      case "document":
        result = await HrmsService.createDocument({ ...body.data, companyId });
        break;
      case "training":
        result = await HrmsService.createTraining({ ...body.data, companyId });
        break;
      case "asset":
        result = await HrmsService.createAsset({ ...body.data, companyId });
        break;
      default:
        result = await HrmsService.create({ ...body, companyId });
    }
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error creating HRMS data:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
