import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const rawOrigin = url.origin && url.origin !== "null" ? url.origin : null;
  const origin = rawOrigin || process.env.NEXT_PUBLIC_APP_URL || "https://commanddesk-gold.vercel.app";

  const targetUrl = new URL("/auth/verify", origin);
  url.searchParams.forEach((value, key) => {
    targetUrl.searchParams.set(key, value);
  });

  return NextResponse.redirect(targetUrl);
}
