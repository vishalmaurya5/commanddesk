"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface DashboardLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function DashboardLayout({ children, className }: DashboardLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="relative min-h-screen bg-background text-foreground transition-colors duration-300">
      <Sidebar
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div className="lg:pl-[260px] flex flex-col min-h-screen transition-all duration-300">
        <Header onMobileToggle={() => setMobileOpen(true)} />

        <motion.main
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className={cn("flex-1 mx-auto w-full max-w-[1680px] p-4 sm:p-6 lg:p-8", className)}
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}
