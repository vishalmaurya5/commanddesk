"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { name: "Jan", revenue: 1850000, expenses: 1200000 },
  { name: "Feb", revenue: 2200000, expenses: 1350000 },
  { name: "Mar", revenue: 1950000, expenses: 1280000 },
  { name: "Apr", revenue: 2650000, expenses: 1500000 },
  { name: "May", revenue: 2400000, expenses: 1420000 },
  { name: "Jun", revenue: 2850000, expenses: 1650000 },
  { name: "Jul", revenue: 3100000, expenses: 1800000 },
  { name: "Aug", revenue: 2950000, expenses: 1750000 },
  { name: "Sep", revenue: 3400000, expenses: 1900000 },
  { name: "Oct", revenue: 3200000, expenses: 1850000 },
  { name: "Nov", revenue: 3650000, expenses: 2000000 },
  { name: "Dec", revenue: 3800000, expenses: 2100000 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass rounded-xl p-3 shadow-lg border border-border">
        <p className="text-sm font-medium text-foreground mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground">{entry.name}:</span>
            <span className="font-medium text-foreground">
              ₹{(entry.value / 100000).toFixed(1)}L
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

interface RevenueChartProps {
  className?: string;
}

export function RevenueChart({ className }: RevenueChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
      className={cn("stat-card", className)}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Revenue Overview</h3>
          <p className="text-sm text-muted-foreground">Monthly revenue vs expenses</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-xs text-muted-foreground">Revenue</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-teal" />
            <span className="text-xs text-muted-foreground">Expenses</span>
          </div>
        </div>
      </div>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
              tickFormatter={(value) => `₹${(value / 100000).toFixed(0)}L`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="var(--primary)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6, fill: "var(--primary)" }}
            />
            <Line
              type="monotone"
              dataKey="expenses"
              stroke="var(--teal)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6, fill: "var(--teal)" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
