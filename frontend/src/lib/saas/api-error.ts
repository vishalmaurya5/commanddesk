import { NextResponse } from "next/server";
import { AuthorizationError } from "@/lib/saas/authorize";

export function apiError(error: unknown, fallback = "Internal server error") {
  if (error instanceof AuthorizationError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  console.error(error);
  return NextResponse.json({ error: fallback }, { status: 500 });
}
