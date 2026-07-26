import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorize } from "@/lib/saas/authorize";
import { apiError } from "@/lib/saas/api-error";
import { PERMISSIONS } from "@/lib/saas/permissions";

type WebsiteConfig = { domain: string; status?: string; sslStatus?: string; uptime?: string; responseTime?: string };
export async function GET() {
  try {
    const { companyId } = await authorize(PERMISSIONS.WEBSITES_VIEW);
    const records = await prisma.analyticsReport.findMany({ where: { companyId, description: "WEBSITE_PROPERTY" }, orderBy: { updatedAt: "desc" } });
    return NextResponse.json({ websites: records.map((item) => { const config = item.config as WebsiteConfig; return { id: item.id, name: item.name, domain: config.domain, status: config.status ?? "MONITORED", sslStatus: config.sslStatus ?? "UNKNOWN", uptime: config.uptime ?? "Monitoring", responseTime: config.responseTime ?? "Pending", lastDeploy: item.updatedAt }; }) });
  } catch (error) { return apiError(error, "Unable to load websites"); }
}
export async function POST(request: Request) {
  try {
    const { companyId, userId } = await authorize(PERMISSIONS.WEBSITES_MANAGE);
    const body = await request.json();
    const domain = String(body.domain || "").trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
    if (!body.name?.trim() || !/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(domain)) return NextResponse.json({ error: "Valid property name and domain are required" }, { status: 400 });
    const exists = await prisma.analyticsReport.findFirst({ where: { companyId, description: "WEBSITE_PROPERTY", config: { path: ["domain"], equals: domain } }, select: { id: true } });
    if (exists) return NextResponse.json({ error: "Domain already exists" }, { status: 409 });
    return NextResponse.json(await prisma.analyticsReport.create({ data: { companyId, createdById: userId, name: body.name.trim(), description: "WEBSITE_PROPERTY", config: { domain, status: "MONITORED", sslStatus: "CHECKING", uptime: "Monitoring", responseTime: "Pending" } } }), { status: 201 });
  } catch (error) { return apiError(error, "Unable to add website"); }
}
export async function DELETE(request: Request) {
  try {
    const { companyId } = await authorize(PERMISSIONS.WEBSITES_MANAGE);
    const id = new URL(request.url).searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Website id is required" }, { status: 400 });
    const result = await prisma.analyticsReport.deleteMany({ where: { id, companyId, description: "WEBSITE_PROPERTY" } });
    if (!result.count) return NextResponse.json({ error: "Website not found" }, { status: 404 });
    return NextResponse.json({ message: "Website removed" });
  } catch (error) { return apiError(error, "Unable to remove website"); }
}
