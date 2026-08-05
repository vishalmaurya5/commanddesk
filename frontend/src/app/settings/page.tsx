"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Camera, Check, Save, Settings, Shield, User, Building } from "lucide-react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { apiClient } from "@/lib/api-client";

type SettingsData = {
  profile: {
    firstName: string;
    lastName: string;
    fullName: string;
    email: string;
    phone: string;
    avatarUrl: string | null;
    role: string;
    timezone: string;
  };
  organization: {
    companyName: string;
    taxId: string;
    email: string;
    phone: string;
    timezone: string;
    country: string;
  };
  security: {
    twoFactorEnabled: boolean;
  };
};

export default function SettingsPage() {
  const { data, isLoading, error } = useQuery<{
    settings: SettingsData;
    canManageOrganization: boolean;
  }>({
    queryKey: ["settings-data"],
    queryFn: () => apiClient.get("/settings").then((response) => response.data),
  });

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl space-y-7">
        <section className="relative overflow-hidden rounded-[28px] bg-midnight-navy px-6 py-7 text-white shadow-[0_24px_70px_rgba(15,23,42,0.18)] sm:px-8">
          <div className="absolute -right-16 -top-24 h-64 w-64 rounded-full bg-primary-indigo/50 blur-3xl" />
          <div className="relative">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-medium text-slate-200">
              <Settings className="h-3.5 w-3.5 text-teal-300" />
              System Preferences
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Workspace Settings</h1>
          </div>
        </section>

        {isLoading && (
          <div className="h-80 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />
        )}
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
            Settings could not be loaded. Refresh and try again.
          </div>
        )}
        {data && (
          <SettingsForm
            key={`${data.settings.profile.email}-${data.settings.profile.avatarUrl ?? ""}`}
            initial={data.settings}
            canManageOrganization={data.canManageOrganization}
          />
        )}
      </div>
    </DashboardLayout>
  );
}

