import { NextResponse } from "next/server";
import { AuthorizationError, getAccessContext } from "@/lib/saas/authorize";

export async function GET() {
  try {
    const access = await getAccessContext();
    return NextResponse.json({
      companyId: access.companyId,
      role: access.role,
      permissions: access.permissions,
    });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Unable to resolve access" }, { status: 500 });
  }
}
