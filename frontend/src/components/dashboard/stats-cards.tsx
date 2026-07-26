"use client";

import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Target,
  Briefcase,
  CalendarCheck,
  CheckSquare,
} from "lucide-react";

interface StatCardProps {
  title: string;
  value: number;
  change: number;
  icon: React.ReactNode;
  format?: "currency" | "number";
  delay?: number;
}

function StatCard({ title, value, change, icon, format: fmt = "number", delay = 0 }: StatCardProps) {
  const isPositive = change >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay }}
      className="stat-card group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
          {icon}
        </div>
        <div
          className={cn(
            "flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium",
            isPositive
              ? "bg-success/10 text-success"
              : "bg-danger/10 text-danger"
          )}
        >
          {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          <span>{Math.abs(change)}%</span>
        </div>
      </div>
      <div>
        <p className="text-sm text-muted-foreground mb-1">{title}</p>
        <h3 className="text-2xl font-bold font-mono text-foreground">
          {fmt === "currency" ? `₹${formatNumber(value)}` : formatNumber(value)}
        </h3>
      </div>
    </motion.div>
  );
}

interface StatsCardsProps {
  className?: string;
}

export function StatsCards({ className }: StatsCardsProps) {
  const stats = [
    {
      title: "Revenue",
      value: 28450000,
      change: 12.5,
      icon: <DollarSign size={20} />,
      format: "currency" as const,
    },
    {
      title: "Active Employees",
      value: 1284,
      change: 8.2,
      icon: <Users size={20} />,
    },
    {
      title: "Active Projects",
      value: 48,
      change: -3.1,
      icon: <Briefcase size={20} />,
    },
    {
      title: "Leads",
      value: 892,
      change: 15.7,
      icon: <Target size={20} />,
    },
    {
      title: "Attendance",
      value: 94,
      change: 2.4,
      icon: <CalendarCheck size={20} />,
    },
    {
      title: "Tasks Completed",
      value: 342,
      change: 22.3,
      icon: <CheckSquare size={20} />,
    },
  ];

  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4", className)}>
      {stats.map((stat, index) => (
        <StatCard key={stat.title} {...stat} delay={index * 0.05} />
      ))}
    </div>
  );
}