function SettingsForm({
  initial,
  canManageOrganization,
}: {
  initial: SettingsData;
  canManageOrganization: boolean;
}) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"profile" | "organization" | "security" | "roles">("profile");
  const [message, setMessage] = useState("");
  const [profile, setProfile] = useState({
    firstName: initial.profile.firstName,
    lastName: initial.profile.lastName,
    phone: initial.profile.phone,
  });
  const [organization, setOrganization] = useState(initial.organization);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDesc, setNewRoleDesc] = useState("");

  const save = useMutation({
    mutationFn: () =>
      activeTab === "organization"
        ? apiClient.patch("/settings", { scope: "organization", ...organization })
        : apiClient.patch("/settings", { scope: "profile", ...profile }),
    onSuccess: async () => {
      setMessage("Changes saved successfully.");
      await queryClient.invalidateQueries({ queryKey: ["settings-data"] });
      window.setTimeout(() => setMessage(""), 2500);
    },
  });

  const uploadAvatar = useMutation({
    mutationFn: async (file: File) => {
      const allowed = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
      if (!allowed.has(file.type)) {
        throw new Error("Only JPG, PNG, WEBP, and GIF images are allowed.");
      }
      if (file.size > 5 * 1024 * 1024) {
        throw new Error("Profile image must be 5 MB or smaller.");
      }
      const payload = new FormData();
      payload.append("avatar", file);
      return apiClient.post("/profile/avatar", payload);
    },
    onSuccess: async () => {
      setMessage("Profile picture updated.");
      await queryClient.invalidateQueries({ queryKey: ["settings-data"] });
    },
  });

  const { data: rolesData } = useQuery<{
    customRoles?: Array<{ id: string; name: string; description?: string; _count?: { memberships: number } }>;
  }>({
    queryKey: ["settings-roles"],
    queryFn: () => apiClient.get("/roles").then((res) => res.data),
    enabled: activeTab === "roles",
  });

  const createRoleMutation = useMutation({
    mutationFn: () => apiClient.post("/roles", { name: newRoleName, description: newRoleDesc }),
    onSuccess: async () => {
      setMessage("New custom role created successfully.");
      setNewRoleName("");
      setNewRoleDesc("");
      await queryClient.invalidateQueries({ queryKey: ["settings-roles"] });
      await queryClient.invalidateQueries({ queryKey: ["custom-roles"] });
      window.setTimeout(() => setMessage(""), 3000);
    },
  });

  const tabs = [
    { id: "profile" as const, label: "Profile Info", icon: User },
    ...(canManageOrganization
      ? [{ id: "organization" as const, label: "Organization", icon: Building }]
      : []),
    { id: "roles" as const, label: "Roles & Permissions", icon: Shield },
    { id: "security" as const, label: "Security", icon: Shield },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-4">
      <nav className="space-y-1 rounded-2xl border border-border bg-card p-3">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition ${
              activeTab === tab.id
                ? "bg-teal text-white"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </nav>

      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm md:col-span-3">
        {activeTab === "profile" && (
          <div className="space-y-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="h-24 w-24 overflow-hidden rounded-2xl border border-border bg-muted">
                {initial.profile.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={initial.profile.avatarUrl}
                    alt={initial.profile.fullName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-2xl font-bold">
                    {initial.profile.firstName[0]}{initial.profile.lastName[0]}
                  </div>
                )}
              </div>
              <div>
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-primary-indigo px-4 py-2 text-sm font-semibold text-white hover:bg-primary-indigo/90 transition">
                  <Camera className="h-4 w-4" />
                  {uploadAvatar.isPending ? "Uploading Image..." : "Upload Profile Photo"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploadAvatar.isPending}
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) uploadAvatar.mutate(file);
                      event.currentTarget.value = "";
                    }}
                  />
                </label>
                <p className="mt-2 text-xs text-muted-foreground">
                  JPG, PNG, WEBP, or GIF. Maximum size 5 MB.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="First name" value={profile.firstName} onChange={(value) => setProfile({ ...profile, firstName: value })} />
              <Field label="Last name" value={profile.lastName} onChange={(value) => setProfile({ ...profile, lastName: value })} />
              <Field label="Phone" value={profile.phone} onChange={(value) => setProfile({ ...profile, phone: value })} />
              <Field label="Email" value={initial.profile.email} disabled />
              <Field label="Role" value={initial.profile.role.replaceAll("_", " ")} disabled />
              <Field label="Timezone" value={initial.profile.timezone} disabled />
            </div>
          </div>
        )}

        {activeTab === "organization" && canManageOrganization && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Company name" value={organization.companyName} onChange={(value) => setOrganization({ ...organization, companyName: value })} />
            <Field label="Tax / GST ID" value={organization.taxId} onChange={(value) => setOrganization({ ...organization, taxId: value })} />
            <Field label="Company email" value={organization.email} onChange={(value) => setOrganization({ ...organization, email: value })} />
            <Field label="Company phone" value={organization.phone} onChange={(value) => setOrganization({ ...organization, phone: value })} />
            <Field label="Timezone" value={organization.timezone} onChange={(value) => setOrganization({ ...organization, timezone: value })} />
            <Field label="Country" value={organization.country} onChange={(value) => setOrganization({ ...organization, country: value })} />
          </div>
        )}

        {activeTab === "roles" && (
          <div className="space-y-6">
            <div className="rounded-xl border border-border p-5 bg-card">
              <h3 className="text-sm font-bold text-foreground mb-1">Create Custom Role</h3>
              <p className="text-xs text-muted-foreground mb-4">
                Define specialized job roles for workspace members with custom titles.
              </p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (newRoleName.trim()) createRoleMutation.mutate();
                }}
                className="grid gap-3 sm:grid-cols-2"
              >
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Role Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lead Designer"
                    value={newRoleName}
                    onChange={(e) => setNewRoleName(e.target.value)}
                    className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Description (optional)</label>
                  <input
                    type="text"
                    placeholder="Brief description of responsibilities"
                    value={newRoleDesc}
                    onChange={(e) => setNewRoleDesc(e.target.value)}
                    className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="sm:col-span-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={!newRoleName.trim() || createRoleMutation.isPending}
                    className="inline-flex items-center gap-2 rounded-xl bg-primary-indigo px-4 py-2 text-xs font-semibold text-white hover:bg-primary-indigo/90 disabled:opacity-50"
                  >
                    {createRoleMutation.isPending ? "Creating Role..." : "+ Create Custom Role"}
                  </button>
                </div>
              </form>
            </div>

            <div className="rounded-xl border border-border p-5 bg-card space-y-4">
              <h3 className="text-sm font-bold text-foreground">Workspace Roles</h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  { name: "Super Admin", type: "System", desc: "Full administrative access to all systems" },
                  { name: "Organization Owner", type: "System", desc: "Workspace billing & organization owner" },
                  { name: "Admin", type: "System", desc: "Full administrative access to workspace settings" },
                  { name: "HR", type: "System", desc: "Human resources & employee management" },
                  { name: "Manager", type: "System", desc: "Team & project management access" },
                  { name: "Team Lead", type: "System", desc: "Team coordination & task assignments" },
                  { name: "Employee", type: "System", desc: "Standard employee portal access" },
                  { name: "Finance", type: "System", desc: "Financials, invoices, and payroll access" },
                  { name: "Sales", type: "System", desc: "CRM, leads, and client deals management" },
                  { name: "Support", type: "System", desc: "Customer support ticket desk access" },
                  ...(rolesData?.customRoles || []).map((cr) => ({
                    name: cr.name,
                    type: "Custom",
                    desc: cr.description || "Custom workspace role",
                  })),
                ].map((r, i) => (
                  <div key={i} className="p-3.5 rounded-xl border border-border bg-background space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-foreground">{r.name}</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          r.type === "System"
                            ? "bg-slate-100 dark:bg-slate-800 text-muted-foreground"
                            : "bg-primary-indigo/10 text-primary-indigo font-bold"
                        }`}
                      >
                        {r.type}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground line-clamp-2">{r.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {(uploadAvatar.error || save.error) && (
          <p className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-700">
            {uploadAvatar.error?.message ?? "Unable to save these settings."}
          </p>
        )}
        {message && (
          <p className="mt-5 flex items-center gap-2 text-sm font-medium text-emerald-600">
            <Check className="h-4 w-4" /> {message}
          </p>
        )}
        {activeTab !== "security" && (
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={() => save.mutate()}
              disabled={save.isPending || uploadAvatar.isPending}
              className="inline-flex items-center gap-2 rounded-xl bg-teal px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {save.isPending ? "Saving…" : "Save Changes"}
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <label className="space-y-1.5 text-xs font-medium text-muted-foreground">
      {label}
      <input
        value={value}
        disabled={disabled}
        onChange={(event) => onChange?.(event.target.value)}
        className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary disabled:bg-muted disabled:text-muted-foreground"
      />
    </label>
  );
}
