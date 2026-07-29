import { type EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getRequestOrigin } from "@/utils/origin";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const token_hash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;
  const next = url.searchParams.get("next") || "/";
  const authError = url.searchParams.get("error") || url.searchParams.get("error_description");

  const origin = getRequestOrigin(request);

  if (authError) {
    return NextResponse.redirect(
      new URL(`/auth/verify?error=${encodeURIComponent(authError)}`, origin)
    );
  }

  const supabase = await createClient();

  // Handle password recovery flow
  const isRecovery = type === "recovery" || next.includes("reset-password");
  const targetDestination = isRecovery ? "/auth/reset-password" : next;

  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });
    if (!error) {
      if (isRecovery) {
        return NextResponse.redirect(new URL("/auth/reset-password", origin));
      }
      return NextResponse.redirect(
        new URL(`/auth/verify?status=success&next=${encodeURIComponent(targetDestination)}`, origin)
      );
    }
  }

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      if (isRecovery) {
        return NextResponse.redirect(new URL("/auth/reset-password", origin));
      }
      return NextResponse.redirect(
        new URL(`/auth/verify?status=success&next=${encodeURIComponent(targetDestination)}`, origin)
      );
    }
  }

  return NextResponse.redirect(new URL("/auth/verify?error=invalid_or_expired_link", origin));
}

