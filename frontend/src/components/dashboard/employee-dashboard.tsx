"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import Link from "next/link";
import {
  CheckSquare,
  Clock,
  Calendar,
  Receipt,
  ArrowUpRight,
  ShieldCheck,
  Building2,
  Briefcase,
  AlertCircle,
  PlusCircle,
  FileText,
  MessageSquare,
  UserCheck,
  CheckCircle2,
} from "lucide-react";

interface EmployeeUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  avatarUrl?: string | null;
  departmentIds?: string[];
  department?: { id: string; name: string } | null;
  employeeProfile?: {
    designation?: string | null;
    joiningDate?: string | null;
    workMode?: string | null;
    aadhaarNumber?: string | null;
    aadhaarCardUrl?: string | null;
  } | null;
}

interface EmployeeDashboardProps {
  user: EmployeeUser;
}

export function EmployeeDashboard({ user }: EmployeeDashboardProps) {
  const { data: tasks = [] } = useQuery<any[]>({
    queryKey: ["employee-my-tasks"],
    queryFn: () => apiClient.get("/tasks").then((res) => res.data),
  });

  const { data: attendanceData } = useQuery<any>({
    queryKey: ["employee-my-attendance"],
    queryFn: () => apiClient.get("/attendance").then((res) => res.data).catch(() => null),
  });

  const { data: leavesData = [] } = useQuery<any[]>({
    queryKey: ["employee-my-leaves"],
    queryFn: () => apiClient.get("/leaves").then((res) => res.data).catch(() => []),
  });

  const fullName = `${user.firstName || "Employee"} ${user.lastName || ""}`.trim();
  const designation = user.employeeProfile?.designation || "Team Member";
  const workMode = user.employeeProfile?.workMode || "OFFICE";

  // Filter tasks assigned to me or general open tasks
  const myTasks = Array.isArray(tasks)
    ? tasks.filter((t) => t.assigneeId === user.id || t.assignee?.id === user.id || t.userId === user.id)
    : [];
  const pendingTasks = myTasks.filter((t) => t.status !== "COMPLETED" && t.status !== "DONE");

  const pendingLeaves = Array.isArray(leavesData)
    ? leavesData.filter((l) => l.status === "PENDING" || l.status === "APPROVED")
    : [];

  return (
    <div className="space-y-8">
      {/* Employee Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-midnight-navy via-slate-900 to-indigo-950 p-6 md:p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 h-64 w-64 rounded-full bg-primary-indigo/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/3 -mb-12 h-48 w-48 rounded-full bg-teal/15 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-5">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-indigo to-premium-teal text-xl font-bold text-white shadow-lg shadow-indigo-500/25 border border-white/20">
              {user.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.avatarUrl} alt={fullName} className="h-full w-full rounded-2xl object-cover" />
              ) : (
                `${user.firstName?.[0] ?? "E"}${user.lastName?.[0] ?? ""}`
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1 rounded-full bg-teal/20 border border-teal/30 px-3 py-0.5 text-xs font-semibold text-teal-300">
                  <UserCheck className="w-3.5 h-3.5 text-teal" /> Employee Portal
                </span>
                <span className="inline-flex items-center rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-medium text-slate-300">
                  {workMode}
                </span>
                {user.employeeProfile?.aadhaarNumber && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-medium text-emerald-300">
                    <ShieldCheck className="w-3 h-3" /> Aadhaar Verified
                  </span>
                )}
              </div>

              <h1 className="font-heading text-2xl md:text-3xl font-bold tracking-tight text-white">
                Welcome back, {fullName}!
              </h1>

              <div className="flex items-center gap-3 text-xs text-slate-300 flex-wrap">
                <span className="font-semibold text-premium-teal">{designation}</span>
                {user.department?.name && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      {user.department.name}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <Link
              href="/attendance"
              className="inline-flex items-center gap-2 rounded-xl bg-primary-indigo px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 hover:bg-primary-indigo/90 transition"
            >
              <Clock className="w-4 h-4" /> Attendance & Clock-In
            </Link>
            <Link
              href="/leaves"
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 border border-white/20 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/20 transition"
            >
              <Calendar className="w-4 h-4" /> Apply Leave
            </Link>
          </div>
        </div>
      </div>

      {/* Personal Work Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Assigned Tasks */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-soft dark:border-gray-800 dark:bg-midnight-navy">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              My Assigned Tasks
            </span>
            <div className="rounded-xl bg-indigo-50 p-2.5 text-primary-indigo dark:bg-indigo-950/40">
              <CheckSquare className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-3xl font-bold font-mono text-midnight-navy dark:text-white">
              {pendingTasks.length}
            </h3>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {myTasks.length} total tasks assigned
            </p>
          </div>
          <Link href="/tasks" className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-primary-indigo hover:underline">
            View all my tasks <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Today's Attendance */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-soft dark:border-gray-800 dark:bg-midnight-navy">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Today's Attendance
            </span>
            <div className="rounded-xl bg-teal-50 p-2.5 text-premium-teal dark:bg-teal-950/40">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Active Today
            </div>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Check-in logged at 09:30 AM
            </p>
          </div>
          <Link href="/attendance" className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-premium-teal hover:underline">
            Log time & check-out <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Leave Balance */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-soft dark:border-gray-800 dark:bg-midnight-navy">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Leave Balance
            </span>
            <div className="rounded-xl bg-amber-50 p-2.5 text-amber-600 dark:bg-amber-950/40">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-3xl font-bold font-mono text-midnight-navy dark:text-white">
              12 Days
            </h3>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {pendingLeaves.length} active leave request
            </p>
          </div>
          <Link href="/leaves" className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline">
            Request time off <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Payslips & Salary */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-soft dark:border-gray-800 dark:bg-midnight-navy">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              My Payroll & Payslips
            </span>
            <div className="rounded-xl bg-sky-50 p-2.5 text-sky-600 dark:bg-sky-950/40">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="inline-block text-sm font-semibold text-emerald-600 dark:text-emerald-400">
              Latest Payslip Ready
            </span>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Monthly salary statement available
            </p>
          </div>
          <Link href="/payroll" className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline">
            Download payslip <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Employee Quick Work Actions */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-soft dark:border-gray-800 dark:bg-midnight-navy">
        <h3 className="mb-4 font-heading text-lg font-semibold text-midnight-navy dark:text-white">
          My Quick Work Actions
        </h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {[
            { label: "My Tasks", icon: CheckSquare, href: "/tasks", bg: "bg-indigo-50 dark:bg-indigo-950/30", color: "text-primary-indigo" },
            { label: "Clock In / Out", icon: Clock, href: "/attendance", bg: "bg-teal-50 dark:bg-teal-950/30", color: "text-premium-teal" },
            { label: "Apply Leave", icon: Calendar, href: "/leaves", bg: "bg-amber-50 dark:bg-amber-950/30", color: "text-amber-600" },
            { label: "My Payslips", icon: Receipt, href: "/payroll", bg: "bg-sky-50 dark:bg-sky-950/30", color: "text-sky-600" },
            { label: "HR Policies", icon: FileText, href: "/hrms", bg: "bg-purple-50 dark:bg-purple-950/30", color: "text-purple-600" },
            { label: "Help & Support", icon: MessageSquare, href: "/support", bg: "bg-rose-50 dark:bg-rose-950/30", color: "text-rose-600" },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex cursor-pointer flex-col items-center justify-center gap-2.5 rounded-2xl border border-gray-100 bg-white p-4 text-center transition-all hover:-translate-y-0.5 hover:border-primary-indigo/20 hover:shadow-md dark:border-gray-800 dark:bg-gray-900/60 dark:hover:border-primary-indigo/40"
            >
              <div className={`rounded-xl p-3 ${item.bg} ${item.color}`}>
                <item.icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* My Active Tasks & Deliverables Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-gray-100 bg-white p-6 shadow-soft dark:border-gray-800 dark:bg-midnight-navy">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-heading text-lg font-semibold text-midnight-navy dark:text-white">
                My Active Tasks & Work
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Tasks assigned to you requiring attention
              </p>
            </div>
            <Link href="/tasks" className="text-xs font-semibold text-primary-indigo hover:underline flex items-center gap-1">
              View All <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {pendingTasks.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-200 p-8 text-center dark:border-gray-700">
              <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-500" />
              <p className="mt-2 text-sm font-semibold text-gray-700 dark:text-gray-200">All caught up!</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">You have no pending tasks assigned to you right now.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingTasks.slice(0, 5).map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between rounded-xl border border-gray-100 bg-slate-50/50 p-4 transition-all hover:bg-gray-100 dark:border-gray-800 dark:bg-slate-900/60 dark:hover:bg-slate-800/80"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-midnight-navy dark:text-white">
                        {task.title}
                      </span>
                      <span className="rounded-md bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 text-[10px] font-bold text-primary-indigo">
                        {task.status || "IN_PROGRESS"}
                      </span>
                    </div>
                    {task.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                        {task.description}
                      </p>
                    )}
                  </div>
                  <Link
                    href={`/tasks`}
                    className="rounded-lg bg-white border border-gray-200 px-3 py-1.5 text-xs font-medium text-slate-700 shadow-xs hover:bg-slate-50 dark:border-gray-700 dark:bg-gray-800 dark:text-slate-200"
                  >
                    Open Task
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Company Announcements & Quick Support */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-soft dark:border-gray-800 dark:bg-midnight-navy">
            <h3 className="font-heading text-lg font-semibold text-midnight-navy dark:text-white mb-3">
              Company Announcements
            </h3>
            <div className="space-y-3">
              <div className="rounded-xl bg-indigo-50/70 p-3.5 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50">
                <p className="text-xs font-bold text-primary-indigo">Q3 All-Hands Meeting</p>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                  Join the quarterly team updates meeting on Friday at 4:00 PM.
                </p>
              </div>
              <div className="rounded-xl bg-teal-50/70 p-3.5 dark:bg-teal-950/30 border border-teal-100 dark:border-teal-900/50">
                <p className="text-xs font-bold text-premium-teal">Updated HR Policy</p>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                  New remote work guidance is now live under HRMS Documents.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
