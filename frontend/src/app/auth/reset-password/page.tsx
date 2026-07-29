"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { ShieldCheck, Lock, ArrowRight, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";
import { SolubrixIcon } from "@/components/brand/logo";

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please re-enter.");
      return;
    }

    setIsLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        throw updateError;
      }

      setIsSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err: any) {
      setError(err?.message || "Failed to reset password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-slate-950 p-4 relative overflow-hidden text-slate-100">
      {/* Dynamic background ambient glow */}
      <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-primary-indigo/20 blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-premium-teal/20 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Brand Logo */}
        <div className="flex flex-col items-center text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-3 transition hover:opacity-90">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-indigo to-premium-teal shadow-lg shadow-indigo-500/20">
              <SolubrixIcon className="h-7 w-7 text-white" />
            </div>
            <span className="font-heading text-2xl font-bold tracking-tight text-white">
              Solubrix
            </span>
          </Link>
          <p className="text-xs text-slate-400 font-medium">Enterprise Management Suite</p>
        </div>

        {/* Form Container */}
        <div className="rounded-3xl border border-slate-800/80 bg-slate-900/90 p-8 shadow-2xl backdrop-blur-xl">
          {isSuccess ? (
            <div className="text-center space-y-4 py-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h2 className="text-xl font-bold font-heading text-white">Password Reset Successful!</h2>
              <p className="text-sm text-slate-300">
                Your account password has been updated securely. Redirecting to login page...
              </p>
              <div className="pt-4">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-indigo text-white font-semibold text-sm hover:bg-primary-indigo/90 transition shadow-lg shadow-indigo-500/25"
                >
                  Go to Login <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1 text-center">
                <h2 className="text-xl font-bold font-heading text-white flex items-center justify-center gap-2">
                  <Lock className="w-5 h-5 text-primary-indigo" />
                  Set New Password
                </h2>
                <p className="text-xs text-slate-400">
                  Enter your new password below to update your account credentials.
                </p>
              </div>

              {error && (
                <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2.5">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-4">
                {/* New Password */}
                <div className="space-y-1.5 text-xs font-semibold text-slate-300">
                  <label htmlFor="new-password">New Password</label>
                  <div className="relative">
                    <input
                      id="new-password"
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="h-11 w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 text-sm text-white placeholder-slate-500 outline-none focus:border-primary-indigo focus:ring-4 focus:ring-primary-indigo/10 transition"
                    />
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5 text-xs font-semibold text-slate-300">
                  <label htmlFor="confirm-password">Confirm New Password</label>
                  <div className="relative">
                    <input
                      id="confirm-password"
                      type="password"
                      required
                      minLength={6}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      className="h-11 w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 text-sm text-white placeholder-slate-500 outline-none focus:border-primary-indigo focus:ring-4 focus:ring-primary-indigo/10 transition"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 rounded-xl bg-gradient-to-r from-primary-indigo to-indigo-600 text-white text-sm font-semibold hover:opacity-95 disabled:opacity-50 transition shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Updating Password...
                  </>
                ) : (
                  <>
                    Update Password <ShieldCheck className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <Link href="/login" className="text-xs text-slate-400 hover:text-white transition">
                  Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
