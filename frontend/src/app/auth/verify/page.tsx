"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { SolubrixLogo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Mail,
  AlertTriangle,
  Loader2,
  ArrowRight,
  RefreshCw,
  KeyRound,
  ShieldCheck,
} from "lucide-react";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [emailInput, setEmailInput] = useState(searchParams.get("email") || "");
  const [otpCode, setOtpCode] = useState("");
  const [status, setStatus] = useState<"loading" | "success" | "pending" | "error">(
    searchParams.get("status") === "success" ? "success" : "pending"
  );
  const [errorMessage, setErrorMessage] = useState(
    searchParams.get("error") === "invalid_or_expired_link"
      ? "This verification link is invalid or has expired. Please request a new one."
      : searchParams.get("error") || ""
  );
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  const nextDestination = searchParams.get("next") || "/";

  useEffect(() => {
    let isMounted = true;

    async function checkVerificationState() {
      // Check query params for status, code, or token_hash
      const paramStatus = searchParams.get("status");
      const paramError = searchParams.get("error");
      const code = searchParams.get("code");
      const token_hash = searchParams.get("token_hash");
      const type = searchParams.get("type") || "signup";

      if (paramStatus === "success") {
        if (isMounted) setStatus("success");
        return;
      }

      if (paramError) {
        if (isMounted) {
          setStatus("error");
          setErrorMessage(
            paramError === "invalid_or_expired_link"
              ? "This verification link is invalid or has expired."
              : decodeURIComponent(paramError)
          );
        }
        return;
      }

      // If code or token_hash present in query
      if (code) {
        if (isMounted) setStatus("loading");
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!isMounted) return;
        if (!error) {
          setStatus("success");
        } else {
          setStatus("error");
          setErrorMessage(error.message);
        }
        return;
      }

      if (token_hash) {
        if (isMounted) setStatus("loading");
        const { error } = await supabase.auth.verifyOtp({
          token_hash,
          type: type as any,
        });
        if (!isMounted) return;
        if (!error) {
          setStatus("success");
        } else {
          setStatus("error");
          setErrorMessage(error.message);
        }
        return;
      }

      // Check hash fragment in URL for client-side implicit flow (#access_token=...)
      if (typeof window !== "undefined" && window.location.hash) {
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");

        if (accessToken && refreshToken) {
          if (isMounted) setStatus("loading");
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (!isMounted) return;
          if (!error) {
            setStatus("success");
            return;
          }
        }
      }

      // Check if user is already logged in and email confirmed
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!isMounted) return;
      if (user?.email_confirmed_at) {
        setStatus("success");
      }
    }

    checkVerificationState();

    return () => {
      isMounted = false;
    };
  }, [searchParams, supabase.auth]);

  const handleResendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput) return;

    setIsResending(true);
    setResendSuccess(false);
    setErrorMessage("");

    try {
      const origin =
        typeof window !== "undefined" && window.location.origin
          ? window.location.origin
          : process.env.NEXT_PUBLIC_APP_URL || "https://commanddesk-gold.vercel.app";

      const { error } = await supabase.auth.resend({
        type: "signup",
        email: emailInput,
        options: {
          emailRedirectTo: `${origin}/auth/callback`,
        },
      });

      if (error) throw error;
      setResendSuccess(true);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to resend verification email.");
    } finally {
      setIsResending(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !otpCode) return;

    setIsVerifyingOtp(true);
    setErrorMessage("");

    try {
      const { error } = await supabase.auth.verifyOtp({
        email: emailInput,
        token: otpCode.trim(),
        type: "signup",
      });

      if (error) {
        // Fallback check email verification
        const { error: emailError } = await supabase.auth.verifyOtp({
          email: emailInput,
          token: otpCode.trim(),
          type: "email",
        });
        if (emailError) throw emailError;
      }

      setStatus("success");
    } catch (err: any) {
      setErrorMessage(err.message || "Invalid verification code.");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-grid-white/5 pointer-events-none" />
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-teal/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg relative z-10">
        <div className="flex justify-center mb-8">
          <SolubrixLogo size="lg" showTagline />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-card/90 backdrop-blur-xl border border-border p-8 rounded-3xl shadow-2xl text-card-foreground"
        >
          <AnimatePresence mode="wait">
            {status === "loading" && (
              <motion.div
                key="loading"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="text-center py-8 space-y-4"
              >
                <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
                <h2 className="text-2xl font-bold font-heading">Verifying Your Email</h2>
                <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                  Please wait a moment while we validate your security token...
                </p>
              </motion.div>
            )}

            {status === "success" && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="text-center py-6 space-y-6"
              >
                <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                  <CheckCircle2 className="w-10 h-10 animate-bounce" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold font-heading text-foreground">
                    Email Verified Successfully!
                  </h2>
                  <p className="text-muted-foreground text-sm mt-2">
                    Your account has been authenticated. You can now access all workspace features.
                  </p>
                </div>
                <div className="pt-2">
                  <Button
                    size="lg"
                    className="w-full"
                    onClick={() => {
                      router.push(nextDestination);
                      router.refresh();
                    }}
                  >
                    Continue to Workspace <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </motion.div>
            )}

            {(status === "pending" || status === "error") && (
              <motion.div
                key="pending"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-6"
              >
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                    <Mail className="w-8 h-8" />
                  </div>
                  <h2 className="text-2xl font-bold font-heading">Verify Your Email Address</h2>
                  <p className="text-muted-foreground text-sm max-w-md mx-auto">
                    We sent a verification link to{" "}
                    <span className="font-semibold text-foreground">
                      {emailInput || "your email address"}
                    </span>
                    . Please check your inbox and click the link to confirm your account.
                  </p>
                </div>

                {errorMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-sm flex items-start gap-3"
                  >
                    <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                    <div>{errorMessage}</div>
                  </motion.div>
                )}

                {resendSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm flex items-center gap-3"
                  >
                    <ShieldCheck className="w-5 h-5 shrink-0" />
                    <div>Verification link sent! Check your inbox or spam folder.</div>
                  </motion.div>
                )}

                {/* Optional OTP Code input */}
                <form onSubmit={handleVerifyOtp} className="space-y-3 pt-2 border-t border-border">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Have a 6-digit confirmation code?
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <KeyRound className="w-4 h-4 absolute left-3 top-3.5 text-muted-foreground" />
                      <input
                        type="text"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        placeholder="Enter 6-digit code"
                        maxLength={8}
                        className="w-full h-11 pl-9 pr-3 rounded-xl border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    </div>
                    <Button type="submit" size="default" disabled={isVerifyingOtp || !otpCode}>
                      {isVerifyingOtp ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify Code"}
                    </Button>
                  </div>
                </form>

                {/* Resend Email Form */}
                <form onSubmit={handleResendEmail} className="space-y-3">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Didn&apos;t receive the email?
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="Confirm your email"
                      required
                      className="flex-1 h-11 px-3 rounded-xl border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                    <Button variant="outline" type="submit" disabled={isResending}>
                      {isResending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <RefreshCw className="w-4 h-4 mr-1.5" /> Resend
                        </>
                      )}
                    </Button>
                  </div>
                </form>

                <div className="text-center pt-4 border-t border-border">
                  <button
                    type="button"
                    onClick={() => router.push("/login")}
                    className="text-sm text-muted-foreground hover:text-foreground font-medium transition-colors"
                  >
                    Back to Sign In
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
