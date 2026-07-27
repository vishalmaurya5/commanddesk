import { NextResponse } from "next/server";
import { authorize } from "@/lib/saas/authorize";
import { apiError } from "@/lib/saas/api-error";
import { PERMISSIONS } from "@/lib/saas/permissions";
import { seedWorkspaceDemoData } from "@/lib/saas/seed-workspace-demo-data";

export async function POST() {
  try {
    const { companyId, userId } = await authorize(PERMISSIONS.COMPANY_VIEW);
    const result = await seedWorkspaceDemoData(companyId, userId);

    if (!result.success && result.message) {
      return NextResponse.json({ message: result.message });
    }

    if (!result.success && result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: result.message });
  } catch (error) {
    return apiError(error, "Unable to seed workspace data");
  }
}
