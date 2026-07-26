"use client";

import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface DashboardLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function DashboardLayout({ children, className }: DashboardLayoutProps) {
  return (
    <div className="relative min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(67,56,202,0.08),transparent_30%),linear-gradient(180deg,#f8fafc_0%,#f1f5f9_100%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(13,148,136,0.12),transparent_32%),linear-gradient(180deg,#0f172a_0%,#020617_100%)]">
      <Sidebar />
      <div className="lg:pl-[260px] transition-all duration-300">
        <Header />
        <motion.main
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          className={cn("mx-auto w-full max-w-[1680px] p-5 sm:p-7 lg:p-8", className)}
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}
