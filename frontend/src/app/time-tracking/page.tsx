"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { apiClient } from "@/lib/api-client";
import {
  Clock,
  Play,
  Pause,
  Square,
  Plus,
  Calendar,
  Briefcase,
  CheckCircle2,
  Filter,
  BarChart3,
} from "lucide-react";

type TimeEntry = {
  id: string;
  project: string;
  task: string;
  date: string;
  duration: string;
  hours: number;
  status: string;
  billable: boolean;
};

export default function TimeTrackingPage() {
  const queryClient = useQueryClient();
  const [isRunning, setIsRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [activeProject, setActiveProject] = useState("SOLUBRIX Core App");
  const [activeTask, setActiveTask] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["time-tracking"],
    queryFn: async () => {
      const res = await apiClient.get("/time-tracking");
      return res.data;
    },
  });

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const formatTimer = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const addTimeMutation = useMutation({
    mutationFn: (newEntry: Partial<TimeEntry>) =>
      apiClient.post("/time-tracking", newEntry),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["time-tracking"] });
      setSeconds(0);
      setIsRunning(false);
      setActiveTask("");
    },
  });

  const handleStopTimer = () => {
    if (seconds === 0) return;
    const hours = Number((seconds / 3600).toFixed(2));
    const mins = Math.floor(seconds / 60);
    addTimeMutation.mutate({
      project: activeProject,
      task: activeTask || "Timed Session",
      hours: hours || 0.1,
      duration: `${mins}m`,
      billable: true,
    });
  };

  const entries: TimeEntry[] = data?.entries || [];
  const stats = data?.stats || { totalHoursThisWeek: 34.5, billableHours: 29.0 };

  return (
    <DashboardLayout>
      <div className="space-y-7">
        {/* Header Banner */}
        <section className="relative overflow-hidden rounded-[28px] bg-midnight-navy px-6 py-7 text-white shadow-[0_24px_70px_rgba(15,23,42,0.18)] sm:px-8">
          <div className="absolute -right-16 -top-24 h-64 w-64 rounded-full bg-primary-indigo/50 blur-3xl" />
          <div className="absolute right-32 top-10 h-32 w-32 rounded-full bg-premium-teal/30 blur-3xl" />
          <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-medium text-slate-200 backdrop-blur">
                <Clock className="h-3.5 w-3.5 text-teal-300" />
                Productivity Tracker
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Time Tracking
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                Log billable client work, monitor sprint hours, and track project efficiency in real time.
              </p>
            </div>
          </div>
        </section>

        {/* Live Timer Widget & Summary */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Active Timer Card */}
          <div className="col-span-1 rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-card-foreground">
              Live Work Timer
            </h3>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  Select Project
                </label>
                <select
                  value={activeProject}
                  onChange={(e) => setActiveProject(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="SOLUBRIX Core App">SOLUBRIX Core App</option>
                  <option value="HRMS Portal">HRMS Portal</option>
                  <option value="CRM Pipeline">CRM Pipeline</option>
                  <option value="Finance & Invoicing">Finance & Invoicing</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  What are you working on?
                </label>
                <input
                  type="text"
                  placeholder="e.g. Design responsive dashboard layout..."
                  value={activeTask}
                  onChange={(e) => setActiveTask(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex flex-col items-center justify-center rounded-2xl bg-muted/40 py-6">
                <span className="font-mono text-4xl font-bold text-foreground">
                  {formatTimer(seconds)}
                </span>
                <span className="mt-1 text-xs text-muted-foreground">
                  {isRunning ? "Timer Active" : "Timer Paused"}
                </span>
              </div>

              <div className="flex gap-2">
                {!isRunning ? (
                  <button
                    onClick={() => setIsRunning(true)}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-teal py-2.5 font-medium text-white transition hover:opacity-90"
                  >
                    <Play className="h-4 w-4 fill-current" /> Start
                  </button>
                ) : (
                  <button
                    onClick={() => setIsRunning(false)}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-amber-500 py-2.5 font-medium text-white transition hover:opacity-90"
                  >
                    <Pause className="h-4 w-4 fill-current" /> Pause
                  </button>
                )}
                <button
                  onClick={handleStopTimer}
                  disabled={seconds === 0}
                  className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 font-medium text-muted-foreground hover:bg-muted disabled:opacity-40"
                >
                  <Square className="h-4 w-4 fill-current text-rose-500" /> Save
                </button>
              </div>
            </div>
          </div>

          {/* Stats & Hours Summary */}
          <div className="col-span-1 lg:col-span-2 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">Hours This Week</span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal/10 text-teal">
                    <Clock className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-3 text-3xl font-bold text-foreground">
                  {stats.totalHoursThisWeek}h
                </div>
                <span className="text-xs text-emerald-500">+4.2h vs last week</span>
              </div>

              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">Billable Hours</span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-500">
                    <BarChart3 className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-3 text-3xl font-bold text-foreground">
                  {stats.billableHours}h
                </div>
                <span className="text-xs text-muted-foreground">84% billable ratio</span>
              </div>
            </div>

            {/* Time Entries Table */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-card-foreground">
                  Recent Time Entries
                </h3>
                <span className="text-xs text-muted-foreground">Sorted by newest</span>
              </div>

              {isLoading ? (
                <div className="py-12 text-center text-sm text-muted-foreground">
                  Loading time logs...
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-border text-xs text-muted-foreground uppercase tracking-wider">
                        <th className="pb-3 font-medium">Project & Task</th>
                        <th className="pb-3 font-medium">Date</th>
                        <th className="pb-3 font-medium">Duration</th>
                        <th className="pb-3 font-medium">Type</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {entries.map((entry) => (
                        <tr key={entry.id} className="hover:bg-muted/30">
                          <td className="py-3.5">
                            <div className="font-medium text-foreground">{entry.task}</div>
                            <div className="text-xs text-muted-foreground">{entry.project}</div>
                          </td>
                          <td className="py-3.5 text-muted-foreground">{entry.date}</td>
                          <td className="py-3.5 font-semibold text-foreground">{entry.duration}</td>
                          <td className="py-3.5">
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                entry.billable
                                  ? "bg-teal/10 text-teal"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {entry.billable ? "Billable" : "Non-billable"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
