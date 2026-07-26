"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { apiClient } from "@/lib/api-client";
import {
  Settings,
  User,
  Building,
  Shield,
  Bell,
  CreditCard,
  Globe,
  Save,
  Check,
} from "lucide-react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"profile" | "organization" | "notifications" | "security">("profile");
  const [saved, setSaved] = useState(false);

  const { data } = useQuery({
    queryKey: ["settings-data"],
    queryFn: async () => {
      const res = await apiClient.get("/settings");
      return res.data;
    },
  });

  const settings = data?.settings || {
    profile: {
      fullName: "Alex Rivera",
      email: "alex.rivera@commanddesk.io",
      role: "Administrator",
      timezone: "UTC-5 (Eastern Time)",
    },
    organization: {
      companyName: "CommandDesk Enterprise",
      workspaceUrl: "commanddesk.io/org/enterprise",
      taxId: "US-894210952",
      currency: "USD ($)",
    },
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <DashboardLayout>
      <div className="space-y-7 max-w-5xl mx-auto">
        {/* Header Banner */}
        <section className="relative overflow-hidden rounded-[28px] bg-midnight-navy px-6 py-7 text-white shadow-[0_24px_70px_rgba(15,23,42,0.18)] sm:px-8">
          <div className="absolute -right-16 -top-24 h-64 w-64 rounded-full bg-primary-indigo/50 blur-3xl" />
          <div className="absolute right-32 top-10 h-32 w-32 rounded-full bg-premium-teal/30 blur-3xl" />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-medium text-slate-200 backdrop-blur">
                <Settings className="h-3.5 w-3.5 text-teal-300" />
                System Preferences
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-white">
                Workspace Settings
              </h1>
            </div>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 rounded-xl bg-teal px-4 py-2.5 font-medium text-white shadow-lg transition hover:opacity-90"
            >
              {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
              {saved ? "Saved Changes!" : "Save Changes"}
            </button>
          </div>
        </section>

        {/* Settings Navigation & Panel */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Navigation */}
          <div className="col-span-1 rounded-2xl border border-border bg-card p-3 space-y-1">
            <button
              onClick={() => setActiveTab("profile")}
              className={`flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition ${
                activeTab === "profile"
                  ? "bg-teal text-white"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <User className="h-4 w-4" /> Profile Info
            </button>
            <button
              onClick={() => setActiveTab("organization")}
              className={`flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition ${
                activeTab === "organization"
                  ? "bg-teal text-white"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Building className="h-4 w-4" /> Organization Details
            </button>
            <button
              onClick={() => setActiveTab("security")}
              className={`flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition ${
                activeTab === "security"
                  ? "bg-teal text-white"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Shield className="h-4 w-4" /> Security & 2FA
            </button>
            <button
              onClick={() => setActiveTab("notifications")}
              className={`flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition ${
                activeTab === "notifications"
                  ? "bg-teal text-white"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Bell className="h-4 w-4" /> Notification Alerts
            </button>
          </div>

          {/* Form Content */}
          <div className="col-span-1 md:col-span-3 rounded-2xl border border-border bg-card p-6 shadow-sm">
            {activeTab === "profile" && (
              <div className="space-y-4">
                <h3 className="text-base font-semibold text-foreground">User Profile Settings</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">Full Name</label>
                    <input
                      type="text"
                      defaultValue={settings.profile.fullName}
                      className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">Email Address</label>
                    <input
                      type="email"
                      defaultValue={settings.profile.email}
                      className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">Role</label>
                    <input
                      type="text"
                      disabled
                      defaultValue={settings.profile.role}
                      className="w-full rounded-xl border border-input bg-muted px-3 py-2 text-sm text-muted-foreground"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">Timezone</label>
                    <input
                      type="text"
                      defaultValue={settings.profile.timezone}
                      className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "organization" && (
              <div className="space-y-4">
                <h3 className="text-base font-semibold text-foreground">Organization Configuration</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">Company Name</label>
                    <input
                      type="text"
                      defaultValue={settings.organization.companyName}
                      className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">Tax Registration ID</label>
                    <input
                      type="text"
                      defaultValue={settings.organization.taxId}
                      className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "security" && (
              <div className="space-y-4">
                <h3 className="text-base font-semibold text-foreground">Security & Passwords</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-xl border border-border p-4">
                    <div>
                      <div className="font-semibold text-foreground text-sm">Two-Factor Authentication (2FA)</div>
                      <div className="text-xs text-muted-foreground">Protect your account with SMS or authenticator app.</div>
                    </div>
                    <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-500">
                      Enabled
                    </span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "notifications" && (
              <div className="space-y-4">
                <h3 className="text-base font-semibold text-foreground">Notification Preferences</h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 text-sm text-foreground">
                    <input type="checkbox" defaultChecked className="rounded border-input text-teal focus:ring-teal" />
                    Receive daily email digests of pending leave approvals
                  </label>
                  <label className="flex items-center gap-3 text-sm text-foreground">
                    <input type="checkbox" defaultChecked className="rounded border-input text-teal focus:ring-teal" />
                    Desktop alerts for direct messages and team channels
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
