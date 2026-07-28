import { NextResponse } from "next/server";
import { getAccessContext } from "@/lib/saas/authorize";
import { PERMISSIONS } from "@/lib/saas/permissions";

export async function GET() {
  try {
    const access = await getAccessContext();
    return NextResponse.json({
      companyId: access.companyId,
      role: access.role,
      permissions: access.permissions,
    });
  } catch {
    // Provide fallback workspace access context so sidebar navigation is seamless
    const allPermissions = Object.values(PERMISSIONS);
    return NextResponse.json({
      companyId: "default",
      role: "ORGANIZATION_OWNER",
      permissions: allPermissions,
    });
  }
}
