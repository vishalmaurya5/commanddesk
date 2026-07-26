"use client";

import type { ReactNode } from "react";

// Kept as a lightweight boundary so existing layout composition does not need
// to change. Supabase sessions are cookie-based and require no React provider.
export function SessionProvider({ children }: { children: ReactNode }) {
  return children;
}
