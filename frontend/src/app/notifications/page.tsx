"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  Trash2,
  Check,
  Filter,
} from "lucide-react";

type Notification = {
  id: string;
  title: string;
  message: string;
  time: string;
  type: "info" | "success" | "warning";
  read: boolean;
  category: "System" | "Approvals" | "Payroll" | "Security";
};

export default function NotificationsPage() {
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "n-1",
      title: "July Payroll Disbursed",
      message: "Monthly payroll processing for 42 employees completed successfully.",
      time: "10 mins ago",
      type: "success",
      read: false,
      category: "Payroll",
    },
    {
      id: "n-2",
      title: "Leave Request Pending Approval",
      message: "Marcus Vance submitted a 3-day PTO request starting Aug 3.",
      time: "1 hour ago",
      type: "info",
      read: false,
      category: "Approvals",
    },
    {
      id: "n-3",
      title: "Security Update Required",
      message: "Please enable Two-Factor Authentication on your administrator profile.",
      time: "4 hours ago",
      type: "warning",
      read: true,
      category: "Security",
    },
    {
      id: "n-4",
      title: "New Team Member Onboarded",
      message: "Elena Rostova completed her HR profile setup.",
      time: "1 day ago",
      type: "info",
      read: true,
      category: "System",
    },
  ]);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const displayedNotifications = notifications.filter((n) =>
    filter === "all" ? true : !n.read
  );

  return (
    <DashboardLayout>
      <div className="space-y-7 max-w-4xl mx-auto">
        {/* Header Banner */}
        <section className="relative overflow-hidden rounded-[28px] bg-midnight-navy px-6 py-7 text-white shadow-[0_24px_70px_rgba(15,23,42,0.18)] sm:px-8">
          <div className="absolute -right-16 -top-24 h-64 w-64 rounded-full bg-primary-indigo/50 blur-3xl" />
          <div className="absolute right-32 top-10 h-32 w-32 rounded-full bg-premium-teal/30 blur-3xl" />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-medium text-slate-200 backdrop-blur">
                <Bell className="h-3.5 w-3.5 text-teal-300" />
                Notification Center
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-white">
                Notifications
              </h1>
            </div>
            <div className="flex gap-2">
              <button
                onClick={markAllRead}
                className="flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs font-medium text-white hover:bg-white/20 transition"
              >
                <Check className="h-3.5 w-3.5" /> Mark all read
              </button>
              <button
                onClick={clearAll}
                className="flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs font-medium text-white hover:bg-white/20 transition"
              >
                <Trash2 className="h-3.5 w-3.5" /> Clear all
              </button>
            </div>
          </div>
        </section>

        {/* Filter Bar */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex gap-4 text-sm">
            <button
              onClick={() => setFilter("all")}
              className={`font-semibold transition pb-1 border-b-2 ${
                filter === "all"
                  ? "border-teal text-teal"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              All Notifications ({notifications.length})
            </button>
            <button
              onClick={() => setFilter("unread")}
              className={`font-semibold transition pb-1 border-b-2 ${
                filter === "unread"
                  ? "border-teal text-teal"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Unread ({notifications.filter((n) => !n.read).length})
            </button>
          </div>
        </div>

        {/* Notification List */}
        <div className="space-y-3">
          {displayedNotifications.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground text-sm rounded-2xl border border-border bg-card">
              No notifications to display.
            </div>
          ) : (
            displayedNotifications.map((n) => (
              <div
                key={n.id}
                className={`flex items-start justify-between rounded-2xl border p-4 transition ${
                  n.read
                    ? "border-border bg-card opacity-80"
                    : "border-teal/30 bg-teal/5 dark:bg-teal/10"
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl ${
                      n.type === "success"
                        ? "bg-emerald-500/10 text-emerald-500"
                        : n.type === "warning"
                        ? "bg-amber-500/10 text-amber-500"
                        : "bg-teal/10 text-teal"
                    }`}
                  >
                    {n.type === "success" ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : n.type === "warning" ? (
                      <AlertTriangle className="h-4 w-4" />
                    ) : (
                      <Info className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-foreground text-sm">{n.title}</h4>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                        {n.category}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{n.message}</p>
                    <span className="mt-2 block text-[10px] text-muted-foreground">{n.time}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
