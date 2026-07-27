import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
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

    console.error("Unable to resolve workspace access", error);

    if (error instanceof Prisma.PrismaClientInitializationError) {
      return NextResponse.json(
        {
          error: "The application database is unavailable.",
          code: "DATABASE_UNAVAILABLE",
        },
        { status: 503 },
      );
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      ["P2021", "P2022"].includes(error.code)
    ) {
      return NextResponse.json(
        {
          error: "The application database schema is not up to date.",
          code: "DATABASE_SCHEMA_OUTDATED",
        },
        { status: 503 },
      );
    }

    return NextResponse.json(
      { error: "Unable to resolve workspace access.", code: "ACCESS_UNAVAILABLE" },
      { status: 500 },
    );
  }
}
