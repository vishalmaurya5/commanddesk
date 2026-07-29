import { type EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const token_hash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") || "/";
  const authError = url.searchParams.get("error") || url.searchParams.get("error_description");

  const rawOrigin = url.origin && url.origin !== "null" ? url.origin : null;
  const origin = rawOrigin || process.env.NEXT_PUBLIC_APP_URL || "https://commanddesk-gold.vercel.app";

  if (authError) {
    return NextResponse.redirect(
      new URL(`/auth/verify?error=${encodeURIComponent(authError)}`, origin)
    );
  }

  const supabase = await createClient();

  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });
    if (!error) {
      return NextResponse.redirect(
        new URL(`/auth/verify?status=success&next=${encodeURIComponent(next)}`, origin)
      );
    }
  }

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(
        new URL(`/auth/verify?status=success&next=${encodeURIComponent(next)}`, origin)
      );
    }
  }

  return NextResponse.redirect(new URL("/auth/verify?error=invalid_or_expired_link", origin));
}
